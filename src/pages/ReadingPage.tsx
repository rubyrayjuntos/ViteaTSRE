// src/pages/ReadingPage.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTarotStore, DrawnCard } from "@/stores/useTarotStore"; // Ensure DrawnCard is exported

import TarotCard from "../components/TarotCard";
import LoadingDots from "@/components/LoadingDots";
import { useTarotReading } from "../hooks/useTarotReading";
import ChatBubble from "@/components/ChatBubble";

interface CardDisplayState {
  id: string; // To help with keying if cards array changes order/identity
  flipAnimationCompleted: boolean;
}

export default function ReadingPage() {
  const { question, cards, spreadSize } = useTarotStore(); // Removed spread, using spreadSize or cards.length
  const { isFetching } = useTarotReading();
  const navigate = useNavigate();

  // Determine the number of cards to display
  const numberOfCardsToDisplay = useMemo(() => {
    return cards.length > 0 ? cards.length : spreadSize > 0 ? spreadSize : 0;
  }, [cards.length, spreadSize]);

  const [cardDisplayStates, setCardDisplayStates] = useState<CardDisplayState[]>([]);

  // Initialize or update cardDisplayStates when the number of cards changes
  useEffect(() => {
    console.log("ReadingPage: Initializing/Updating cardDisplayStates for numberOfCards:", numberOfCardsToDisplay);
    setCardDisplayStates(
      Array(numberOfCardsToDisplay)
        .fill(null)
        .map((_, index) => ({
          id: cards[index]?.id || `card-${index}`, // Use actual card id if available
          flipAnimationCompleted: false,
        }))
    );
  }, [numberOfCardsToDisplay, cards]); // Depend on cards to get IDs

  // Back-guard: if no question, navigate to home
  useEffect(() => {
    if (!question && numberOfCardsToDisplay === 0 && !isFetching) {
      console.log("ReadingPage: No question and no cards, navigating to home.");
      navigate("/");
    }
  }, [question, numberOfCardsToDisplay, isFetching, navigate]);


  const handleCardFlipAnimationCompleted = (index: number) => {
    console.log(`ReadingPage: Card at index ${index} flip animation completed.`);
    setCardDisplayStates((prevStates) =>
      prevStates.map((state, i) =>
        i === index ? { ...state, flipAnimationCompleted: true } : state
      )
    );
  };

  // This effect for sequential flips is no longer needed as TarotCard handles its own flip.
  // useEffect(() => {
  //   // Sequentially trigger flips when cards are loaded
  // }, [cardDisplayStates]);

  if (numberOfCardsToDisplay === 0 && isFetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-fuchsia-900 to-slate-900 text-amber-100 p-6">
        <LoadingDots />
        <p className="mt-2">Papi Chispa is shuffling the deck...</p>
      </div>
    );
  }
  
  if (numberOfCardsToDisplay === 0 && !isFetching) {
     // This case might be hit briefly before navigation or if store is empty.
     console.log("ReadingPage: No cards to display and not fetching.");
     return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-fuchsia-900 to-slate-900 text-amber-100 p-6">
            <p>Preparing your reading...</p>
        </div>
     )
  }


  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-fuchsia-900 to-slate-900 text-amber-100 p-6">
      <h2 className="text-xl mb-4 italic">{question || "Your reading..."}</h2>

      {/* Card Table */}
      <div className={`grid gap-4 mb-8 grid-cols-${Math.min(numberOfCardsToDisplay, 2)} sm:grid-cols-${Math.min(numberOfCardsToDisplay, 3)} md:grid-cols-${Math.min(numberOfCardsToDisplay, 5)}`}>
        {/* Map over a range up to numberOfCardsToDisplay to ensure placeholders if cards array is not yet full */}
        {Array.from({ length: numberOfCardsToDisplay }).map((_, idx) => {
          const cardData = cards[idx] as DrawnCard | undefined; // Get actual card data if available
          // const cardDisplayState = cardDisplayStates[idx]; // Not directly used for TarotCard props anymore

          return (
            <TarotCard
              key={cardData?.id || `tarot-card-${idx}`} // Use card ID for key if available
              faceUrl={cardData?.imageUrl || null} // Pass imageUrl or null
              onFlipEnd={() => handleCardFlipAnimationCompleted(idx)}
              size={180}
            />
          );
        })}
      </div>

      {/* Chat Bubbles */}
      <div className="mt-8 w-full max-w-2xl flex flex-col gap-4">
        {cards.map((card: DrawnCard, idx: number) => {
          const displayState = cardDisplayStates[idx];
          // Show chat bubble if the card's flip animation is complete and text is available
          if (displayState?.flipAnimationCompleted && card.text) {
            return (
              <ChatBubble
                key={card.id || `chat-${idx}`}
                id={card.id}
                imageUrl={card.imageUrl} // Optional: for an avatar in the bubble
                text={card.text}
              />
            );
          }
          return null;
        })}

        {isFetching && cards.length < numberOfCardsToDisplay && ( // Show loading if fetching and not all cards have data yet
          <div className="self-center py-4">
            <LoadingDots />
            <p className="text-center">Papi Chispa is revealing more...</p>
          </div>
        )}
      </div>
    </div>
  );
}
