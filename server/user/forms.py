from pydantic import BaseModel, fields

class LoginForm(BaseModel):
    username: str
    password: str