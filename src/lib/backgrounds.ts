/** public/img 기준 URL. 모델이 반환한 backgroundIndex(1–5)와 대응 */
export const BACKGROUND_IMAGES = [
  "/img/bg-img-01-bekky-bekks-WpiVLsO9l8c-unsplash.jpg",
  "/img/bg-img-02-chinigraphy-CdEhjEF1C4M-unsplash.jpg",
  "/img/bg-img-03-francesco-ungaro-2Mw7ieTa4Z4-unsplash.jpg",
  "/img/bg-img-04-kseniya-lapteva-aMCyy7tSJXU-unsplash.jpg",
  "/img/bg-img-05-lauris-rozentals-RyKLUffUhVM-unsplash.jpg",
] as const;

export function resolveBackgroundUrl(index: number): string {
  const i = Math.min(Math.max(Math.floor(index), 1), BACKGROUND_IMAGES.length);
  return BACKGROUND_IMAGES[i - 1] ?? BACKGROUND_IMAGES[0];
}
