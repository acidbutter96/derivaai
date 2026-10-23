import uuid

from app.assets.models import AssetModel
from app.assets.repository import AssetRepository
from app.assets.schemas import AssetCreate, AssetUpdate
from app.core.decorators import log_errors
from app.core.exceptions import NotFoundError


@log_errors
class AssetService:
    def __init__(self, repository: AssetRepository):
        self.repository = repository

    async def get(self, asset_id: uuid.UUID) -> AssetModel:
        asset = await self.repository.get(asset_id)
        if asset is None:
            raise NotFoundError(f"Asset {asset_id} not found")
        return asset

    async def list(self, offset: int, limit: int, render_id: uuid.UUID | None = None) -> list[AssetModel]:
        return await self.repository.list(offset, limit, render_id)

    async def create(self, payload: AssetCreate) -> AssetModel:
        return await self.repository.create(payload)

    async def update(self, asset_id: uuid.UUID, payload: AssetUpdate) -> AssetModel:
        asset = await self.get(asset_id)
        return await self.repository.update(asset, payload)

    async def delete(self, asset_id: uuid.UUID) -> None:
        asset = await self.get(asset_id)
        await self.repository.delete(asset)
