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

# Simple in-memory cache for chosen cards in a reading
chosen_readings_cache: dict[tuple[str, int], list[str]] = {}

@app.get("/")
async def root():
    return {"message": "Welcome to the Tarot API"}

@app.get("/favicon.ico")
async def favicon():
    return FileResponse("favicon.ico")

# Models
class ReadingReq(BaseModel):
    # This model is for the original /reading endpoint, might be deprecated or repurposed
    question: str = Field(..., min_length=5, description="User's question for the tarot reading")
    spread: int = Field(..., ge=2, le=4, description="Number of cards in the spread (2, 3, or 4)")

class ChatReq(BaseModel):
    question: str = Field(..., min_length=5, description="User's overall question")
    card_id: str = Field(..., min_length=1, description="Card ID (e.g., 'FAKE_1' or 'II_High_Priestess')")

class IndividualCardDataReq(BaseModel):
    # For new /api/reading/text and /api/reading/image endpoints
    question: str = Field(..., min_length=5)
    totalCardsInSpread: int = Field(..., ge=2, le=4)
    cardNumberInSpread: int = Field(..., ge=0) # 0-indexed

class CardOut(BaseModel):
    # Used by the original /reading endpoint
    name: str
    imageUrl: str
    text: str

class CardTextOut(BaseModel):
    id: str # Actual card name
    text: str

class CardImageOut(BaseModel):
    id: str # Actual card name
    imageUrl: str
    text: str # Note: Original model had text, new endpoint might not populate it.

class ReadingOut(BaseModel):
    cards: list[CardOut]

class CardReq(BaseModel):
    card_id: str = Field(..., min_length=1, description="Card ID (e.g., 'FAKE_1' or 'II_High_Priestess')")

# Helper function to get or set chosen cards for a reading
def get_chosen_cards_for_reading(question: str, total_cards: int) -> list[str]:
    cache_key = (question, total_cards)
    if cache_key not in chosen_readings_cache:
        if not TAROT_CARDS or len(TAROT_CARDS) < total_cards:
            logger.error(f"Not enough unique tarot cards ({len(TAROT_CARDS)}) to sample {total_cards} cards.")
            raise HTTPException(status_code=500, detail="Internal server error: Tarot deck configuration issue.")
        chosen_readings_cache[cache_key] = sample(TAROT_CARDS, total_cards)
        logger.info(f"Sampled cards for reading '{question}' ({total_cards} cards): {chosen_readings_cache[cache_key]}")
    return chosen_readings_cache[cache_key]

# Refactored OpenAI call for text
async def generate_text_for_card(card_name: str, question_context: str, total_cards_in_spread: int, card_number_in_spread: int) -> str:
    logger.info(f"Generating chat response for card: {card_name}")
    try:
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
                        f"Card: {card_name} (This is card {card_number_in_spread + 1} of a {total_cards_in_spread}-card spread.)\n"
                        f"User question: {question_context}\n"
                        "Respond in Papi's style."
                    ),
                },
            ],
        ) # type: ignore
        if resp and resp.choices and len(resp.choices) > 0 and \
           resp.choices[0] and resp.choices[0].message and \
           resp.choices[0].message.content is not None:
            return resp.choices[0].message.content.strip()
        logger.warning(f"Could not obtain valid text completion for card {card_name}. Response: {resp}")
        return f"Papi Chispa is currently consulting the spirits about {card_name}, but they are a bit shy..."
    except OpenAIError as e:
        logger.error(f"OpenAI API error generating text for {card_name}: {e}")
        return f"Ay, mi amor, the spirits are playing hard to get for {card_name}! Error: {str(e)}"

# Refactored OpenAI call for image
async def generate_image_for_card(card_name: str) -> str:
    logger.info(f"Generating image for card: {card_name}")
    try:
        img = await client.images.generate(
            model=DALL_E_MODEL,
            prompt=f"Tarot card illustration of {card_name} in neon retro Latino style",
            size="1024x1536",
            n=1,
        )
        if img and img.data and len(img.data) > 0 and img.data[0] and img.data[0].url:
            return img.data[0].url
        logger.warning(f"Could not obtain valid image URL for card {card_name}. Response: {img}")
        return "" # Return empty string or a placeholder URL
    except OpenAIError as e:
        logger.error(f"OpenAI API error generating image for {card_name}: {e}")
        return ""

