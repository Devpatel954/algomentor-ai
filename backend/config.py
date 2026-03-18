from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    MISTRAL_API_KEY: str = ""
    ORG_ID: str = "7ef69b7b-5abd-44d8-b8a9-8a1ff4de1936"
    APP_ENV: str = "development"
    FRONTEND_URL: str = ""   # set in Render dashboard e.g. https://algomentor.vercel.app

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # silently drop unknown env vars (e.g. old JWT settings)


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
