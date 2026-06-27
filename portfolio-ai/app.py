from uuid import uuid4
import threading

from fastapi import (
    FastAPI,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from db.chat_repository import (
    create_session,
    get_session,
    get_history,
    add_message,
    get_all_sessions
)

from models import ChatRequest
import time

from rag.chain import (
    get_answer
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://sumukesh-portfolio.vercel.app",
        "https://www.sumukesh.app",
        "https://sumukesh.app",
        "https://portfolio-r-jb5s.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():

    return {
        "message": "Portfolio Chatbot API Running"
    }


@app.post("/api/chat/session")
def create_chat_session():

    session_id = str(uuid4())

    create_session(session_id)

    return {
        "sessionId": session_id
    }


@app.post("/api/chat/message")
def send_message(
    data: ChatRequest
):

    session = get_session(
        data.sessionId
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    add_message(
        data.sessionId,
        "user",
        data.message
    )

    answer = get_answer(
        data.sessionId,
        data.message
    )

    add_message(
        data.sessionId,
        "assistant",
        answer
    )

    return {
        "answer": answer
    }


@app.get(
    "/api/chat/history/{session_id}"
)
def chat_history(
    session_id: str
):

    session = get_session(
        session_id
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    return {
        "messages": get_history(
            session_id
        )
    }

@app.get("/api/admin/sessions")
def admin_sessions():
    sessions = get_all_sessions()
    return {
        "sessions": sessions
    }
    
@app.get("/api/wakeup")
def wakeup():
    print("Wakeup call received")
    return {
        "message": "Wakeup call received"
    }
    
import logging
import urllib.request

logger = logging.getLogger("ai_service")
logging.basicConfig(level=logging.INFO)

def start_keep_alive_thread():
    import time
    
    def keep_alive_loop():
        # Wait a few seconds for Uvicorn server startup to complete
        time.sleep(10)
        num = 1
        
        while True:
            # 1. Log count (cycling 1 to 5)
            logger.info(f"[Keep-Alive] Log count: {num}")
            num = num + 1 if num < 5 else 1
            
            # 2. Ping Self to keep alive on Render
            self_url = "https://portfolio-r-jb5s.onrender.com/api/wakeup"
            try:
                req = urllib.request.Request(self_url, headers={'User-Agent': 'OrbitAI-KeepAlive'})
                with urllib.request.urlopen(req, timeout=10) as response:
                    status_code = response.getcode()
                    logger.info(f"[Keep-Alive] Pinged self, status: {status_code}")
            except Exception as e:
                logger.error(f"[Keep-Alive] Failed to self-ping: {e}")
                
            time.sleep(300)  # Every 5 minutes

    # Start loop as a background daemon thread so it doesn't block startup
    threading.Thread(target=keep_alive_loop, daemon=True).start()

start_keep_alive_thread()