import asyncio
import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

import app.db.all_models  # noqa: F401  (worker skips the routers; FKs need every table registered)
from app.pipelines.repository import PipelineRepository
from app.renders.repository import RenderRepository
from app.settings.config import settings
from app.workers.celery_app import celery_app
from app.workers.executor import execute_graph


async def _run(render_id: uuid.UUID) -> None:
    # Fresh engine per task: asyncio.run creates a new loop each time, so pooled connections can't be reused.
    engine = create_async_engine(settings.database_url, poolclass=NullPool)
    try:
        async with async_sessionmaker(engine, expire_on_commit=False)() as session:
            renders = RenderRepository(session)
            render = await renders.get(render_id)
            if render is None:
                return
            await renders.update_state(render, status="running", started_at=datetime.now(UTC))
            pipeline = await PipelineRepository(session).get(render.pipeline_id)
            try:
                if pipeline is None:
                    raise ValueError(f"Pipeline {render.pipeline_id} not found")
                execute_graph(pipeline.graph)
            except Exception as exc:
                await renders.update_state(
                    render, status="failed", error=str(exc), finished_at=datetime.now(UTC)
                )
                return
            await renders.update_state(
                render, status="succeeded", progress=100, finished_at=datetime.now(UTC)
            )
    finally:
        await engine.dispose()


@celery_app.task(name="app.workers.tasks.run_render")
def run_render(render_id: str) -> None:
    asyncio.run(_run(uuid.UUID(render_id)))
