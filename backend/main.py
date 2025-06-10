# /workspaces/ViteaTSRE/backend/main.py
import os
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI, OpenAIError
from random import sample
from typing import List, Tuple
from papi_config import PAPI_PERSONA, get_image_prompt_style, get_chat_system_prompt

from deck import TAROT_CARDS # Assuming deck.py is in the same directory

import logging
import traceback

# Configure basic logging
logging.basicConfig(level=logging.INFO)  # Changed to INFO for production

# Load environment variables from .env file
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    logging.error("OPENAI_API_KEY not found in environment variables.")
    raise ValueError("OPENAI_API_KEY not found in environment variables.")

if not TAROT_CARDS or len(TAROT_CARDS) < 2:
    logging.error("TAROT_CARDS not loaded or insufficient cards in deck.py.")
    raise ValueError("TAROT_CARDS not loaded or insufficient cards in deck.py.")

# Initialize OpenAI client
client = AsyncOpenAI(api_key=OPENAI_API_KEY)

# Initialize FastAPI app
app = FastAPI(title="Papi Chispa API")

# Configure CORS
origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
if not origins or (len(origins) == 1 and not origins[0]):  # If no origins set, allow all in development
    origins = ["*"]

logging.info(f"Configuring CORS with allowed origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Base Directory Setup ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

# --- Constants ---
DALL_E_MODEL = "dall-e-3"
GPT_MODEL = "gpt-4" # or "gpt-3.5-turbo"

# --- In-memory cache for chosen cards in a reading ---
# This ensures that for a given question and spread size, the same cards are used
# if multiple calls are made (e.g., for text then image for the same card).
chosen_readings_cache: dict[Tuple[str, int], List[str]] = {}


# --- API Health and Status Endpoints ---
@app.get("/")
async def read_root():
    """Root endpoint that includes health check information"""
    try:
        # Test OpenAI connection with a minimal API call
        await client.chat.completions.create(
            messages=[{"role": "user", "content": "test"}],
            model="gpt-3.5-turbo",
            max_tokens=5
        )
        return {
            "message": "Welcome to Papi Chispa's Tarot API, mi amor! Ask me anything...",
            "status": "healthy",
            "openai_connection": "ok"
        }
    except OpenAIError as e:
        logging.error(f"OpenAI API test failed: {str(e)}")
        return {
            "message": "Welcome to Papi Chispa's Tarot API, mi amor! But ay caramba, the spirits are not connecting!",
            "status": "unhealthy",
            "openai_connection": "failed",
            "error": str(e)
        }
    except Exception as e:
        logging.error(f"Unexpected error in health check: {str(e)}")
        return {
            "message": "Welcome to Papi Chispa's Tarot API, mi amor! But something mysterious is happening...",
            "status": "error",
            "error": "Internal server error"
        }

# Serve favicon.ico
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    from fastapi.responses import FileResponse
    favicon_path = os.path.join(STATIC_DIR, "favicon.ico")
    if not os.path.exists(favicon_path):
        logging.error(f"Favicon not found at expected path: {favicon_path}")
        # Return a 404 if the file doesn't exist, rather than a 500 from FileResponse
        raise HTTPException(status_code=404, detail=f"Favicon not found at {favicon_path}")
    return FileResponse(favicon_path)


# --- Pydantic Models for Request and Response Validation ---
class ReadingReq(BaseModel):
    question: str
    spread: int # Number of cards

class ChatReq(BaseModel):
    question: str
    card_id: str

class IndividualCardDataReq(BaseModel):
    question: str
    totalCardsInSpread: int
    cardNumberInSpread: int # 0-indexed

class CardOut(BaseModel):
    name: str
    imageUrl: str
    text: str

class CardTextOut(BaseModel):
    id: str # Card name
    text: str

class CardImageOut(BaseModel):
    id: str # Card name
    imageUrl: str
    text: str # Keep structure consistent, even if empty for this specific endpoint

class ReadingOut(BaseModel):
    cards: List[CardOut]

class CardReq(BaseModel):
    card_id: str


# --- Helper function to get or sample cards for a reading ---
def get_chosen_cards_for_reading(question: str, total_cards: int) -> List[str]:
    cache_key = (question, total_cards)
    if cache_key in chosen_readings_cache:
        logging.info(f"Cache hit for reading '{question}' ({total_cards} cards).")
        return chosen_readings_cache[cache_key]
    else:
        if total_cards > len(TAROT_CARDS):
            logging.error(f"Requested {total_cards} cards, but only {len(TAROT_CARDS)} unique cards are available.")
            raise HTTPException(status_code=400, detail="Not enough unique cards available for the requested spread size.")
        chosen_cards = sample(TAROT_CARDS, total_cards) # TAROT_CARDS is a list, sample directly
        chosen_readings_cache[cache_key] = chosen_cards
        logging.info(f"Sampled cards for reading '{question}' ({total_cards} cards): {chosen_cards}")
        return chosen_cards

# --- OpenAI Interaction Helper Functions ---
async def generate_text_for_card(card_name: str, question_context: str, total_cards_in_spread: int, card_number_in_spread: int) -> str:
    logging.info(f"Generating chat response for card: {card_name}")
    prompt_content = (
        f"Card: {card_name} (This is card {card_number_in_spread + 1} of a {total_cards_in_spread}-card spread.)\n"
        f"User question: {question_context}\n"
        "Respond in Papi's style."
    )
    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": get_chat_system_prompt()},
                {"role": "user", "content": prompt_content},
            ],
            model=GPT_MODEL,
            max_tokens=350,
            temperature=0.9,
        )
        if chat_completion.choices and chat_completion.choices[0].message:
            text_content = chat_completion.choices[0].message.content
            logging.info(f"Successfully generated text for {card_name}")
            return text_content.strip() if text_content else "Papi Chispa is feeling a bit shy with the words right now, mi amor."
        return "Papi Chispa's words are lost in the stars for this one..."
    except OpenAIError as e:
        logging.error(f"OpenAI API error generating text for {card_name}: {e}")
        return f"Ay, an OpenAI hiccup! Papi Chispa can't quite channel the spirits for {card_name}. Error: {str(e)}"
    except Exception as e:
        logging.error(f"Unexpected error generating text for {card_name}: {e}\n{traceback.format_exc()}")
        return f"A mysterious silence from the spirits for {card_name}..."

