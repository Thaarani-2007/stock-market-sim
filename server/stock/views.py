import sqlmodel as sql
from os import environ
from fastapi import APIRouter, HTTPException, status, Depends, WebSocket, WebSocketDisconnect
router = APIRouter()

import uuid
from . import models, forms
from user import models as user_models
from .stock import StockProvider
import middleware

from data.db import get_session
from data.conn import SocketPool
from data.cache import Cache


PROVIDER = StockProvider(5000, 2, 10)


def check_admin(data: forms.AdminForm): return data.username == environ['ADMIN_USER'] and data.password == environ['ADMIN_PASSWORD']


@router.get('/stocks')
def get_stocks(
    session: sql.Session = Depends(get_session),
    user: user_models.User = Depends(middleware.get_user)
):
    stocks = session.exec(
        sql.select(models.StockEntry, models.Stock)
        .join(models.Stock)
        .order_by(models.StockEntry.timestamp) # type: ignore
    )

    res: dict[str, dict] = {}
    for (entry, stock) in stocks:
        stock_id = entry.stock_id.hex

        if stock_id not in res: 
            res[stock_id] = { 
                'name': stock.name, 'category': stock.category, 'entries': [],
                'owned': session.exec(
                    sql.select(sql.func.sum(user_models.Transaction.num_units))
                    .where(
                        user_models.Transaction.stock == stock.uid and 
                        user_models.Transaction.user == user.uid
                    )
                ).one() or 0
            }

        res[stock_id]['entries'].append(entry.to_dict())
    
    
    if PROVIDER.started.is_set():
        cache = Cache()
        for stock_id in res.keys():
            entry = models.StockEntry.from_json(uuid.UUID(stock_id), cache.get(stock_id))
            res[stock_id]['entries'].append(entry.to_dict())
        

    return res


@router.websocket('/stocks')
async def connect_websocket(websocket: WebSocket):
    try:
        await websocket.accept()
        SocketPool.add(websocket)
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        SocketPool.remove(websocket)



@router.post('/stocks/{stock_id}')
def transact(
    stock_id: str, data: forms.TransactForm, session: sql.Session = Depends(get_session),
    user: user_models.User = Depends(middleware.get_user)
):
    try:
        stock = session.exec(sql.select(models.Stock).where(models.Stock.uid == uuid.UUID(stock_id))).one()
    except:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Stock ID not found")
    
    value = models.StockEntry.from_json(stock.uid, Cache().get(stock.uid.hex)).close
    owned_units = session.exec(
        sql.select(sql.func.sum(user_models.Transaction.num_units))
        .where(
            user_models.Transaction.stock == stock.uid and 
            user_models.Transaction.user == user.uid
        )
    ).one() or 0
    units = abs(data.units)

    if data.units < 0:
        
        if owned_units < units:

            if owned_units > 0:
                user.balance += owned_units * 0.995 * value # sell regular units
                user_models.Transaction(
                    stock=stock.uid, user=user.uid,
                    num_units=owned_units, price=owned_units * 0.995 * value
                ).save(session)

            
            user_models.Transaction(
                stock=stock.uid, user=user.uid,
                num_units=owned_units - units, price=(units - owned_units) * 0.995 * value
            ).save(session)

            user.save(session)

        else:
            user.balance += units * 0.995 * value
            user_models.Transaction(
                stock=stock.uid, user=user.uid,
                num_units=units, price=units * 0.995 * value
            ).save(session)
            user.save(session)


    else:
        if (user.balance < units * 1.005 * value): raise HTTPException(status.HTTP_412_PRECONDITION_FAILED, detail="Insufficient balance")

        if owned_units < 0:
            curr_value = value * 1.005 * units
            stock_value = 0
            # MKC ISKI
            pass
        
        

        user.balance -= units * 1.005 * value
        user_models.Transaction(
            stock=stock.uid, user=user.uid,
            num_units=units, price=units * -1.005 * value
        ).save(session)
        user.save(session)
            
    


@router.post('/stocks')
def start_stock(data: forms.AdminForm):
    if not check_admin(data): raise HTTPException(status.HTTP_403_FORBIDDEN, detail='Invalid admin credentials')
    if PROVIDER.started.is_set(): return HTTPException(status.HTTP_428_PRECONDITION_REQUIRED, detail='Stock provider is already initialized')
    
    PROVIDER.start()
    return "Stock provider initialized"


@router.delete('/stocks')
def stop_stock(data: forms.AdminForm):
    if not check_admin(data): raise HTTPException(status.HTTP_403_FORBIDDEN, detail='Invalid admin credentials')
    if not PROVIDER.started.is_set(): return HTTPException(status.HTTP_428_PRECONDITION_REQUIRED, detail="Stock provider is not running!")

    PROVIDER.started.clear()
    PROVIDER.join()
    return "Stock provider stopped"