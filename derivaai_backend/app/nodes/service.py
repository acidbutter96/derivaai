import uuid

from app.core.decorators import log_errors
from app.core.exceptions import NotFoundError
from app.nodes.models import NodeTypeModel
from app.nodes.repository import NodeTypeRepository
from app.nodes.schemas import NodeTypeCreate, NodeTypeUpdate


@log_errors
class NodeTypeService:
    def __init__(self, repository: NodeTypeRepository):
        self.repository = repository

    async def get(self, node_type_id: uuid.UUID) -> NodeTypeModel:
        node_type = await self.repository.get(node_type_id)
        if node_type is None:
            raise NotFoundError(f"Node type {node_type_id} not found")
        return node_type

    async def list(self, offset: int, limit: int, category: str | None = None) -> list[NodeTypeModel]:
        return await self.repository.list(offset, limit, category)

    async def create(self, payload: NodeTypeCreate) -> NodeTypeModel:
        return await self.repository.create(payload)

    async def update(self, node_type_id: uuid.UUID, payload: NodeTypeUpdate) -> NodeTypeModel:
        node_type = await self.get(node_type_id)
        return await self.repository.update(node_type, payload)

    async def delete(self, node_type_id: uuid.UUID) -> None:
        node_type = await self.get(node_type_id)
        await self.repository.delete(node_type)
