
export async function fetchReading(question: string, spreadSize: number): Promise<{ id: string; imageUrl: string; text: string }[]> {
  const response = await fetch('/api/reading', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, spreadSize }),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch tarot reading');
  }
  return response.json();
}