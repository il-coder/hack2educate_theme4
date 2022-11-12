from pydantic import BaseSettings
class Settings(BaseSettings):
    DETA_KEY: str
    DATABASE_URL: str

    class Config:
        env_file = ".env"