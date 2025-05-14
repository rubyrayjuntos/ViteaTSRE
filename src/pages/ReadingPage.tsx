// src/pages/ReadingPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTarotStore } from "@/stores/useTarotStore";

import TarotCard from "../components/TarotCard";
import LoadingDots from "@/components/LoadingDots";
import { useTarotReading } from "../hooks/useTarotReading";
import ChatBubble from "@/components/ChatBubble";

export default function ReadingPage() {
  const { question, spread, cards } = useTarotStore();
  const { isFetching } = useTarotReading();
  const navigate = useNavigate();

  const [cardStates, setCardStates] = useState(
    Array(spread === "Destiny" ? 3 : spread === "Cruz" ? 4 : 2).fill({
      loaded: false,
      flipped: false,
    })
  );

  // Back-guard: if no question, navigate to home
  useEffect(() => {
    if (!question) {
      navigate("/");
    }
  }, [question, navigate]);

  const handleCardLoadSuccess = (index: number) => {
    setCardStates((prev) =>
      prev.map((state, i) =>
        i === index ? { ...state, loaded: true } : state
      )
    );
  };

  const handleCardFlipComplete = (index: number) => {
    setCardStates((prev) =>
      prev.map((state, i) =>
        i === index ? { ...state, flipped: true } : state
      )
    );
  };

  useEffect(() => {
    // Sequentially trigger flips when cards are loaded
    cardStates.forEach((state, index) => {
      if (
        state.loaded &&
        !state.flipped &&
        (index === 0 || cardStates[index - 1].flipped)
      ) {
        setTimeout(() => handleCardFlipComplete(index), 1000); // Simulate flip duration
      }
    });
  }, [cardStates]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-fuchsia-900 to-slate-900 text-amber-100 p-6">
      <h2 className="text-xl mb-4 italic">{question}</h2>

      {/* Card Table */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: spread === "Destiny" ? 3 : spread === "Cruz" ? 4 : 2 }).map((_, idx) => (
          <TarotCard
            key={idx}
            faceUrl={cardStates[idx].loaded ? cards[idx]?.imageUrl : null}
            onFlipEnd={() => handleCardFlipComplete(idx)}
            size={180}
          >
            {!cardStates[idx].loaded && <LoadingDots />}
          </TarotCard>
        ))}
      </div>

      {/* Chat Bubbles */}
      <div className="mt-8 w-full max-w-lg flex flex-col gap-3">
        {cards.map(
          (c, idx) =>
            cardStates[idx].flipped && (
              <ChatBubble
                key={c.id}
                id={c.id}
                imageUrl={c.imageUrl}
                text={c.text}
              />
            )
        )}

        {isFetching && (
          <div className="self-center py-4">
            <LoadingDots />
          </div>
        )}
      </div>
    </div>
  );
}
