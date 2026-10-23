import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

NodeCategory = Literal["math", "plot", "animation", "narration", "audio", "video", "io"]


class NodePort(BaseModel):
    name: str
    type: str


class NodeTypeCreate(BaseModel):
    key: str = Field(min_length=1, max_length=120, pattern=r"^[a-z0-9_]+(\.[a-z0-9_]+)*$")
    name: str = Field(min_length=1, max_length=120)
    category: NodeCategory
    description: str | None = None
    inputs: list[NodePort] = Field(default_factory=list)
    outputs: list[NodePort] = Field(default_factory=list)
    config_schema: dict[str, Any] = Field(default_factory=dict)


class NodeTypeUpdate(BaseModel):
    key: str | None = Field(default=None, min_length=1, max_length=120, pattern=r"^[a-z0-9_]+(\.[a-z0-9_]+)*$")
    name: str | None = Field(default=None, min_length=1, max_length=120)
    category: NodeCategory | None = None
    description: str | None = None
    inputs: list[NodePort] | None = None
    outputs: list[NodePort] | None = None
    config_schema: dict[str, Any] | None = None


class NodeTypeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    key: str
    name: str
    category: str
    description: str | None
    inputs: list[NodePort]
    outputs: list[NodePort]
    config_schema: dict[str, Any]
    created_at: datetime
