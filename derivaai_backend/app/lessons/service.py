import uuid

from app.core.decorators import log_errors
from app.core.exceptions import NotFoundError
from app.lessons.models import LessonModel
from app.lessons.repository import LessonRepository
from app.lessons.schemas import LessonCreate, LessonUpdate


@log_errors
class LessonService:
    def __init__(self, repository: LessonRepository):
        self.repository = repository

    async def get(self, lesson_id: uuid.UUID) -> LessonModel:
        lesson = await self.repository.get(lesson_id)
        if lesson is None:
            raise NotFoundError(f"Lesson {lesson_id} not found")
        return lesson

    async def list(self, offset: int, limit: int) -> list[LessonModel]:
        return await self.repository.list(offset, limit)

    async def create(self, payload: LessonCreate) -> LessonModel:
        return await self.repository.create(payload)

    async def update(self, lesson_id: uuid.UUID, payload: LessonUpdate) -> LessonModel:
        lesson = await self.get(lesson_id)
        return await self.repository.update(lesson, payload)

    async def delete(self, lesson_id: uuid.UUID) -> None:
        lesson = await self.get(lesson_id)
        await self.repository.delete(lesson)