async def generate_image_for_card(card_name: str) -> str:
    logging.info(f"Generating image for card: {card_name}")
    style_guide = get_image_prompt_style()
    try:
        prompt = f"""Tarot card illustration of {card_name}.
{style_guide}
Make it emotionally evocative and dramatically lit."""

        img = await client.images.generate(
            model=DALL_E_MODEL,
            prompt=prompt,
            size="1024x1024",
            n=1,
        )
        if img and img.data and len(img.data) > 0 and img.data[0] and img.data[0].url:
            logging.info(f"Successfully generated image URL for {card_name}")
            return img.data[0].url
        return ""
    except OpenAIError as e:
        logging.error(f"OpenAI API error generating image for {card_name}: {e}")
        return ""
    except Exception as e:
        logging.error(f"Unexpected error generating image for {card_name}: {e}\n{traceback.format_exc()}")
        return ""

# --- API Endpoints ---
@app.post("/image") # Standalone image generation, not tied to a reading context
async def create_image(req: CardReq):
    logging.info(f"Request to /image for card_id: {req.card_id}")
    try:
        img = await client.images.generate(
            model=DALL_E_MODEL,
            prompt=f"Tarot card illustration of {req.card_id} in neon retro style",
            size="1024x1024", # Changed to a supported DALL-E 3 size
            n=1,
        )
        if img and img.data and len(img.data) > 0 and img.data[0] and img.data[0].url:
            return {"imageUrl": img.data[0].url}
        else:
            raise HTTPException(status_code=500, detail="Image generation failed to return a URL.")
    except OpenAIError as e:
        logging.error(f"OpenAI API error in /image endpoint for {req.card_id}: {e}")
        raise HTTPException(status_code=503, detail=f"OpenAI Service unavailable or error: {str(e)}")
    except Exception as e:
        logging.error(f"Unexpected error in /image endpoint for {req.card_id}: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal server error during image generation.")


@app.post("/reading", response_model=ReadingOut)
async def create_reading(req: ReadingReq):
    logging.info(f"Request to /reading for question: '{req.question}' with spread size: {req.spread}")
    if req.spread <= 0:
        raise HTTPException(status_code=400, detail="Spread size must be positive.")

    chosen_card_names = get_chosen_cards_for_reading(req.question, req.spread)

    async def generate_card_data(name: str, index: int) -> CardOut:
        try:
            # Use asyncio.gather to fetch image and text concurrently for each card
            image_url, text_content = await asyncio.gather(
                generate_image_for_card(name),
                generate_text_for_card(name, req.question, req.spread, index)
            )
            return CardOut(name=name, imageUrl=image_url, text=text_content)
        except Exception as e:
            logging.error(f"Error processing card {name} in /reading: {e}\n{traceback.format_exc()}")
            # Return a card with error indicators
            return CardOut(name=name, imageUrl="", text=f"Error fetching details for {name}.")

    card_tasks = [generate_card_data(name, i) for i, name in enumerate(chosen_card_names)]
    results = await asyncio.gather(*card_tasks, return_exceptions=False) # Let individual errors be handled within generate_card_data

    return ReadingOut(cards=results)


