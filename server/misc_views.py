from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from data import db
from data.cache import Cache
import middleware

import stock.models as stock_models
import user.models as user_models

router = APIRouter()

@router.get('/leaderboard')
def get_leaderboard(session: db.sql.Session = Depends(db.get_session)):
    res = {}
    for user in session.exec(db.sql.select(user_models.User).where(user_models.User.verified == True)).all():
        res[user.username] = user.balance

    for user, holding in session.exec(
        db.sql.select(user_models.User, user_models.Holding)
        .join(user_models.Holding)
        .where(user_models.User.verified == True)
    ).all():
        cache_entry = Cache().get(holding.stock.hex)
        res[user.username] += holding.quantity * \
            (stock_models.StockEntry.from_json(holding.stock, cache_entry).close if cache_entry else 0)

    return res




from data.socket_pool import SocketPool
import asyncio
from typing import Dict, Any
NEWS_POOL = SocketPool()

@router.websocket('/news/')
async def connect_websocket(websocket: WebSocket):
    try:
        await websocket.accept()
        NEWS_POOL.add(websocket)
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        NEWS_POOL.remove(websocket)
        

@router.post('/news/')
def broadcast_news(
    data: Dict[str, Any],
    _: None = Depends(middleware.check_admin),
):
    if data.get("random", False):
        asyncio.run(NEWS_POOL.random_send(data))
    else:
        asyncio.run(NEWS_POOL.broadcast(data))
    return {"detail": "News broadcasted"}