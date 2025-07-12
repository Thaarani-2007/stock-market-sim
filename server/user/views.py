import os, jwt
import sqlmodel as sql
from fastapi import APIRouter, HTTPException, status, Depends
router = APIRouter()


from . import forms, models
from data.db import get_session


@router.post('/login')
def login(data: forms.LoginForm, session: sql.Session = Depends(get_session)):
    try:
        res = session.exec(sql.select(models.User).where(models.User.username == data.username))
        user = res.one()
    except:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Username not found!")
    
    if not user.verify(data.password): raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Incorrect password")
    return jwt.encode({ "uid": user.uid.hex }, os.environ['SECRET'], algorithm='HS256')