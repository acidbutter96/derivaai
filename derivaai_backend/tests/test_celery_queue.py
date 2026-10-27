from app.settings.config import settings
from app.workers.celery_app import celery_app


def test_renders_use_a_dedicated_queue_on_the_shared_redis() -> None:
    assert celery_app.conf.task_default_queue == settings.redis_queue_name != "celery"
