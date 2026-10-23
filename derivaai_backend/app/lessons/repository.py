import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError
from app.lessons.models import LessonModel
from app.lessons.schemas import LessonCreate, LessonUpdate


class LessonRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, lesson_id: uuid.UUID) -> LessonModel | None:
        return await self.session.get(LessonModel, lesson_id)

    async def list(self, offset: int, limit: int) -> list[LessonModel]:
        result = await self.session.scalars(
            select(LessonModel).order_by(LessonModel.created_at).offset(offset).limit(limit)
        )
        return list(result)

    async def create(self, payload: LessonCreate) -> LessonModel:
        lesson = LessonModel(**payload.model_dump())
        self.session.add(lesson)
        await self._commit_or_raise_conflict(payload.slug)
        await self.session.refresh(lesson)
        return lesson

    async def update(self, lesson: LessonModel, payload: LessonUpdate) -> LessonModel:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(lesson, field, value)
        await self._commit_or_raise_conflict(lesson.slug)
        await self.session.refresh(lesson)
        return lesson

    async def delete(self, lesson: LessonModel) -> None:
        await self.session.delete(lesson)
        await self.session.commit()

    async def _commit_or_raise_conflict(self, slug: str) -> None:
        try:
            await self.session.commit()
        except IntegrityError as exc:
            await self.session.rollback()
            raise ConflictError(f"A lesson with slug {slug!r} already exists") from exc
