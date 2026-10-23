import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class NodeTypeModel(Base):
    """Catalog entry for a node type usable in pipelines (e.g. sympy.solve, manim.scene, tts.narrate)."""

    __tablename__ = "node_types"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    key: Mapped[str] = mapped_column(unique=True, index=True)
    name: Mapped[str]
    category: Mapped[str] = mapped_column(index=True)
    description: Mapped[str | None] = mapped_column(default=None)
    inputs: Mapped[list] = mapped_column(JSON, default=list)
    outputs: Mapped[list] = mapped_column(JSON, default=list)
    config_schema: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
