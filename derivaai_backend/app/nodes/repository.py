import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError
from app.nodes.models import NodeTypeModel
from app.nodes.schemas import NodeTypeCreate, NodeTypeUpdate


class NodeTypeRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, node_type_id: uuid.UUID) -> NodeTypeModel | None:
        return await self.session.get(NodeTypeModel, node_type_id)

    async def list(self, offset: int, limit: int, category: str | None = None) -> list[NodeTypeModel]:
        query = select(NodeTypeModel).order_by(NodeTypeModel.key).offset(offset).limit(limit)
        if category:
            query = query.where(NodeTypeModel.category == category)
        return list(await self.session.scalars(query))

    async def create(self, payload: NodeTypeCreate) -> NodeTypeModel:
        node_type = NodeTypeModel(**payload.model_dump())
        self.session.add(node_type)
        await self._commit_or_raise_conflict(payload.key)
        await self.session.refresh(node_type)
        return node_type

    async def update(self, node_type: NodeTypeModel, payload: NodeTypeUpdate) -> NodeTypeModel:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(node_type, field, value)
        await self._commit_or_raise_conflict(node_type.key)
        await self.session.refresh(node_type)
        return node_type

    async def delete(self, node_type: NodeTypeModel) -> None:
        await self.session.delete(node_type)
        await self.session.commit()

    async def _commit_or_raise_conflict(self, key: str) -> None:
        try:
            await self.session.commit()
        except IntegrityError as exc:
            await self.session.rollback()
            raise ConflictError(f"A node type with key {key!r} already exists") from exc
