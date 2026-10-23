from fastapi import FastAPI

from app.assets.router import router as assets_router
from app.core.exceptions import register_exception_handlers
from app.lessons.router import router as lessons_router
from app.nodes.router import router as nodes_router
from app.pipelines.router import router as pipelines_router
from app.renders.router import router as renders_router
from app.settings.config import settings
from app.settings.logging_config import setup_logging
from app.settings.middleware import register_middleware

setup_logging(settings.log_level)

app = FastAPI(title="DerivaAI API")
register_middleware(app)
register_exception_handlers(app)
app.include_router(pipelines_router)
app.include_router(lessons_router)
app.include_router(nodes_router)
app.include_router(renders_router)
app.include_router(assets_router)


@app.get("/health", tags=["meta"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
