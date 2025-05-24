
import { useEffect, useState } from "react";
import { TarotCard } from "../components/TarotCard";
import { ChatBubble } from "../components/ChatBubble";
import { useTarotReading } from "../hooks/useTarotReading";

export default function ReadingPage() {
  const {
    cards,
    cardDisplayStates,
    fetchCardTextIfMissing,
    handleCardFlipAnimationCompleted,
    numberOfCardsToDisplay
  } = useTarotReading();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [papiResponse, setPapiResponse] = useState("");

  useEffect(() => {
    if (
      cards[currentCardIndex] &&
      !cards[currentCardIndex].text &&
      cardDisplayStates[currentCardIndex]?.flipAnimationCompleted
    ) {
      fetchCardTextIfMissing(currentCardIndex);
    }
  }, [currentCardIndex, cards, cardDisplayStates]);

  const handleAskPapi = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: userInput,
        card_id: cards[currentCardIndex].id,
      }),
    });
    const data = await res.json();
    setPapiResponse(data.text);
  };

  return (
    <div className="p-6 flex flex-col items-center gap-6">
      {cards[currentCardIndex] && (
        <TarotCard
          key={cards[currentCardIndex].id}
          faceUrl={cards[currentCardIndex].imageUrl}
          onFlipEnd={() => handleCardFlipAnimationCompleted(currentCardIndex)}
          size={180}
        />
      )}

      {cards[currentCardIndex]?.text &&
        cardDisplayStates[currentCardIndex]?.flipAnimationCompleted && (
          <div className="w-full max-w-xl space-y-4">
            <ChatBubble
              id={cards[currentCardIndex].id}
              imageUrl={cards[currentCardIndex].imageUrl}
              text={cards[currentCardIndex].text}
            />

            {papiResponse && (
              <ChatBubble
                id={`papi-response-${currentCardIndex}`}
                imageUrl={null}
                text={papiResponse}
              />
            )}

            <div className="flex gap-2">
              <input
                className="flex-1 border border-pink-400 px-4 py-2 rounded-lg text-black"
                type="text"
                placeholder="Ask Papi about this card..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <button
                className="px-4 py-2 bg-pink-700 hover:bg-pink-800 text-white rounded-lg"
                onClick={handleAskPapi}
              >
                Ask 🔮
              </button>
            </div>
          </div>
        )}

      {currentCardIndex < numberOfCardsToDisplay - 1 &&
        cardDisplayStates[currentCardIndex]?.flipAnimationCompleted && (
          <button
            className="mt-8 px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-semibold"
            onClick={() => {
              setCurrentCardIndex(currentCardIndex + 1);
              setUserInput("");
              setPapiResponse("");
            }}
          >
            Reveal next card 💌
          </button>
        )}
    </div>
  );
}
