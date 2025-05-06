export interface ChatResponse {
  text: string;
}

export async function drawCardChat(cardId: string, question: string) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ card_id: cardId, question }),
  });

  if (!res.ok) throw new Error(`Chat error ${res.status}`);
  const data: ChatResponse = await res.json();
  return data.text;
}
