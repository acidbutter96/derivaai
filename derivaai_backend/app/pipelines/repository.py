import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError
from app.pipelines.models import PipelineModel
from app.pipelines.schemas import PipelineCreate, PipelineUpdate


class PipelineRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, pipeline_id: uuid.UUID) -> PipelineModel | None:
        return await self.session.get(PipelineModel, pipeline_id)

    async def list(self, offset: int, limit: int) -> list[PipelineModel]:
        result = await self.session.scalars(
            select(PipelineModel).order_by(PipelineModel.created_at).offset(offset).limit(limit)
        )
        return list(result)

    async def create(self, payload: PipelineCreate) -> PipelineModel:
        pipeline = PipelineModel(**payload.model_dump())
        self.session.add(pipeline)
        await self._commit_or_raise_conflict(payload.name)
        await self.session.refresh(pipeline)
        return pipeline

    async def update(self, pipeline: PipelineModel, payload: PipelineUpdate) -> PipelineModel:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(pipeline, field, value)
        await self._commit_or_raise_conflict(pipeline.name)
        await self.session.refresh(pipeline)
        return pipeline

    async def delete(self, pipeline: PipelineModel) -> None:
        await self.session.delete(pipeline)
        await self.session.commit()

    async def _commit_or_raise_conflict(self, name: str) -> None:
        try:
            await self.session.commit()
        except IntegrityError as exc:
            await self.session.rollback()
            raise ConflictError(f"A pipeline named {name!r} already exists") from exc
