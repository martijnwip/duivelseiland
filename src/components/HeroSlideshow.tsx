'use client';

import { useState, type ReactElement } from 'react';
import { Fade } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

export type HeroSlide = {
  id: string;
  imageUrl: string;
  alt: string;
  caption: string | null;
};

// Fade zet de breedte van de slides pas na hydration; tot de eerste afbeelding
// geladen is tonen we een spinner in een vlak met dezelfde hoogte, zodat de
// hero niet eerst kleiner verschijnt en dan naar volle breedte springt.

// Hoogte van de indicator-strook onder de slides (margin-top 20 + stip 17,
// zie react-slideshow-image/dist/styles.css), mee gereserveerd tegen verspringen.
const INDICATOR_STRIP_PX = 37;

const arrowClassName =
  'flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[#2b241c] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50';

function HeroLoading({ label }: { label: string }): ReactElement {
  return (
    <>
      <div aria-hidden className="hero-loading w-full" style={{ paddingBottom: INDICATOR_STRIP_PX }}>
        <div className="aspect-video w-full bg-card" />
      </div>
      <div role="status" className="hero-loading absolute inset-x-0 top-0 grid aspect-video place-items-center">
        <span
          aria-hidden
          className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary motion-safe:animate-spin"
        />
        <span className="sr-only">{label}</span>
      </div>
    </>
  );
}

type HeroSlideFigureProps = {
  slide: HeroSlide;
  /** Alleen voor de eerste slide: roept aan zodra de afbeelding klaar is (of mislukt). */
  onImageSettled?: () => void;
};

function HeroSlideFigure({ slide, onImageSettled }: HeroSlideFigureProps): ReactElement {
  // De afbeelding kan al klaar zijn vóór hydration; dan komt er geen load-event meer.
  function handleImageRef(image: HTMLImageElement | null) {
    if (image?.complete) onImageSettled?.();
  }

  return (
    <figure className="relative m-0 aspect-video w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={handleImageRef}
        src={slide.imageUrl}
        alt={slide.alt}
        className="h-full w-full object-cover"
        onLoad={onImageSettled}
        onError={onImageSettled}
      />
      {slide.caption ? (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-6 text-lg text-white sm:px-8 sm:py-10 sm:text-2xl">
          {slide.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

type HeroSlideshowProps = {
  slides: HeroSlide[];
  loadingLabel: string;
};

export function HeroSlideshow({ slides, loadingLabel }: HeroSlideshowProps): ReactElement | null {
  const [ready, setReady] = useState(false);

  if (slides.length === 0) {
    return null;
  }

  function handleFirstImageSettled() {
    setReady(true);
  }

  return (
    <div className="relative">
      {/* Zonder JS blijft ready onwaar: dan toch de slideshow tonen, zonder spinner. */}
      <noscript>
        <style>
          {'.hero-fade{position:static!important;opacity:1!important}.hero-loading{display:none!important}'}
        </style>
      </noscript>

      {!ready ? <HeroLoading label={loadingLabel} /> : null}

      <div
        className={
          ready
            ? 'hero-fade opacity-100 transition-opacity duration-500'
            : 'hero-fade pointer-events-none absolute inset-x-0 top-0 opacity-0'
        }
      >
        <Fade
          duration={5000}
          arrows
          indicators
          pauseOnHover
          canSwipe
          prevArrow={
            <button type="button" className={arrowClassName} style={{ left: '1rem' }}>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden />
            </button>
          }
          nextArrow={
            <button type="button" className={arrowClassName} style={{ right: '1rem' }}>
              <ChevronRightIcon className="h-5 w-5" aria-hidden />
            </button>
          }
        >
          {slides.map((slide, index) => (
            <HeroSlideFigure
              key={slide.id}
              slide={slide}
              onImageSettled={index === 0 ? handleFirstImageSettled : undefined}
            />
          ))}
        </Fade>
      </div>
    </div>
  );
}
