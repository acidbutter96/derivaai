import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.assets.models import AssetModel
from app.assets.schemas import AssetCreate, AssetUpdate
from app.core.exceptions import ConflictError


class AssetRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, asset_id: uuid.UUID) -> AssetModel | None:
        return await self.session.get(AssetModel, asset_id)

    async def list(self, offset: int, limit: int, render_id: uuid.UUID | None = None) -> list[AssetModel]:
        query = select(AssetModel).order_by(AssetModel.created_at).offset(offset).limit(limit)
        if render_id:
            query = query.where(AssetModel.render_id == render_id)
        return list(await self.session.scalars(query))

    async def create(self, payload: AssetCreate) -> AssetModel:
        asset = AssetModel(**payload.model_dump())
        self.session.add(asset)
        await self._commit_or_raise_conflict(payload.uri)
        await self.session.refresh(asset)
        return asset

    async def update(self, asset: AssetModel, payload: AssetUpdate) -> AssetModel:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(asset, field, value)
        await self._commit_or_raise_conflict(asset.uri)
        await self.session.refresh(asset)
        return asset

    async def delete(self, asset: AssetModel) -> None:
        await self.session.delete(asset)
        await self.session.commit()

    async def _commit_or_raise_conflict(self, uri: str) -> None:
        try:
            await self.session.commit()
        except IntegrityError as exc:
            await self.session.rollback()
            raise ConflictError(f"An asset with uri {uri!r} already exists") from exc
