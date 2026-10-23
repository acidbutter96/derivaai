import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

AssetKind = Literal["image", "audio", "video", "data"]


class AssetCreate(BaseModel):
    uri: str = Field(min_length=1)
    kind: AssetKind
    mime_type: str
    size_bytes: int = Field(default=0, ge=0)
    render_id: uuid.UUID | None = None


class AssetUpdate(BaseModel):
    uri: str | None = Field(default=None, min_length=1)
    kind: AssetKind | None = None
    mime_type: str | None = None
    size_bytes: int | None = Field(default=None, ge=0)


class AssetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    uri: str
    kind: str
    mime_type: str
    size_bytes: int
    render_id: uuid.UUID | None
    created_at: datetime