# Endpoints
@app.post("/image")
async def dall_e(req: CardReq):
    try:
        logger.info(f"Generating image for card_id: {req.card_id}")
        img = await client.images.generate(
            model=DALL_E_MODEL,
            prompt=f"Tarot card illustration of {req.card_id} in neon retro style",
            size="1024x1536",
            n=1,
        )
        # Ensure the response structure is as expected before accessing elements
        if img and img.data and len(img.data) > 0 and img.data[0] and img.data[0].url:
            return {"imageUrl": img.data[0].url}
        else:
            # Log the actual response if it's not as expected
            logger.error(f"Unexpected DALL-E response structure or missing URL for card_id {req.card_id}. Response: {img}")
            raise HTTPException(status_code=500, detail="Failed to generate image or image URL missing")
    except OpenAIError as e:
        logger.error(f"OpenAI API error for card_id {req.card_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate image")
    except Exception as e:
        logger.error(f"Unexpected error generating image for card_id {req.card_id}: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Failed to generate image")

@app.post("/reading", response_model=ReadingOut)
# @app.post("/reading", response_model=ReadingOut) # Original endpoint, may need to be deprecated or re-evaluated
async def reading(req: ReadingReq):
    try:
        # Choose cards for the spread
        # chosen = sample(TAROT_CARDS, req.spread) # This logic is now in get_chosen_cards_for_reading
        chosen = get_chosen_cards_for_reading(req.question, req.spread)
        logger.debug(f"Chosen cards for spread: {chosen}")

        # Generate card data in parallel
        async def generate_card_data(name: str):
            try:
                image_url_task = generate_image_for_card(name)
                text_task = generate_text_for_card(name, req.question, req.spread, chosen.index(name) if name in chosen else 0)
                image_url_final, text_final = await asyncio.gather(image_url_task, text_task)

                return CardOut(
                    name=name,
                    imageUrl=image_url_final,
                    text=text_final,
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

@app.post("/api/reading/text", response_model=CardTextOut)
async def reading_text(req: IndividualCardDataReq):
    try:
        chosen_cards = get_chosen_cards_for_reading(req.question, req.totalCardsInSpread)
        if req.cardNumberInSpread >= len(chosen_cards):
            logger.error(f"Card number {req.cardNumberInSpread} out of bounds for chosen cards list (len: {len(chosen_cards)})")
            raise HTTPException(status_code=400, detail="Invalid card number for the spread.")
        
        card_name = chosen_cards[req.cardNumberInSpread]
        logger.info(f"Request for text for card: {card_name} (Index: {req.cardNumberInSpread}) for question: '{req.question}'")

        text_content = await generate_text_for_card(card_name, req.question, req.totalCardsInSpread, req.cardNumberInSpread)
        return CardTextOut(id=card_name, text=text_content)

    except HTTPException:
        raise # Re-raise HTTPException to preserve status code and detail
    except Exception as e:
        logger.error(f"Error in /api/reading/text: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Failed to generate card text")

@app.post("/api/reading/image", response_model=CardImageOut)
async def reading_image(req: IndividualCardDataReq):
    try:
        chosen_cards = get_chosen_cards_for_reading(req.question, req.totalCardsInSpread)
        if req.cardNumberInSpread >= len(chosen_cards):
            logger.error(f"Card number {req.cardNumberInSpread} out of bounds for chosen cards list (len: {len(chosen_cards)})")
            raise HTTPException(status_code=400, detail="Invalid card number for the spread.")

        card_name = chosen_cards[req.cardNumberInSpread]
        logger.info(f"Request for image for card: {card_name} (Index: {req.cardNumberInSpread}) for question: '{req.question}'")

        image_url = await generate_image_for_card(card_name)
        return CardImageOut(id=card_name, imageUrl=image_url, text="") # text="" as CardImageOut expects it, but we don't generate it here.
    except HTTPException:
        raise # Re-raise HTTPException to preserve status code and detail
    except Exception as e:
        logger.error(f"Error in /api/reading/image: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Failed to generate card image")