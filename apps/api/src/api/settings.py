from typing import List
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_PATH = Path(__file__).resolve().parents[2] / ".env"

class Settings(BaseSettings):
    # REQUIRED: direct station_information URL
    STATION_INFO_URL: str

    # Simple cache & HTTP knobs
    STATION_INFO_TTL_SECONDS: int = 21600  # 6h
    HTTPX_TIMEOUT_SECONDS: float = 15.0

    # CORS (tighten in prod)
    CORS_ALLOW_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding="utf-8",
    )

settings = Settings()

