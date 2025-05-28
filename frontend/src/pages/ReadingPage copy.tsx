// src/pages/ReadingPage.tsx
import React, { useEffect, useState } from "react"; // Ensure React is imported for JSX
import { TarotCard } from "../components/TarotCard";
import ChatBubble from "../components/ChatBubble";
import { useTarotReading } from "../hooks/useTarotReading";
import { useTarotStore } from "../stores/useTarotStore"; 

export default function ReadingPage() {
  // Get status of the overall reading generation from this hook
  // This hook will also trigger the initial data fetching that populates the store
  const {
    isFetching: isInitialReadingLoading,
    isError: isInitialReadingError,
    error: initialReadingError,
  } = useTarotReading();

  // Get data and actions from the Zustand store
  const cards = useTarotStore(state => state.cards);
  const cardDisplayStates = useTarotStore(state => state.cardDisplayStates);
  const spreadSize = useTarotStore(state => state.spreadSize);
  const updateCardDisplayState = useTarotStore(state => state.updateCardDisplayState);
  const currentQuestionForPapi = useTarotStore(state => state.question); 


  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [papiResponse, setPapiResponse] = useState("");
  const [isPapiLoading, setIsPapiLoading] = useState(false); // Loading state for Papi's response

  // The useEffect that called `WorkspaceCardTextIfMissing` is removed for now,
  // as `useTarotReading` handles the initial fetching of all card data.
  // If you need a specific re-fetch mechanism for individual cards later,
  // it would require a dedicated action in the store.

  const handleCardFlipAnimationCompleted = (index: number) => {
    console.log(`ReadingPage: Card flip completed for index ${index}`);
    // Assuming your store has an action like updateCardDisplayState
    // and CardDisplayStatus interface is defined in your store
    updateCardDisplayState(index, { flipAnimationCompleted: true });
  };

  const handleAskPapi = async () => {
    if (!cards || cards.length <= currentCardIndex || !cards[currentCardIndex]?.id) {
      console.error("Current card data is not available for Papi chat.");
      setPapiResponse("Papi needs a card to read first, mi vida!");
      return;
    }
    if (!userInput.trim()) {
      setPapiResponse("Ask Papi a question, mi amor!");
      return;
    }

    setIsPapiLoading(true);
    setPapiResponse(""); // Clear previous response

    try {
      const res = await fetch("/api/chat", { // Ensure this API path is correct and proxied/absolute for deployment
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userInput,
          card_id: cards[currentCardIndex].id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: `Papi's connection is a bit hazy (HTTP ${res.status})` }));
        console.error("API Error in handleAskPapi:", res.status, errorData);
        setPapiResponse(errorData.detail || `Papi's words are lost in static... (Error ${res.status})`);
        return;
      }

      const data = await res.json();
      setPapiResponse(data.text || "Papi's response was a whisper on the wind, try again?");
    } catch (error) {
      console.error("Fetch Error in handleAskPapi:", error);
      setPapiResponse("Ay, Papi's connection to the spirits is down! Check the console, mi amor.");
    } finally {
      setIsPapiLoading(false);
    }
  };

  // Display loading state for the initial reading setup
  if (isInitialReadingLoading && (!cards || cards.length === 0 || cards.some(c => c.id.startsWith("PENDING_ID")))) {
    return <div className="p-6 text-center text-xl">Papi is shuffling the deck and consulting the spirits for your reading, mi amor... ✨</div>;
  }

  // Display error state if the initial reading setup failed
  if (isInitialReadingError) {
    return (
      <div className="p-6 text-center text-red-500">
        Ay, the connection to the spirit world is a bit fuzzy... Papi couldn't prepare your reading.
        {initialReadingError && <p>Error: {initialReadingError.message}</p>}
      </div>
    );
  }

  // Ensure cards and cardDisplayStates are populated enough before trying to access by index
  const currentCard = cards && cards.length > currentCardIndex ? cards[currentCardIndex] : null;
  const currentDisplayState = cardDisplayStates && cardDisplayStates.length > currentCardIndex ? cardDisplayStates[currentCardIndex] : null;

  return (
    <div className="p-6 flex flex-col items-center gap-6 min-h-screen">
      {currentCard && (
        <TarotCard
          key={currentCard.id}
          faceUrl={currentCard.imageUrl}
          onFlipEnd={() => handleCardFlipAnimationCompleted(currentCardIndex)}
          size={180}
        />
      )}

      {currentCard?.text && currentDisplayState?.flipAnimationCompleted && (
        <div className="w-full max-w-xl space-y-4 mt-4">
          <ChatBubble
            id={currentCard.id} // currentCard is guaranteed to exist here
            imageUrl={currentCard.imageUrl}
            text={currentCard.text}
          />

          {isPapiLoading && <div className="text-center p-2">Papi is pondering...</div>}
          
          {papiResponse && !isPapiLoading && (
            <ChatBubble
              id={`papi-response-${currentCardIndex}`}
              imageUrl={null} // Papi doesn't have an image for his text responses
              text={papiResponse}
            />
          )}

          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 border border-pink-400 px-4 py-2 rounded-lg text-black bg-white shadow-sm"
              type="text"
              placeholder="Ask Papi about this card..."
              value={userInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserInput(e.target.value)}
              disabled={isPapiLoading}
            />
            <button
              className="px-4 py-2 bg-pink-700 hover:bg-pink-800 text-white rounded-lg shadow-md disabled:opacity-50"
              onClick={handleAskPapi}
              disabled={isPapiLoading}
            >
              {isPapiLoading ? "Asking..." : "Ask 🔮"}
            </button>
          </div>
        </div>
      )}

      {currentDisplayState?.flipAnimationCompleted && currentCardIndex < spreadSize - 1 && (
        <button
          className="mt-8 px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-semibold shadow-lg"
          onClick={() => {
            setCurrentCardIndex(currentCardIndex + 1);
            setUserInput("");     // Clear previous input for next card
            setPapiResponse("");  // Clear previous Papi response
          }}
        >
          Reveal next card 💌
        </button>
      )}
    </div>
  );
}