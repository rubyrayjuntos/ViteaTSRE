import os
import asyncio  # Added for parallelizing API calls
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from openai import AsyncOpenAI, OpenAIError  # Import specific error class
from random import sample
from deck import TAROT_CARDS
import logging
import traceback  # Added for detailed error logging

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY")

# Validate tarot cards at startup
if not TAROT_CARDS or len(TAROT_CARDS) < 2:
    raise RuntimeError("TAROT_CARDS must contain at least 2 cards")

# Initialize OpenAI client and FastAPI app
client = AsyncOpenAI(api_key=OPENAI_API_KEY)
app = FastAPI(title="Papi Chispa API")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
DALL_E_MODEL = "dall-e-3"
GPT_MODEL = "gpt-4o-mini"

# Models
class ReadingReq(BaseModel):
    question: str = Field(..., min_length=5, description="User's question for the tarot reading")
    spread: int = Field(..., ge=2, le=4, description="Number of cards in the spread (2, 3, or 4)")

class ChatReq(BaseModel):
    question: str = Field(..., min_length=5, description="User's overall question")
    card_id: str = Field(..., min_length=1, description="Card ID (e.g., 'FAKE_1' or 'II_High_Priestess')")

class CardOut(BaseModel):
    name: str
    imageUrl: str
    text: str

class ReadingOut(BaseModel):
    cards: list[CardOut]

class CardReq(BaseModel):
    card_id: str = Field(..., min_length=1, description="Card ID (e.g., 'FAKE_1' or 'II_High_Priestess')")

# Endpoints
@app.post("/api/image")
async def dall_e(req: CardReq):
    try:
        logger.info(f"Generating image for card_id: {req.card_id}")
        img = await client.images.generate(
            model=DALL_E_MODEL,
            prompt=f"Tarot card illustration of {req.card_id} in neon retro style",
            size="512x768",
            n=1,
        )
        return {"imageUrl": img.data[0].url}
    except OpenAIError as e:
        logger.error(f"OpenAI API error for card_id {req.card_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate image")
    except Exception as e:
        logger.error(f"Unexpected error generating image for card_id {req.card_id}: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Failed to generate image")

@app.post("/api/reading", response_model=ReadingOut)
async def reading(req: ReadingReq):
    if req.spread not in {2, 3, 4}:
        raise HTTPException(400, "spread must be 2, 3, or 4")

    if len(TAROT_CARDS) < req.spread:
        logger.error("Insufficient tarot cards available")
        raise HTTPException(500, "Insufficient tarot cards available")

    try:
        chosen = sample(TAROT_CARDS, req.spread)

        async def generate_card_data(name: str):
            try:
                # Generate image
                logger.info(f"Generating image for card: {name}")
                img = await client.images.generate(
                    model=DALL_E_MODEL,
                    prompt=f"Tarot card illustration of {name} in neon retro Latino style",
                    size="512x768",
                    n=1,
                )

                # Generate chat response
                logger.info(f"Generating chat response for card: {name}")
                resp = await client.chat.completions.create(
                    model=GPT_MODEL,
                    max_tokens=350,
                    temperature=0.9,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are Papi Chispa, a flirtatious Latino tarot reader. "
                                "Give a 2–3 paragraph reading based on the given card name "
                                "and the user's question. Keep it poetic and playful."
                            ),
                        },
                        {
                            "role": "user",
                            "content": (
                                f"Card: {name}\n"
                                f"User question: {req.question}\n"
                                "Respond in Papi's style."
                            ),
                        },
                    ],
                )

                return CardOut(
                    name=name,
                    imageUrl=img.data[0].url,
                    text=resp.choices[0].message.content.strip(),
                )
            except OpenAIError as e:
                logger.error(f"OpenAI API error for card {name}: {e}")
                raise HTTPException(status_code=500, detail=f"Failed to generate data for card {name}")
            except Exception as e:
                logger.error(f"Unexpected error for card {name}: {traceback.format_exc()}")
                raise HTTPException(status_code=500, detail=f"Failed to generate data for card {name}")

        # Parallelize API calls
        out_cards = await asyncio.gather(*(generate_card_data(name) for name in chosen))

        return ReadingOut(cards=out_cards)
    except Exception as e:
        logger.error(f"Error generating reading: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Failed to generate reading")