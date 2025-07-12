import sqlmodel as sql
import os, uuid, pytz
from datetime import datetime

engine = sql.create_engine(os.environ['DB_URL'])

class BaseModel(sql.SQLModel):
    uid: uuid.UUID = sql.Field(default_factory=uuid.uuid4, primary_key=True)

    def save(self, session: sql.Session):
        session.add(self)
        session.commit()

    def remove(self, session: sql.Session):
        session.delete(self)
        session.commit()


class BaseTimestampModel(BaseModel):
    timestamp: datetime = sql.Field(default_factory=lambda: datetime.now(pytz.timezone('Asia/Kolkata')))



def get_session():
    with sql.Session(engine) as session:
        yield session


