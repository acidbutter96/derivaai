import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.core.dependencies import DbSession, PaginationDep
from app.pipelines.repository import PipelineRepository
from app.pipelines.schemas import PipelineCreate, PipelineRead, PipelineUpdate
from app.pipelines.service import PipelineService


def get_pipeline_service(db: DbSession) -> PipelineService:
    return PipelineService(PipelineRepository(db))


PipelineServiceDep = Annotated[PipelineService, Depends(get_pipeline_service)]

router = APIRouter(prefix="/pipelines", tags=["pipelines"])


@router.post("/", response_model=PipelineRead, status_code=status.HTTP_201_CREATED, summary="Create a pipeline")
async def create_pipeline(payload: PipelineCreate, service: PipelineServiceDep) -> PipelineRead:
    return await service.create(payload)


@router.get("/", response_model=list[PipelineRead], status_code=status.HTTP_200_OK, summary="List pipelines")
async def list_pipelines(service: PipelineServiceDep, page: PaginationDep) -> list[PipelineRead]:
    return await service.list(page.offset, page.limit)


@router.get("/{pipeline_id}", response_model=PipelineRead, status_code=status.HTTP_200_OK, summary="Get a pipeline")
async def get_pipeline(pipeline_id: uuid.UUID, service: PipelineServiceDep) -> PipelineRead:
    return await service.get(pipeline_id)


@router.patch("/{pipeline_id}", response_model=PipelineRead, status_code=status.HTTP_200_OK, summary="Update a pipeline")
async def update_pipeline(
    pipeline_id: uuid.UUID, payload: PipelineUpdate, service: PipelineServiceDep
) -> PipelineRead:
    return await service.update(pipeline_id, payload)


@router.delete("/{pipeline_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a pipeline")
async def delete_pipeline(pipeline_id: uuid.UUID, service: PipelineServiceDep) -> None:
    await service.delete(pipeline_id)
