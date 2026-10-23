import uuid

from app.core.decorators import log_errors
from app.core.exceptions import NotFoundError
from app.pipelines.models import PipelineModel
from app.pipelines.repository import PipelineRepository
from app.pipelines.schemas import PipelineCreate, PipelineUpdate


@log_errors
class PipelineService:
    def __init__(self, repository: PipelineRepository):
        self.repository = repository

    async def get(self, pipeline_id: uuid.UUID) -> PipelineModel:
        pipeline = await self.repository.get(pipeline_id)
        if pipeline is None:
            raise NotFoundError(f"Pipeline {pipeline_id} not found")
        return pipeline

    async def list(self, offset: int, limit: int) -> list[PipelineModel]:
        return await self.repository.list(offset, limit)

    async def create(self, payload: PipelineCreate) -> PipelineModel:
        return await self.repository.create(payload)

    async def update(self, pipeline_id: uuid.UUID, payload: PipelineUpdate) -> PipelineModel:
        pipeline = await self.get(pipeline_id)
        return await self.repository.update(pipeline, payload)

    async def delete(self, pipeline_id: uuid.UUID) -> None:
        pipeline = await self.get(pipeline_id)
        await self.repository.delete(pipeline)
