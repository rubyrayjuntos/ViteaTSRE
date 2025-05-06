export async function drawCardChat(cardId: string, question: string) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ card_id: cardId, question }),
  });

  if (!res.ok) {
    // grab plain text for easier debugging
    const msg = await res.text();
    throw new Error(`chat ${res.status}: ${msg}`);
  }

  const data: { text: string } = await res.json();
  return data.text;
}