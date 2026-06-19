from datetime import datetime

from db.mongo import chat_sessions


def create_session(session_id: str):

    chat_sessions.insert_one(
        {
            "_id": session_id,
            "messages": [],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    )


def get_session(session_id: str):

    return chat_sessions.find_one(
        {"_id": session_id}
    )


def get_history(session_id: str):

    session = get_session(session_id)

    if not session:
        return []

    return session.get("messages", [])


def add_message(
    session_id: str,
    role: str,
    content: str
):

    chat_sessions.update_one(
        {"_id": session_id},
        {
            "$push": {
                "messages": {
                    "role": role,
                    "content": content,
                    "timestamp": datetime.utcnow()
                }
            },
            "$set": {
                "updatedAt": datetime.utcnow()
            }
        }
    )