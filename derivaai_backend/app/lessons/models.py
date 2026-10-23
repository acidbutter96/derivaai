import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class LessonModel(Base):
    """A narrated lesson. pipeline_id is optional: pipelines are free-form."""

    __tablename__ = "lessons"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(unique=True, index=True)
    title: Mapped[str]
    language: Mapped[str] = mapped_column(default="pt-BR")
    status: Mapped[str] = mapped_column(default="draft")
    pipeline_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("pipelines.id", ondelete="SET NULL"), default=None
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
