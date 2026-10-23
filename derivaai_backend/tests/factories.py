from app.lessons.schemas import LessonCreate
from app.pipelines.schemas import PipelineCreate


def make_pipeline(**overrides) -> PipelineCreate:
    return PipelineCreate(**{"name": "rc-circuit", **overrides})


def make_lesson(**overrides) -> LessonCreate:
    return LessonCreate(**{"slug": "rc-circuit-charging", "title": "RC circuit charging", **overrides})
