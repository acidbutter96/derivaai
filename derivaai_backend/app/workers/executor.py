"""Pure pipeline executor: orders a React Flow graph topologically and runs node handlers."""
from collections import defaultdict, deque
from collections.abc import Callable
from typing import Any

Handler = Callable[[dict[str, Any], dict[str, Any]], dict[str, Any]]
HANDLERS: dict[str, Handler] = {}


class PipelineError(Exception):
    pass


class CycleError(PipelineError):
    pass


class UnknownNodeTypeError(PipelineError):
    pass


def node_handler(node_type: str):
    """Registers a handler for a node type, e.g. @node_handler("sympy.solve")."""
    def decorator(func: Handler) -> Handler:
        HANDLERS[node_type] = func
        return func
    return decorator


@node_handler("passthrough")
def _passthrough(data: dict[str, Any], inputs: dict[str, Any]) -> dict[str, Any]:
    return {**inputs, **data}


def topological_order(nodes: list[dict[str, Any]], edges: list[dict[str, Any]]) -> list[str]:
    ids = [n["id"] for n in nodes]
    indegree = dict.fromkeys(ids, 0)
    children: dict[str, list[str]] = defaultdict(list)
    for e in edges:
        children[e["source"]].append(e["target"])
        indegree[e["target"]] += 1
    queue = deque(i for i in ids if indegree[i] == 0)
    order: list[str] = []
    while queue:
        current = queue.popleft()
        order.append(current)
        for child in children[current]:
            indegree[child] -= 1
            if indegree[child] == 0:
                queue.append(child)
    if len(order) != len(ids):
        raise CycleError("Pipeline graph contains a cycle")
    return order


def execute_graph(
    graph: dict[str, Any], on_progress: Callable[[int], None] | None = None
) -> dict[str, dict[str, Any]]:
    nodes = {n["id"]: n for n in graph.get("nodes", [])}
    edges = graph.get("edges", [])
    order = topological_order(list(nodes.values()), edges)
    outputs: dict[str, dict[str, Any]] = {}
    for done, node_id in enumerate(order, start=1):
        node = nodes[node_id]
        handler = HANDLERS.get(node.get("type", ""))
        if handler is None:
            raise UnknownNodeTypeError(f"No handler for node type {node.get('type')!r}")
        inputs: dict[str, Any] = {}
        for e in edges:
            if e["target"] == node_id:
                inputs.update(outputs[e["source"]])
        outputs[node_id] = handler(node.get("data", {}), inputs)
        if on_progress:
            on_progress(int(done * 100 / len(order)))
    return outputs
