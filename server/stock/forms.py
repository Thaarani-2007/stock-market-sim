from pydantic import BaseModel

class AdminForm(BaseModel):
    username: str
    password: str

class TransactForm(BaseModel):
    units: int