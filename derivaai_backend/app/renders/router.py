import uuid
from collections.abc import Callable
from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.core.dependencies import DbSession, PaginationDep
from app.pipelines.repository import PipelineRepository
from app.renders.repository import RenderRepository
from app.renders.schemas import RenderCreate, RenderRead
from app.renders.service import RenderService
from app.workers.dispatch import enqueue_render


def get_render_enqueuer() -> Callable[[uuid.UUID], None]:
    return enqueue_render


def get_render_service(
    db: DbSession, enqueue: Annotated[Callable[[uuid.UUID], None], Depends(get_render_enqueuer)]
) -> RenderService:
    return RenderService(RenderRepository(db), PipelineRepository(db), enqueue)


RenderServiceDep = Annotated[RenderService, Depends(get_render_service)]

router = APIRouter(prefix="/renders", tags=["renders"])


@router.post("/", response_model=RenderRead, status_code=status.HTTP_202_ACCEPTED, summary="Queue a pipeline render")
async def create_render(payload: RenderCreate, service: RenderServiceDep) -> RenderRead:
    return await service.create(payload)


@router.get("/", response_model=list[RenderRead], status_code=status.HTTP_200_OK, summary="List renders")
async def list_renders(
    service: RenderServiceDep,
    page: PaginationDep,
    status_filter: str | None = None,
    pipeline_id: uuid.UUID | None = None,
) -> list[RenderRead]:
    return await service.list(page.offset, page.limit, status_filter, pipeline_id)


@router.get("/{render_id}", response_model=RenderRead, status_code=status.HTTP_200_OK, summary="Get a render")
async def get_render(render_id: uuid.UUID, service: RenderServiceDep) -> RenderRead:
    return await service.get(render_id)
