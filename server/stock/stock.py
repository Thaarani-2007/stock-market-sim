import asyncio, random, threading, time
import sqlmodel as sql

from stock.models import Stock, StockEntry
from user.models import Transaction, User

from data.conn import SocketPool
from data.cache import Cache
from data.db import get_session


class StockProvider(threading.Thread):
    __value: float
    __update: int
    __trigger: int

    started: threading.Event

    def __init__(self, init_value: float, update: int, trigger: int):
        self.__value = init_value
        self.__update = update
        self.__trigger = trigger
        self.started = threading.Event()
        super().__init__()


    def broadcast_updates(
        self,  stocks: list[Stock],
        cache: Cache, session: sql.Session
    ):
        updates = {}
                
        for stock in stocks:
            entry = StockEntry.from_json(stock.uid, cache.get(stock.uid.hex))
            
            value = entry.close
            # transactions = session.exec(sql.select(Transaction).where(StockEntry.timestamp > entry.timestamp)).fetchall()
            # for transaction in transactions: value += transaction.price * 0.005
            value += value * random.uniform(-0.01, 0.01)
            
            entry.set_value(value)
            updates[stock.uid.hex] = entry.to_dict()
            cache.set(stock.uid.hex, str(entry))

        asyncio.run(SocketPool.broadcast(updates))

    

    def run(self):
        if self.started.is_set(): return None
        self.started.set()

        cache = Cache()
        session = next(get_session())
        stocks = list(session.exec(sql.select(Stock)).fetchall())

        for stock in stocks:
            cache.set(stock.uid.hex, str(StockEntry(stock_id=stock.uid, value=self.__value)))

        delta_time = 0
        while self.started.is_set():
                        
            if delta_time == self.__trigger:
                delta_time = 0
                new_data = {}
                for stock in stocks:
                    entry = StockEntry.from_json(stock.uid, cache.get(stock.uid.hex))
                    entry.save(session)

                    value = entry.close + abs(entry.open - entry.close) * random.uniform(-0.01, 0.01)
                    new_entry = StockEntry(stock_id=stock.uid, open=value, close=value, high=value, low=value)
                    cache.set(stock.uid.hex, str(new_entry))
                    new_data[stock.uid.hex] = new_entry.to_dict()

                asyncio.run(SocketPool.broadcast(new_data))

            else: self.broadcast_updates(stocks, cache, session)


            time.sleep(self.__update)
            delta_time += self.__update





def sell_stock(
    session: sql.Session, user: User,
    stock: Stock, units: int, buy: bool = False
):
    value = StockEntry.from_json(stock.uid, Cache().get(stock.uid.hex)).close
    owned_units = session.exec(
        sql.select(sql.func.sum(Transaction.num_units))
        .where(
            Transaction.stock == stock.uid and 
            Transaction.user == user.uid
        )
    ).one() or 0


    if buy:
        pass

    else:
        price = value * 0.995
        if owned_units < units:

            if owned_units > 0:
                user.balance += owned_units * price # sell regular units
                Transaction(
                    stock=stock.uid, user=user.uid,
                    num_units=owned_units, price=owned_units * price
                ).save(session)
                user.save(session)

            Transaction(
                stock=stock.uid, user=user.uid,
                num_units=owned_units - units, price=(units - owned_units) * price
            ).save(session)

        else:
            user.balance += units * 0.995 * value
            Transaction(
                stock=stock.uid, user=user.uid,
                num_units=units, price=units * 0.995 * value
            ).save(session)
            user.save(session)