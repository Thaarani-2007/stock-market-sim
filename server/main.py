from dotenv import load_dotenv
load_dotenv()


import data.db as db
from user import models as user_models
from stock import models as stock_models
db.sql.SQLModel.metadata.create_all(db.engine)


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from user.views import router as user_routes
from stock.views import router as stock_routes


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_routes)
app.include_router(stock_routes)