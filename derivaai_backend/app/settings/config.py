import os
from typing import Literal
from urllib.parse import quote

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: Literal["development", "staging", "preprod", "production"] = "development"
    debug: bool = False
    log_level: str = "INFO"

    # One Postgres per environment (devbutter_app ADR-0008): shared instance, own database + role.
    database_host: str = "localhost"
    database_port: int = 5436
    database_user: str = "derivaai"
    database_password: str = "derivaai"
    database_name: str = "derivaai"

    redis_url: str = "redis://localhost:6379/0"
    celery_task_always_eager: bool = False
    storage_dir: str = "./storage"

    @property
    def database_url(self) -> str:
        user = quote(self.database_user, safe="")
        password = quote(self.database_password, safe="")
        return (
            f"postgresql+asyncpg://{user}:{password}"
            f"@{self.database_host}:{self.database_port}/{self.database_name}"
        )

    @model_validator(mode="after")
    def reject_legacy_database_url_outside_dev(self) -> "Settings":
        if self.environment != "development" and os.environ.get("DATABASE_URL"):
            raise ValueError(
                "DATABASE_URL is no longer read; set DATABASE_HOST, DATABASE_PORT, "
                "DATABASE_USER, DATABASE_PASSWORD and DATABASE_NAME"
            )
        return self


settings = Settings()
