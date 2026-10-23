import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

RenderStatus = Literal["queued", "running", "succeeded", "failed"]


class RenderCreate(BaseModel):
    pipeline_id: uuid.UUID
    lesson_id: uuid.UUID | None = None


class RenderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    pipeline_id: uuid.UUID
    lesson_id: uuid.UUID | None
    status: RenderStatus
    progress: int
    error: str | None
    started_at: datetime | None
    finished_at: datetime | None
    created_at: datetime
