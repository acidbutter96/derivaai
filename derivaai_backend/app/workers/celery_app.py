from celery import Celery

from app.settings.config import settings

celery_app = Celery(
    "derivaai",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.workers.tasks"],
)
celery_app.conf.task_always_eager = settings.celery_task_always_eager
# Default queue is "celery"; on the shared Redis that would collide with other apps' workers.
celery_app.conf.task_default_queue = settings.redis_queue_name
