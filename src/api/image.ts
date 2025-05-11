export async function drawCardImage(cardName: string) {
  try {
    const res = await fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ card_id: cardName }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`image ${res.status}: ${msg}`);
    }

    const { imageUrl } = await res.json();
    return imageUrl;
  } catch (error) {
    console.error("Error fetching card image:", error);
    throw error;
  }
}