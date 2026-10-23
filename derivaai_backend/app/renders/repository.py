import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.renders.models import RenderModel
from app.renders.schemas import RenderCreate


class RenderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, render_id: uuid.UUID) -> RenderModel | None:
        return await self.session.get(RenderModel, render_id)

    async def list(
        self, offset: int, limit: int, status: str | None = None, pipeline_id: uuid.UUID | None = None
    ) -> list[RenderModel]:
        query = select(RenderModel).order_by(RenderModel.created_at.desc()).offset(offset).limit(limit)
        if status:
            query = query.where(RenderModel.status == status)
        if pipeline_id:
            query = query.where(RenderModel.pipeline_id == pipeline_id)
        return list(await self.session.scalars(query))

    async def create(self, payload: RenderCreate) -> RenderModel:
        render = RenderModel(**payload.model_dump())
        self.session.add(render)
        await self.session.commit()
        await self.session.refresh(render)
        return render

    async def update_state(self, render: RenderModel, **fields: Any) -> RenderModel:
        for field, value in fields.items():
            setattr(render, field, value)
        await self.session.commit()
        await self.session.refresh(render)
        return render
