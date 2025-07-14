from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = {}
        self.player_info: Dict[str, Dict[WebSocket, dict]] = {}

    async def connect(self, room_id: str, websocket: WebSocket, player: dict):
     
        if room_id not in self.rooms:
            self.rooms[room_id] = []
            self.player_info[room_id] = {}

        if len(self.rooms[room_id]) >= 6:
            await websocket.send_json({"type": "error", "message": "החדר מלא (עד 6 שחקנים)"})
            await websocket.close()
            return

        self.rooms[room_id].append(websocket)
        self.player_info[room_id][websocket] = player
        await self.broadcast_player_list(room_id)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.rooms:
            if websocket in self.rooms[room_id]:
                self.rooms[room_id].remove(websocket)
            if websocket in self.player_info[room_id]:
                del self.player_info[room_id][websocket]
            if not self.rooms[room_id]:
                del self.rooms[room_id]
                del self.player_info[room_id]

    async def broadcast(self, room_id: str, message: dict):
        if room_id in self.rooms:
            for connection in self.rooms[room_id]:
                await connection.send_json(message)

    async def broadcast_player_list(self, room_id: str):
        if room_id in self.player_info:
            players = list(self.player_info[room_id].values())
            await self.broadcast(room_id, {"type": "player_list", "players": players})

manager = ConnectionManager()

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()

    try:
        data = await websocket.receive_json()
        if data.get("type") == "join":
            player = data.get("player", {})
            await manager.connect(room_id, websocket, player)
        else:
            await websocket.close()
            return

        while True:
            data = await websocket.receive_json()

            if data.get("type") == "startGame":
                await manager.broadcast(room_id, {
                    "type": "gameStarted"
                })
            else:
                await manager.broadcast(room_id, data)

    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        await manager.broadcast_player_list(room_id)
