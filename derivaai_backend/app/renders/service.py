import uuid
from collections.abc import Callable

from app.core.decorators import log_errors
from app.core.exceptions import NotFoundError
from app.pipelines.repository import PipelineRepository
from app.renders.models import RenderModel
from app.renders.repository import RenderRepository
from app.renders.schemas import RenderCreate


@log_errors
class RenderService:
    """Creates render jobs and hands them to the queue. `enqueue` is injected so tests need no broker."""

    def __init__(
        self,
        repository: RenderRepository,
        pipelines: PipelineRepository,
        enqueue: Callable[[uuid.UUID], None],
    ):
        self.repository = repository
        self.pipelines = pipelines
        self.enqueue = enqueue

    async def get(self, render_id: uuid.UUID) -> RenderModel:
        render = await self.repository.get(render_id)
        if render is None:
            raise NotFoundError(f"Render {render_id} not found")
        return render

    async def list(
        self, offset: int, limit: int, status: str | None = None, pipeline_id: uuid.UUID | None = None
    ) -> list[RenderModel]:
        return await self.repository.list(offset, limit, status, pipeline_id)

    async def create(self, payload: RenderCreate) -> RenderModel:
        if await self.pipelines.get(payload.pipeline_id) is None:
            raise NotFoundError(f"Pipeline {payload.pipeline_id} not found")
        render = await self.repository.create(payload)
        self.enqueue(render.id)
        return render
