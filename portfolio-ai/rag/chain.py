from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder
)

from langchain_core.messages import (
    HumanMessage,
    AIMessage
)

from langchain_classic.chains import (
    create_history_aware_retriever,
    create_retrieval_chain
)

from langchain_classic.chains.combine_documents import (
    create_stuff_documents_chain
)

from rag.retriever import (
    retriever,
    llm
)

from db.chat_repository import (
    get_history
)

contextualize_q_prompt = (
    ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
Given chat history and a user question,
rewrite it into a standalone question.

Do not answer.
"""
            ),
            MessagesPlaceholder(
                "chat_history"
            ),
            (
                "human",
                "{input}"
            )
        ]
    )
)

history_aware_retriever = (
    create_history_aware_retriever(
        llm,
        retriever,
        contextualize_q_prompt
    )
)

qa_prompt = (
    ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
You are an AI assistant representing Sumukesh.

You answer questions about Sumukesh's background based strictly on the supplied resume, portfolio, and profile data.

Guidelines:
- Ground every answer in the provided context.
- Never fabricate projects, skills, companies, dates, achievements, or educational details.
- If information is missing, say:
  "I couldn't find that information in Sumukesh's profile."
- Summarize information naturally instead of copying text verbatim.
-Keep answers highly concise and direct. Limit paragraphs to 2-6 short sentences.
- Never use filler phrases, introductions, or pleasantries (e.g., skip "Sure, I can help with that" or "Here is the information").
- Use bullet points heavily for easy scanning when listing skills, projects, or experiences.
- Never fabricate projects, skills, companies, dates, achievements, or educational details.
- If information is missing, say: "I couldn't find that information in Sumukesh's profile."
- Maintain a professional, recruiter-friendly tone.
- Prefer structured responses with bullet points for experience, projects, and achievements.
- Highlight technologies, responsibilities, impact, and measurable outcomes when available.
- Maintain a professional, recruiter-friendly tone.
- If asked for opinions, recommendations, or future plans not present in the context, state that the information is not available.

Context:
{context}

Question:
{input}

Answer:
"""
            ),
            MessagesPlaceholder(
                "chat_history"
            ),
            (
                "human",
                "{input}"
            )
        ]
    )
)
question_answer_chain = (
    create_stuff_documents_chain(
        llm,
        qa_prompt
    )
)

rag_chain = create_retrieval_chain(
    history_aware_retriever,
    question_answer_chain
)

def build_chat_history(messages):

    history = []

    for msg in messages:

        if msg["role"] == "user":

            history.append(
                HumanMessage(
                    content=msg["content"]
                )
            )

        elif msg["role"] == "assistant":

            history.append(
                AIMessage(
                    content=msg["content"]
                )
            )

    return history

def get_answer(
    session_id: str,
    question: str
):

    messages = get_history(
        session_id
    )

    chat_history = build_chat_history(
        messages
    )

    response = rag_chain.invoke(
        {
            "input": question,
            "chat_history": chat_history
        }
    )

    return response["answer"]