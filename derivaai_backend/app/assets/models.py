import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AssetModel(Base):
    """A produced or uploaded file (plot, animation, narration audio, final lesson video)."""

    __tablename__ = "assets"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    uri: Mapped[str] = mapped_column(unique=True, index=True)
    kind: Mapped[str] = mapped_column(index=True)
    mime_type: Mapped[str]
    size_bytes: Mapped[int] = mapped_column(default=0)
    render_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("renders.id", ondelete="SET NULL"), default=None
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
