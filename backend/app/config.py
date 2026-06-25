import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-academia-crm-key-change-in-prod")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = "academia_crm"
    
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
