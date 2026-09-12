'use client';

import { Fade } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';

export type HeroSlide = {
  id: string;
  imageUrl: string;
  alt: string;
  caption: string | null;
};

export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  if (slides.length === 0) {
    return null;
  }

  return (
    <Fade duration={5000} arrows indicators pauseOnHover canSwipe>
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
