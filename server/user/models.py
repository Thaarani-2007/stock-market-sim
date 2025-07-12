import sqlmodel as sql
import bcrypt, uuid
from data.db import BaseModel, BaseTimestampModel

class User(BaseModel, table=True):
    username: str = sql.Field(unique=True)
    password: str
    balance: float

    def __init__(self, username: str, password: str, balance: float):
        hashed_pass = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        super().__init__(username=username, password=hashed_pass, balance=balance) # type: ignore

    def verify(self, password: str): return bcrypt.checkpw(password.encode(), self.password.encode())


class Transaction(BaseTimestampModel, table=True):
    num_units: int
    price: float
    stock: uuid.UUID = sql.Field(foreign_key='stock.uid', ondelete='CASCADE')
    user: uuid.UUID = sql.Field(foreign_key='user.uid', ondelete='CASCADE')



class Holding(BaseModel, table=True):
    stock: uuid.UUID = sql.Field(foreign_key='stock.uid', ondelete='CASCADE')
    user: uuid.UUID = sql.Field(foreign_key='user.uid', ondelete='CASCADE')
    amount: float