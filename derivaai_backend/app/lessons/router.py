import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.core.dependencies import DbSession, PaginationDep
from app.lessons.repository import LessonRepository
from app.lessons.schemas import LessonCreate, LessonRead, LessonUpdate
from app.lessons.service import LessonService


def get_lesson_service(db: DbSession) -> LessonService:
    return LessonService(LessonRepository(db))


LessonServiceDep = Annotated[LessonService, Depends(get_lesson_service)]

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.post("/", response_model=LessonRead, status_code=status.HTTP_201_CREATED, summary="Create a lesson")
async def create_lesson(payload: LessonCreate, service: LessonServiceDep) -> LessonRead:
    return await service.create(payload)


@router.get("/", response_model=list[LessonRead], status_code=status.HTTP_200_OK, summary="List lessons")
async def list_lessons(service: LessonServiceDep, page: PaginationDep) -> list[LessonRead]:
    return await service.list(page.offset, page.limit)


@router.get("/{lesson_id}", response_model=LessonRead, status_code=status.HTTP_200_OK, summary="Get a lesson")
async def get_lesson(lesson_id: uuid.UUID, service: LessonServiceDep) -> LessonRead:
    return await service.get(lesson_id)


@router.patch("/{lesson_id}", response_model=LessonRead, status_code=status.HTTP_200_OK, summary="Update a lesson")
async def update_lesson(lesson_id: uuid.UUID, payload: LessonUpdate, service: LessonServiceDep) -> LessonRead:
    return await service.update(lesson_id, payload)


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a lesson")
async def delete_lesson(lesson_id: uuid.UUID, service: LessonServiceDep) -> None:
    await service.delete(lesson_id)
