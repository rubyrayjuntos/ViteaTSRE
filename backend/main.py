import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY")

client = AsyncOpenAI(api_key=OPENAI_API_KEY)
app = FastAPI(title="Papi Chispa API")


class ChatReq(BaseModel):
    question: str      # user’s overall question
    card_id: str       # e.g. 'FAKE_1' or 'II_High_Priestess'


@app.post("/api/chat")
async def chat(req: ChatReq):
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",             # cheaper than full GPT‑4o
            max_tokens=220,
            temperature=0.9,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Papi Chispa, a flirtatious tarot reader who "
                        "speaks with poetic Latino flair. Answer in 3–4 short "
                        "paragraphs and reference the card_id at least once."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Question: {req.question}\ncard_id={req.card_id}",
                },
            ],
        )
        return {"text": resp.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

