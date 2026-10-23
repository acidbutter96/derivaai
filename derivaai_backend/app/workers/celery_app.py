from celery import Celery

from app.settings.config import settings

celery_app = Celery(
    "derivaai",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.workers.tasks"],
)
celery_app.conf.task_always_eager = settings.celery_task_always_eager
