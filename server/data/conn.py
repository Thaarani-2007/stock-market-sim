from fastapi import WebSocket
from fastapi.websockets import WebSocketState

class SocketPool:
    __conn: list[WebSocket] = []

    @staticmethod
    def add(socket: WebSocket):
        SocketPool.__conn.append(socket)

    @staticmethod
    def remove(socket: WebSocket):
        SocketPool.__conn.remove(socket)

    @staticmethod
    async def broadcast(message: dict):
        for socket in SocketPool.__conn:
            await socket.send_json(message)