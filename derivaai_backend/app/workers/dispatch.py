"""Enqueue helpers. Sends tasks by name so API code never imports task bodies (no import cycles)."""
import uuid

from app.workers.celery_app import celery_app


def enqueue_render(render_id: uuid.UUID) -> None:
    celery_app.send_task("app.workers.tasks.run_render", args=[str(render_id)])
