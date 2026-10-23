import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Language = Literal["pt-BR", "en"]
LessonStatus = Literal["draft", "rendering", "ready", "failed"]


class LessonCreate(BaseModel):
    slug: str = Field(min_length=1, max_length=120, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=1, max_length=200)
    language: Language = "pt-BR"
    pipeline_id: uuid.UUID | None = None


class LessonUpdate(BaseModel):
    slug: str | None = Field(default=None, min_length=1, max_length=120, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str | None = Field(default=None, min_length=1, max_length=200)
    language: Language | None = None
    status: LessonStatus | None = None
    pipeline_id: uuid.UUID | None = None


class LessonRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    language: str
    status: str
    pipeline_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
