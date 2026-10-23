import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class PipelineGraph(BaseModel):
    nodes: list[dict[str, Any]] = Field(default_factory=list)
    edges: list[dict[str, Any]] = Field(default_factory=list)


class PipelineCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    graph: PipelineGraph = Field(default_factory=PipelineGraph)


class PipelineUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    graph: PipelineGraph | None = None


class PipelineRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    graph: PipelineGraph
    created_at: datetime
    updated_at: datetime
