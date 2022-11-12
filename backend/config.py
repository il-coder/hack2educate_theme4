from pydantic import BaseSettings
class Settings(BaseSettings):
    DETA_KEY: str

    class Config:
        env_file = ".env"