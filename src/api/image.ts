// src/api/image.ts
export async function drawCardImage(cardId: string) {
    // TODO: hit FastAPI /image
    // Return placeholder Unsplash URL so you can see the flip.
    return `https://source.unsplash.com/400x640/?tarot,card,${cardId}`;
  }