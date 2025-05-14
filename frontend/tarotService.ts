export async function fetchReading(question: string, spread: number) {
    try {
        const response = await fetch("/api/reading", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ question, spread }),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error("Error response from API:", errorDetails);
            throw new Error(errorDetails.detail || "Failed to fetch tarot reading");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching tarot reading:", error);
        throw error;
    }
}