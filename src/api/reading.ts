// src/api/reading.ts
export interface CardDTO {
    name: string;
    imageUrl: string;
    text: string;
  }
  export async function fetchReading(question: string, spread: number) {
    const res = await fetch("/api/reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, spread }),
    });
    if (!res.ok) throw new Error(await res.text());
    const { cards }: { cards: CardDTO[] } = await res.json();
    return cards;
  }
  