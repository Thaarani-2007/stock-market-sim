import redis, os
import json

class Cache:
    __cache: redis.Redis

    def __init__(self):
        self.__cache = redis.Redis(
            host=os.environ['CACHE_HOST'], 
            port=int(os.environ['CACHE_PORT'])
        )

    def set(self, key: str, value: str):
        self.__cache.set(key, value)

    def get(self, key: str) -> str:
        data: bytes | None = self.__cache.get(key) # type: ignore
        if data is None: raise Exception(f"Key does not exist: {key}")

        return data.decode()

    def __del__(self):
        self.__cache.close()