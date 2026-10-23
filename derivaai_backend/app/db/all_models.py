"""Imports every domain's models so Base.metadata sees all tables (Alembic autogenerate)."""
from app.assets import models as assets_models  # noqa: F401
from app.lessons import models as lessons_models  # noqa: F401
from app.nodes import models as nodes_models  # noqa: F401
from app.pipelines import models as pipelines_models  # noqa: F401
from app.renders import models as renders_models  # noqa: F401
