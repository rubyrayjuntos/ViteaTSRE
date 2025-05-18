// src/components/TarotCard.tsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import LoadingDots from './LoadingDots'; // Assuming LoadingDots is in the same components folder

interface Props {
  faceUrl: string | null; // URL of the card face image, or null if not yet available/face down
  onFlipEnd?: () => void;
  size?: number;          // Size of the card (width in px)
}

export default function TarotCard({ faceUrl, onFlipEnd, size = 180 }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageHasLoaded, setImageHasLoaded] = useState(false);

  // Effect to handle changes in faceUrl (e.g., new card, new reading)
  useEffect(() => {
    setImageHasLoaded(false); // Reset image loaded status
    if (faceUrl) {
      // If there's a faceUrl, we intend to show it, but don't flip immediately.
      // The image's onLoad event will set imageHasLoaded, then another effect will flip.
      setIsFlipped(false); // Ensure card starts face down or resets if faceUrl changes
    } else {
      setIsFlipped(false); // No faceUrl, ensure it's face down
    }
  }, [faceUrl]);

  // Effect to trigger flip once image is confirmed loaded
  useEffect(() => {
    if (faceUrl && imageHasLoaded && !isFlipped) {
      console.log(`TarotCard: Image for ${faceUrl} confirmed loaded, flipping card.`);
      setIsFlipped(true);
    }
  }, [faceUrl, imageHasLoaded, isFlipped]);

  const handleImageActualLoad = () => {
    console.log(`TarotCard: Image ${faceUrl} successfully loaded into <img> tag.`);
    setImageHasLoaded(true);
  };

  const handleImageError = () => {
    console.error(`TarotCard: Error loading image ${faceUrl}.`);
    setImageHasLoaded(true); // Consider it "handled" to allow flip to show potential error/fallback on front
  };

  return (
    <motion.div
      style={{ width: size, height: size * 1.6 }}
      className="perspective-1000"
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        onAnimationComplete={() => {
          if (isFlipped && onFlipEnd) {
            onFlipEnd();
          }
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* back */}
        <div className="absolute w-full h-full rounded-lg bg-[url('/img/card-back.png')] bg-cover shadow-xl" />
        {/* front */}
        {faceUrl && (
          <div
            className="absolute w-full h-full rounded-lg shadow-xl bg-slate-800 flex items-center justify-center overflow-hidden"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
            }}
          >
            {faceUrl ? (
              // An image URL is provided
              <>
                {/* Visible image, shown if imageHasLoaded is true */}
                {imageHasLoaded && (
                  <img
                    src={faceUrl}
                    alt="Tarot Card Face"
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
                {/* Hidden image element to trigger loading and callbacks, only if not yet loaded */}
                {!imageHasLoaded && (
                  <>
                    <img
                      src={faceUrl}
                      alt="" // Decorative, for loading purpose
                      onLoad={handleImageActualLoad}
                      onError={handleImageError}
                      className="w-0 h-0 absolute opacity-0 pointer-events-none" // Make it non-interactive and invisible
                    />
                    <LoadingDots />
                  </>
                )}
              </>
            ) : (
               <div className="text-xs text-slate-400">No image</div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
