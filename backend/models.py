from sqlalchemy import Column, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Mapping(Base):
    __tablename__ = 'mappings'
    id = Column(UUID(as_uuid=True), primary_key=True)
    video_url = Column(String)
    audio_url = Column(String)
    lang = Column(String)