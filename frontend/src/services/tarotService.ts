// /workspaces/ViteaTSRE/src/services/tarotService.ts
import { type DrawnCard } from "@/stores/useTarotStore";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export interface CardRequestPayload {
  question: string;
  totalCardsInSpread: number;
  cardNumberInSpread: number; // 0-indexed
}

export async function fetchCardText(payload: CardRequestPayload): Promise<{ id: string; text: string }> {
  console.log('FETCH_SERVICE: Fetching card text with payload:', payload);
  try {
    const response = await fetch(`${BACKEND_URL}/api/reading/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('FETCH_SERVICE: fetchCardText response status:', response.status, response.statusText);
    const responseBodyText = await response.text(); // Get raw text first
    console.log('FETCH_SERVICE: fetchCardText raw response body:', responseBodyText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseBodyText); // Try to parse as JSON
      } catch (e) {
        errorData = { message: responseBodyText || response.statusText };
      }
      console.error('FETCH_SERVICE: Error fetching card text:', errorData);
      throw new Error(errorData.message || `Failed to fetch card text for card ${payload.cardNumberInSpread}`);
    }
    
    const jsonData = JSON.parse(responseBodyText); // Now parse the text as JSON
    console.log('FETCH_SERVICE: fetchCardText parsed JSON data:', jsonData);
    return jsonData;

  } catch (error) {
    console.error('FETCH_SERVICE: Network or other error in fetchCardText:', error);
    throw error instanceof Error ? error : new Error('An unexpected error occurred in fetchCardText');
  }
}

export async function fetchCardImage(payload: CardRequestPayload): Promise<{ id: string; imageUrl: string }> {
  console.log('FETCH_SERVICE: Fetching card image with payload:', payload);
  try {
    const response = await fetch(`${BACKEND_URL}/api/reading/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('FETCH_SERVICE: fetchCardImage response status:', response.status, response.statusText);
    const responseBodyText = await response.text(); // Get raw text first
    console.log('FETCH_SERVICE: fetchCardImage raw response body:', responseBodyText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseBodyText);
      } catch (e) {
        errorData = { message: responseBodyText || response.statusText };
      }
      console.error('FETCH_SERVICE: Error fetching card image:', errorData);
      throw new Error(errorData.message || `Failed to fetch card image for card ${payload.cardNumberInSpread}`);
    }

    const fullJsonData: { id: string; imageUrl: string; text: string } = JSON.parse(responseBodyText); 
    console.log('FETCH_SERVICE: fetchCardImage parsed full JSON data:', fullJsonData);
    
    // Explicitly return only id and imageUrl to match the Promise type
    // and avoid accidentally overwriting text with an empty string from the backend's CardImageOut model.
    const result = { id: fullJsonData.id, imageUrl: fullJsonData.imageUrl };
    console.log('FETCH_SERVICE: fetchCardImage returning (id, imageUrl):', result);
    return result;

  } catch (error) {
    console.error('FETCH_SERVICE: Network or other error in fetchCardImage:', error);
    throw error instanceof Error ? error : new Error('An unexpected error occurred in fetchCardImage');
  }
}
