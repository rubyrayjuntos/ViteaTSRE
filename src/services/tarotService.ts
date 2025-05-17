import { type DrawnCard } from "@/stores/useTarotStore"; // SpreadType is no longer directly used here for the payload

export interface CardRequestPayload {
  question: string;
  totalCardsInSpread: number; // Renamed from 'spread' for clarity, represents total cards
  cardNumberInSpread: number; // 0-indexed card number being requested
}

export async function fetchReading(payload: CardRequestPayload): Promise<DrawnCard> {
  const response = await fetch('/api/reading', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), // Send the whole payload object
  });
  if (!response.ok) {
    // Attempt to parse error details as JSON, fallback to text
    let errorData = await response.text();
    try { errorData = JSON.stringify(await response.json()); } catch (e) { /* ignore if not json */ }
    console.error(`Backend error: ${response.status} - ${errorData}`);
    throw new Error(`Failed to fetch tarot reading: ${response.status}`);
  }
  return response.json();
}

export async function fetchCardText(payload: CardRequestPayload): Promise<{ id: string; text: string }> {
  const response = await fetch('/api/reading/text', { // New endpoint
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let errorData = await response.text();
    try { errorData = JSON.stringify(await response.json()); } catch (e) { /* ignore */ }
    console.error(`Backend error (text): ${response.status} - ${errorData}`);
    throw new Error(`Failed to fetch card text: ${response.status}`);
  }
  return response.json(); // Expects { id: "Actual_Card_ID", text: "..." }
}

export async function fetchCardImage(payload: CardRequestPayload): Promise<{ id: string; imageUrl: string }> {
  const response = await fetch('/api/reading/image', { // New endpoint
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let errorData = await response.text();
    try { errorData = JSON.stringify(await response.json()); } catch (e) { /* ignore */ }
    console.error(`Backend error (image): ${response.status} - ${errorData}`);
    throw new Error(`Failed to fetch card image: ${response.status}`);
  }
  return response.json(); // Expects { id: "Actual_Card_ID", imageUrl: "..." }
}