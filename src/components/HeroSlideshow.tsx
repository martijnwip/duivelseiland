'use client';

import { Fade } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

export type HeroSlide = {
  id: string;
  imageUrl: string;
  alt: string;
  caption: string | null;
};

const arrowClassName =
  'flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-text transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50';

export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  if (slides.length === 0) {
    return null;
  }

  return (
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
      {slides.map((slide) => (
        <figure key={slide.id} className="relative m-0 aspect-video w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.imageUrl} alt={slide.alt} className="h-full w-full object-cover" />
          {slide.caption ? (
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-6 text-lg text-white sm:px-8 sm:py-10 sm:text-2xl">
              {slide.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </Fade>
  );
}
