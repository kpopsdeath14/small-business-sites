import { useState, useCallback, useEffect } from "preact/hooks";

interface Photo {
  src: string;
  alt: string;
}

interface Props {
  photos: Photo[];
  gridClassName?: string;
  itemClassName?: string;
  imgClassName?: string;
}

export default function Lightbox({
  photos,
  gridClassName = "grid grid-cols-2 sm:grid-cols-3 gap-3",
  itemClassName = "aspect-square",
  imgClassName = "h-full w-full object-cover",
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Set<number>>(new Set());
  const markLoaded = useCallback((i: number) => {
    setLoaded((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
  }, []);
  // This island only hydrates once it scrolls into view (client:visible), but the <img> starts
  // loading from the very first paint — on a fast connection it can finish before hydration runs,
  // so the load event fires with no listener attached yet and the shimmer never clears. Checking
  // `.complete` the moment the DOM node mounts catches that case; onLoad still covers the rest.
  const checkAlreadyLoaded = useCallback(
    (i: number) => (el: HTMLImageElement | null) => {
      if (el?.complete) markLoaded(i);
    },
    [markLoaded]
  );

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + delta + photos.length) % photos.length;
      });
    },
    [photos.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, close, step]);

  return (
    <>
      <div class={gridClassName}>
        {photos.map((photo, i) => (
          <button
            type="button"
            key={photo.src}
            onClick={() => setOpenIndex(i)}
            class={`${itemClassName} skel-wrap ${loaded.has(i) ? "is-loaded" : ""} rounded-[var(--radius-md)] ring-1 ring-white/10 transition-shadow duration-500 hover:ring-white/30 hover:shadow-[var(--shadow-elevated)] group block w-full`}
          >
            <img
              ref={checkAlreadyLoaded(i)}
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              onLoad={() => markLoaded(i)}
              class={`${imgClassName} transition-transform duration-500 ease-out group-hover:scale-110`}
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          class="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={close}
        >
          <button
            type="button"
            aria-label="Закрыть"
            class="absolute top-4 right-4 text-white text-3xl leading-none"
            onClick={close}
          >
            &times;
          </button>
          <button
            type="button"
            aria-label="Предыдущее фото"
            class="absolute left-4 text-white text-3xl leading-none px-2"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
          >
            &#8249;
          </button>
          <img
            src={photos[openIndex].src}
            alt={photos[openIndex].alt}
            class="animate-scale-in max-h-[85vh] max-w-[90vw] object-contain rounded-[var(--radius-md)] shadow-[var(--shadow-elevated)]"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Следующее фото"
            class="absolute right-4 text-white text-3xl leading-none px-2"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
          >
            &#8250;
          </button>
        </div>
      )}
    </>
  );
}
