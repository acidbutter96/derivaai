import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PipelineModel(Base):
    """A node-editor pipeline (React Flow graph: nodes + edges)."""

    __tablename__ = "pipelines"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(unique=True, index=True)
    description: Mapped[str | None] = mapped_column(default=None)
    graph: Mapped[dict] = mapped_column(JSON, default=lambda: {"nodes": [], "edges": []})
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
