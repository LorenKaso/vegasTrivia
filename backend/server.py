import asyncio
import json
import random
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# טעינת מאגר שאלות בצורה בטוחה
BASE_DIR = os.path.dirname(__file__)
file_path = os.path.join(BASE_DIR, "..", "src", "data", "questions.json")
with open(file_path, encoding="utf-8") as f:
    QUESTION_POOL = json.load(f)

rooms = defaultdict(list)
room_states = {}

class RoomState:
    def __init__(self, questions=None):
        self.questions = questions or self.smart_question_pool()
        self.current_question_index = 0
        self.answers_received = {}  # name -> answer
        self.scores = {}  # name -> score
        self.double_used = set()

    def smart_question_pool(self):
        grouped = defaultdict(list)
        for q in QUESTION_POOL:
            difficulty = q.get("difficulty", 1)
            grouped[difficulty].append(q)

        selected = []
        for i in range(1, 11):
            random.shuffle(grouped[i])
            selected.extend(grouped[i][:2])

        random.shuffle(selected)
        return selected[:10]

    def get_next_question(self):
        if self.current_question_index < len(self.questions):
            return self.questions[self.current_question_index]
        return None

class ConnectionManager:
    def __init__(self):
        self.active_connections = defaultdict(list)
        self.player_info = defaultdict(dict)  # websocket -> {name, avatar}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[room_id].append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_connections:
            player = self.player_info[room_id].get(websocket)
            if player:
                name = player["name"]
                room = room_states.get(room_id)
                if room:
                    room.scores.pop(name, None)
                    room.answers_received.pop(name, None)
            self.active_connections[room_id].remove(websocket)
            del self.player_info[room_id][websocket]
            asyncio.create_task(self.broadcast_player_list(room_id))

            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
                del self.player_info[room_id]
                room_states.pop(room_id, None)

    async def broadcast(self, room_id, message):
        disconnected = []
        for connection in self.active_connections.get(room_id, []):
            try:
                await connection.send_text(json.dumps(message))
            except:
                disconnected.append(connection)

        # הסר חיבורים סגורים
        for conn in disconnected:
            self.active_connections[room_id].remove(conn)

    async def broadcast_player_list(self, room_id: str):
        players = [info for info in self.player_info[room_id].values()]
        await self.broadcast(room_id, {"type": "player_list", "players": players})

    async def handle_answer(self, room_id: str, name: str, answer: str, double: bool = False):
        room = room_states[room_id]
        current_question = room.get_next_question()
        correct_answer = current_question["correct"]

        room.answers_received[name] = answer
        is_correct = answer == correct_answer

        correct_players = [n for n, ans in room.answers_received.items() if ans == correct_answer]
        is_first_correct = is_correct and len(correct_players) == 1

        difficulty = current_question.get("difficulty", 1)
        points = 0
        if is_correct:
            points = 15 if is_first_correct else 10
            if is_first_correct and difficulty > 6:
                points += 5
            if double and name not in room.double_used:
                points *= 2
                room.double_used.add(name)
            room.scores[name] = room.scores.get(name, 0) + points

        all_players = [info["name"] for info in self.player_info[room_id].values()]
        if set(room.answers_received.keys()) >= set(all_players):
            await self.reveal_answer(room_id, correct_answer, correct_players[0] if correct_players else None)
            await asyncio.sleep(2)
            room.current_question_index += 1
            if room.current_question_index >= len(room.questions):
                await self.end_game(room_id)
            else:
                await self.send_next_question(room_id)

    async def reveal_answer(self, room_id: str, correct_answer: str, fastest: Optional[str]):
        room = room_states[room_id]
        message = {
            "type": "reveal",
            "correctAnswer": correct_answer,
            "fastest": fastest,
            "players": [
                {
                    "name": info["name"],
                    "avatar": info["avatar"],
                    "score": room.scores.get(info["name"], 0)
                }
                for info in self.player_info[room_id].values()
            ]
        }
        await self.broadcast(room_id, message)

    async def send_next_question(self, room_id: str):
        room = room_states[room_id]
        question = room.get_next_question()
        room.answers_received = {}

        await self.broadcast(room_id, {
            "type": "question",
            "question": question["question"],
            "answers": question["answers"]
        })

    async def end_game(self, room_id: str):
        room = room_states[room_id]
        await self.broadcast(room_id, {
            "type": "game_over",
            "players": [
                {
                    "name": info["name"],
                    "avatar": info["avatar"],
                    "score": room.scores.get(info["name"], 0)
                }
                for info in self.player_info[room_id].values()
            ]
        })

manager = ConnectionManager()

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(room_id, websocket)  # accept קורה כאן
    try:
        while True:
            data = await websocket.receive_text()
            data = json.loads(data)

            if data["type"] == "join":
                manager.player_info[room_id][websocket] = {
                    "name": data["name"],
                    "avatar": data["avatar"]
                }
                await manager.broadcast_player_list(room_id)

            elif data["type"] == "start_game":
                print(f"📨 Start game from room {room_id}")
                room_states[room_id] = RoomState()
                await manager.broadcast(room_id, { "type": "game_starting" })
                await asyncio.sleep(3)
                await manager.send_next_question(room_id)

            elif data["type"] == "answer":
                await manager.handle_answer(
                    room_id,
                    data["name"],
                    data["answer"],
                    data.get("double", False)
                )

    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
