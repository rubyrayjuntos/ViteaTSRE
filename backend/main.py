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
from fastapi.responses import FileResponse

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY")
logger.debug(f"OPENAI_API_KEY loaded: {OPENAI_API_KEY}")

# Validate tarot cards at startup
if not TAROT_CARDS or len(TAROT_CARDS) < 2:
    raise RuntimeError("TAROT_CARDS must contain at least 2 cards")

# Initialize OpenAI client and FastAPI app
client = AsyncOpenAI(api_key=OPENAI_API_KEY)
app = FastAPI(title="Papi Chispa API")

# Constants
DALL_E_MODEL = "dall-e-3"
GPT_MODEL = "gpt-4"

@app.get("/")
async def root():
    return {"message": "Welcome to the Tarot API"}

@app.get("/favicon.ico")
async def favicon():
    return FileResponse("favicon.ico")

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
    try:
        # Choose cards for the spread
        chosen = sample(TAROT_CARDS, req.spread)
        logger.debug(f"Chosen cards for spread: {chosen}")

        # Generate card data in parallel
        async def generate_card_data(name: str):
            try:
                # Generate image
                logger.info(f"Generating image for card: {name}")
                img = await client.images.generate(
                    model=DALL_E_MODEL,
                    prompt=f"Tarot card illustration of {name} in neon retro Latino style",
                    size="1024x1024",  # Updated to a supported size
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
                return CardOut(
                    name=name,
                    imageUrl="",
                    text=f"Error generating data for card {name}: {e}",
                )
            except Exception as e:
                logger.error(f"Unexpected error for card {name}: {traceback.format_exc()}")
                return CardOut(
                    name=name,
                    imageUrl="",
                    text=f"Unexpected error generating data for card {name}",
                )

        out_cards = await asyncio.gather(
            *(generate_card_data(name) for name in chosen)
        )

        logger.debug(f"Generated card data: {out_cards}")
        return ReadingOut(cards=out_cards)
    except Exception as e:
        logger.error(f"Error in /api/reading: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Failed to generate reading")