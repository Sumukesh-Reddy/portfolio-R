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
        "https://portfolio-r-gzgf.onrender.com",
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
    
def keep_alive():
    import time
    counter = 1
    while True:
        logger.info(f"Keep-alive ping {counter}")
        counter += 1
        time.sleep(300)  # Sleep for 5 minutes

keep_alive()