@app.post("/api/reading/text", response_model=CardTextOut)
async def get_card_text(req: IndividualCardDataReq):
    logging.info(f"Request for text for card: (Index: {req.cardNumberInSpread}) for question: '{req.question}'")
    chosen_card_names = get_chosen_cards_for_reading(req.question, req.totalCardsInSpread)
    
    if not (0 <= req.cardNumberInSpread < len(chosen_card_names)):
        logging.error(f"Invalid card index {req.cardNumberInSpread} for chosen cards: {chosen_card_names}")
        raise HTTPException(status_code=404, detail=f"Card not found for index {req.cardNumberInSpread} in a spread of {req.totalCardsInSpread} for the given question.")
    
    card_name = chosen_card_names[req.cardNumberInSpread]
    text_content = await generate_text_for_card(
        card_name, req.question, req.totalCardsInSpread, req.cardNumberInSpread
    )
    response_data = CardTextOut(id=card_name, text=text_content)
    logging.info(f"Returning for /api/reading/text (card: {card_name}): {response_data.model_dump_json()}")
    return response_data


@app.post("/api/reading/image", response_model=CardImageOut)
async def get_card_image(req: IndividualCardDataReq):
    logging.info(f"Request for image for card: (Index: {req.cardNumberInSpread}) for question: '{req.question}'")
    chosen_card_names = get_chosen_cards_for_reading(req.question, req.totalCardsInSpread)

    if not (0 <= req.cardNumberInSpread < len(chosen_card_names)):
        logging.error(f"Invalid card index {req.cardNumberInSpread} for chosen cards: {chosen_card_names}")
        raise HTTPException(status_code=404, detail=f"Card not found for index {req.cardNumberInSpread} in a spread of {req.totalCardsInSpread} for the given question.")

    card_name = chosen_card_names[req.cardNumberInSpread]
    image_url_content = await generate_image_for_card(card_name)
    response_data = CardImageOut(id=card_name, imageUrl=image_url_content, text="") # text is empty as per model
    logging.info(f"Returning for /api/reading/image (card: {card_name}): {response_data.model_dump_json()}")
    return response_data

if __name__ == "__main__":
    import uvicorn
    # This block is for running the application directly using `python main.py`.
    # It's often used for local development.
    # The `static` directory and `favicon.ico` should ideally be part of your
    # project structure and included in your Docker image or deployment.
    # The creation logic here is a convenience for local `python main.py` execution.

    # Ensure static directory exists for local direct execution
    if not os.path.exists(STATIC_DIR):
        logging.info(f"Creating static directory for local dev: {STATIC_DIR}")
        os.makedirs(STATIC_DIR)
    # Ensure placeholder favicon exists for local direct execution
    local_favicon_path = os.path.join(STATIC_DIR, "favicon.ico")
    if not os.path.exists(local_favicon_path):
        logging.info(f"Creating placeholder favicon for local dev: {local_favicon_path}")
        with open(local_favicon_path, "a") as f: pass # Create an empty file

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

@app.post("/api/chat")
async def chat(request: Request):
    try:
        data = await request.json()
        question = data.get("question")
        current_card_id = data.get("current_card_id")
        previous_cards = data.get("previous_cards", [])
        chat_history = data.get("chat_history", [])

        if not question or not current_card_id:
            raise HTTPException(status_code=400, detail="Missing required fields")

        # Format the context for the AI
        context = f"""{get_chat_system_prompt()}

Current card: {current_card_id}

Previous cards drawn in this reading:
{format_previous_cards(previous_cards)}

Chat history for this reading:
{format_chat_history(chat_history)}

Question about the current card: {question}

Respond as Papi Chispa, considering:
1. The specific meaning of the current card
2. How it relates to any previous cards drawn
3. The context of the entire conversation so far
4. The specific question being asked

Keep your response focused primarily on the current card but weave in connections to previous cards when relevant."""

        # Call OpenAI API with the enhanced context
        response = await client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=300
        )

        return {"text": response.choices[0].message.content}

    except Exception as e:
        logging.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def format_previous_cards(cards):
    if not cards:
        return "No previous cards drawn."
    
    formatted = []
    for i, card in enumerate(cards, 1):
        formatted.append(f"{i}. {card['id']}: {card['text']}")
    
    return "\n".join(formatted)

def format_chat_history(history):
    if not history:
        return "No previous conversation."
    
    formatted = []
    for msg in history:
        role = "User" if msg["role"] == "user" else "Papi"
        formatted.append(f"{role}: {msg['content']}")
    
    return "\n".join(formatted)
