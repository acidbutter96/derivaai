import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.assets.repository import AssetRepository
from app.assets.schemas import AssetCreate, AssetRead, AssetUpdate
from app.assets.service import AssetService
from app.core.dependencies import DbSession, PaginationDep


def get_asset_service(db: DbSession) -> AssetService:
    return AssetService(AssetRepository(db))


AssetServiceDep = Annotated[AssetService, Depends(get_asset_service)]

router = APIRouter(prefix="/assets", tags=["assets"])


@router.post("/", response_model=AssetRead, status_code=status.HTTP_201_CREATED, summary="Register an asset")
async def create_asset(payload: AssetCreate, service: AssetServiceDep) -> AssetRead:
    return await service.create(payload)


@router.get("/", response_model=list[AssetRead], status_code=status.HTTP_200_OK, summary="List assets")
async def list_assets(
    service: AssetServiceDep, page: PaginationDep, render_id: uuid.UUID | None = None
) -> list[AssetRead]:
    return await service.list(page.offset, page.limit, render_id)


@router.get("/{asset_id}", response_model=AssetRead, status_code=status.HTTP_200_OK, summary="Get an asset")
async def get_asset(asset_id: uuid.UUID, service: AssetServiceDep) -> AssetRead:
    return await service.get(asset_id)


@router.patch("/{asset_id}", response_model=AssetRead, status_code=status.HTTP_200_OK, summary="Update an asset")
async def update_asset(asset_id: uuid.UUID, payload: AssetUpdate, service: AssetServiceDep) -> AssetRead:
    return await service.update(asset_id, payload)


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an asset")
async def delete_asset(asset_id: uuid.UUID, service: AssetServiceDep) -> None:
    await service.delete(asset_id)
