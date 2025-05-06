// src/api/image.ts
export async function drawCardImage(idx: number) {
  return `/img/card0${(idx % 4) + 1}.png`;  // card01‑04.png in /public/img/
}