import pytest
from pydantic import ValidationError

from app.settings.config import Settings


def test_database_url_is_built_from_parts_and_quotes_credentials() -> None:
    s = Settings(
        database_user="a b", database_password="p@ss/word", database_host="h", database_port=1
    )
    assert s.database_url == "postgresql+asyncpg://a%20b:p%40ss%2Fword@h:1/derivaai"


def test_legacy_database_url_rejected_outside_development(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://x")
    Settings(environment="development")
    with pytest.raises(ValidationError):
        Settings(environment="staging")
