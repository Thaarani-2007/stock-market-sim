from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
import jwt, os, uuid

import data.db as db
from sqlalchemy.exc import NoResultFound
from user.models import User

def get_user(token: Annotated[str, Depends(OAuth2PasswordBearer("/login"))]):
    try:
        data = jwt.decode(token, os.environ['SECRET'], algorithms=['HS256'])
        with db.sql.Session(db.engine) as session:
            res = session.exec(db.sql.select(User).where(User.uid == uuid.UUID(data['uid'])))
            return res.one()

    except (NoResultFound, jwt.InvalidTokenError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Credential validation failed")
    