import os, jwt
import sqlmodel as sql
from fastapi import APIRouter, HTTPException, status, Depends

from data.db import get_session
from . import forms, models
from stock.models import Stock
import middleware

router = APIRouter()


@router.post('/login')
def login(data: forms.LoginForm, session: sql.Session = Depends(get_session)):
    try:
        res = session.exec(sql.select(models.User).where(models.User.username == data.username))
        user = res.one()
    except:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Username not found!")
    
    if not user.verify(data.password): raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Incorrect password")
    return { "token": jwt.encode({ "uid": user.uid.hex }, os.environ['SECRET'], algorithm='HS256') }


@router.post('/signup')
def signup(data: forms.LoginForm, session: sql.Session = Depends(get_session)):
    res = session.exec(sql.select(models.User).where(models.User.username == data.username))
    user = res.one_or_none()
    if user != None: raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Username already taken!")
    
    user = models.User(username=data.username, password=data.password)
    user.save(session)
    return { "token": jwt.encode({ "uid": user.uid.hex }, os.environ['SECRET'], algorithm='HS256') }


@router.put('/verify/{username}')
def verify_user(username: str, _: None = Depends(middleware.check_admin), session: sql.Session = Depends(get_session)):
    res = session.exec(sql.select(models.User).where(models.User.username == username))
    user = res.one_or_none()
    if user == None: raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found!")
    
    user.verified = True
    user.save(session)
    return { "message": "User verified successfully." }


@router.get('/')
def get_info(
    user: models.User = Depends(middleware.get_user),
    session: sql.Session = Depends(get_session)
):
    return {
        "balance": user.balance,
        "owned": dict([
            (holding.stock.hex, holding.quantity) for holding in
            session.exec(
                sql.select(models.Holding)
                .where(models.Holding.user == user.uid)
            )
        ])  
    }

@router.get('/transactions')
def get_transactions(
    user: models.User = Depends(middleware.get_user),
    session: sql.Session = Depends(get_session)
):
    res = []
    for transaction, stock in session.exec(
        sql.select(models.Transaction, Stock)
        .join(Stock)
        .where(models.Transaction.user == user.uid)
        .order_by(models.Transaction.timestamp.desc()) # type: ignore
    ):
        res.append({
            "stock": stock.name,
            "units": transaction.num_units,
            "price": transaction.price,
        })
    
    return res