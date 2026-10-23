import pytest

from app.workers.executor import CycleError, UnknownNodeTypeError, execute_graph, topological_order


def graph(nodes, edges):
    return {
        "nodes": [{"id": i, "type": "passthrough", "data": {"v": i}} for i in nodes],
        "edges": [{"source": s, "target": t} for s, t in edges],
    }


def test_topological_order_respects_edges():
    g = graph(["c", "a", "b"], [("a", "b"), ("b", "c")])
    assert topological_order(g["nodes"], g["edges"]) == ["a", "b", "c"]


def test_cycle_is_detected():
    g = graph(["a", "b"], [("a", "b"), ("b", "a")])
    with pytest.raises(CycleError):
        execute_graph(g)


def test_unknown_node_type_raises():
    with pytest.raises(UnknownNodeTypeError):
        execute_graph({"nodes": [{"id": "a", "type": "nope"}], "edges": []})


def test_outputs_flow_downstream_and_progress_reported():
    seen: list[int] = []
    out = execute_graph(graph(["a", "b"], [("a", "b")]), on_progress=seen.append)
    assert out["b"] == {"v": "b"}
    assert seen == [50, 100]
