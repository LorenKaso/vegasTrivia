import asyncio
import json
import random
import os
import time  
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
        self.answers_received = {}
        self.scores = {}
        self.double_used = set()
        self.reveal_sent = False
        self.current_question = None

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
        self.player_info = defaultdict(dict)

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[room_id].append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)

            player = self.player_info[room_id].get(websocket)
            if player:
                name = player["name"]
                room = room_states.get(room_id)
                if room:
                    room.scores.pop(name, None)
                    room.answers_received.pop(name, None)
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

        for conn in disconnected:
            if conn in self.active_connections[room_id]:
                self.active_connections[room_id].remove(conn)

    async def broadcast_player_list(self, room_id: str):
        players = [
            {
                "name": info["name"],
                "avatar": info["avatar"]
            }
            for info in self.player_info[room_id].values()
        ]
        await self.broadcast(room_id, {"type": "player_list", "players": players})

    async def handle_answer(self, room_id: str, name: str, answer: str, double: bool = False):
        room = room_states[room_id]
        if room.reveal_sent:
            return

        current_question = room.current_question
        correct_answer = current_question["correctAnswer"]
        room.answers_received[name] = answer

        all_players = [info["name"] for info in self.player_info[room_id].values()]
        if set(room.answers_received.keys()) >= set(all_players):
            await self.reveal_and_score(room_id, current_question)

    async def reveal_and_score(self, room_id: str, current_question: dict):
        room = room_states[room_id]
        room.reveal_sent = True
        correct_answer = current_question["correctAnswer"]
        correct_players = [n for n, ans in room.answers_received.items() if ans == correct_answer]
        fastest = correct_players[0] if correct_players else None
        difficulty = current_question.get("difficulty", 1)

        for name, ans in room.answers_received.items():
            is_correct = ans == correct_answer
            is_first = is_correct and name == fastest
            points = 0
            if is_correct:
                points = 15 if is_first else 10
                if is_first and difficulty > 6:
                    points += 5
                if name in room.double_used:
                    points *= 2
            room.scores[name] = room.scores.get(name, 0) + points

        await self.reveal_answer(room_id, correct_answer, fastest)
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
        room.current_question = question
        room.answers_received = {}
        room.reveal_sent = False

        start_time = time.time()  # זמן UNIX מדויק

        await self.broadcast(room_id, {
            "type": "question",
            "question": {
                "id": room.current_question_index,
                "question": question["question"],
                "answers": question["answers"],
                "correctAnswer": question["correctAnswer"],  # לבדיקה מקומית
                "difficulty": question["difficulty"],
                "startTime": start_time  # ⬅️ תוספת קריטית
            }
        })

        asyncio.create_task(self.start_question_timer(room_id, question))

    async def start_question_timer(self, room_id: str, question: dict):
        await asyncio.sleep(30)
        room = room_states[room_id]
        if not room.reveal_sent and room.current_question == question:
            await self.reveal_and_score(room_id, question)

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
    await manager.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            data = json.loads(data)

            if data["type"] == "join":
                name = data["name"].strip()
                avatar = data["avatar"]

                current_names = [info["name"].strip() for info in manager.player_info[room_id].values()]
                print(f"🧪 שחקן מנסה להצטרף: {name}")
                print(f"👥 שמות קיימים בחדר {room_id}: {current_names}")
                if name in current_names:
                    print(f"⚠️ כפילות: {name} כבר קיים בחדר {room_id}")
                    continue

                manager.player_info[room_id][websocket] = {
                    "name": name,
                    "avatar": avatar
                }
                print(f"✅ {name} נוסף לחדר {room_id}")
                await manager.broadcast_player_list(room_id)

            elif data["type"] == "start_game":
                print(f"📨 Start game from room {room_id}")
                room_states[room_id] = RoomState()
                await manager.broadcast(room_id, {"type": "game_starting"})
                await asyncio.sleep(3)
                await manager.send_next_question(room_id)

            elif data["type"] == "answer":
                await manager.handle_answer(
                    room_id,
                    data["name"].strip(),
                    data["answer"],
                    data.get("double", False)
                )
            elif data["type"] == "friend_help":
                room = room_states.get(room_id)
                if not room or not room.current_question:
                    continue

                correct = room.current_question["correctAnswer"]
                options = room.current_question["answers"]

                # 75% סיכוי לתשובה נכונה
                is_correct = random.random() < 0.75
                suggestion = correct if is_correct else random.choice([a for a in options if a != correct])

                await websocket.send_text(json.dumps({
                    "type": "friend_suggestion",
                    "suggestion": suggestion
                }))

    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)