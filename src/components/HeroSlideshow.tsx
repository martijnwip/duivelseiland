'use client';

import { useState, type ComponentProps, type ReactElement } from 'react';
import Image from 'next/image';
import { Fade } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from '@radix-ui/react-icons';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

export type HeroSlide = {
  id: string;
  imageUrl: string;
  alt: string;
  caption: string | null;
};

// Fade legt de slides pas na hydration over elkaar (met inline breedtes en left-offsets); daarvóór
// staan ze onder elkaar. Deze CSS doet hetzelfde al in de server-HTML: alle slides in één gridcel,
// zonder offsets. Zo is de eerste foto direct zichtbaar en hangt de LCP niet af van hydration.
// `!` omdat Fade de breedtes en offsets inline zet.
const fadeLayoutClassName =
  '[&_.react-slideshow-fadezoom-images-wrap]:grid! [&_.react-slideshow-fadezoom-images-wrap]:w-full! [&_.react-slideshow-fadezoom-images-wrap>div]:[grid-area:1/1]! [&_.react-slideshow-fadezoom-images-wrap>div]:left-0! [&_.react-slideshow-fadezoom-images-wrap>div]:w-full!';

// De hero loopt over de volle breedte van het scherm.
const heroSizes = '100vw';

// Bewust vaste kleuren: de pijl is een lichte pil op de foto, in beide thema's.
const controlClassName =
  'flex size-9 items-center justify-center rounded-full bg-white/70 text-[#202020] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50';

// De library tekent de stip als ::before in vast zwart met opacity .25 (actief .75): onzichtbaar in het
// donkere thema. Themakleur en meer contrast; `!` omdat de library-selectors specifieker zijn.
const indicatorClassName =
  'each-slideshow-indicator opacity-60! before:bg-text! hover:opacity-100! [&.active]:opacity-100!';

// `!`: de library zet zelf left/right: 0 met hogere specificiteit.
const arrowPositionClassName = { prev: 'left-4!', next: 'right-4!' } as const;

export type HeroSlideshowLabels = {
  /** Naam van de regio (landmark) rond de slideshow. */
  region: string;
  previous: string;
  next: string;
  /** Knop-labels voor het stoppen en weer starten van het automatisch wisselen. */
  pause: string;
  play: string;
  /** Sjabloon met `{number}`, bijv. "Ga naar dia {number}". */
  goToSlide: string;
};

// De library zet zelf Engelse aria-labels ("Previous Slide", "Go to slide 2")
// op de knoppen die ze kloont; onze eigen label komt na de spread en wint.
type SlideArrowProps = ComponentProps<'button'> & { direction: 'prev' | 'next'; label: string };

function SlideArrow({ direction, label, className, ...buttonProps }: SlideArrowProps): ReactElement {
  const Icon = direction === 'prev' ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <button
      type="button"
      {...buttonProps}
      aria-label={label}
      className={`${className} ${arrowPositionClassName[direction]}`}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}

type SlideIndicatorProps = ComponentProps<'button'> & { label: string };

function SlideIndicator({ label, className, ...buttonProps }: SlideIndicatorProps): ReactElement {
  return (
    <li>
      <button type="button" {...buttonProps} aria-label={label} className={className} />
    </li>
  );
}

type AutoplayToggleProps = {
  paused: boolean;
  labels: Pick<HeroSlideshowLabels, 'pause' | 'play'>;
  onToggle: () => void;
};

// WCAG 2.2.2: automatisch wisselende inhoud moet te stoppen zijn, niet alleen met de muis.
function AutoplayToggle({ paused, labels, onToggle }: AutoplayToggleProps): ReactElement {
  const Icon = paused ? PlayIcon : PauseIcon;

  return (
    <button
      type="button"
      aria-label={paused ? labels.play : labels.pause}
      className={`${controlClassName} absolute top-4 right-4 z-20`}
      onClick={onToggle}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}

type HeroSlideFigureProps = {
  slide: HeroSlide;
  /** De eerste slide is de LCP-afbeelding: preload en hoge prioriteit. */
  priority?: boolean;
};

function HeroSlideFigure({ slide, priority }: HeroSlideFigureProps): ReactElement {
  return (
    <figure className="relative m-0 aspect-video w-full overflow-hidden">
      {/* Via next/image: vanaf het eigen domein, als AVIF/WebP en op schermformaat (ook voor Beeldbank-foto's).
          Next 15 zet bij `priority` geen fetchpriority; die geven we zelf mee (geldt ook voor de preload). */}
      <Image
        src={slide.imageUrl}
        alt={slide.alt}
        fill
        sizes={heroSizes}
        priority={priority}
        fetchPriority={priority ? 'high' : undefined}
        className="object-cover"
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
  labels: HeroSlideshowLabels;
};

export function HeroSlideshow({ slides, labels }: HeroSlideshowProps): ReactElement | null {
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  if (slides.length === 0) {
    return null;
  }

  function handleToggleAutoplay() {
    setPaused((current) => !current);
  }

  function renderIndicator(index = 0): ReactElement {
    return (
      <SlideIndicator className={indicatorClassName} label={labels.goToSlide.replace('{number}', String(index + 1))} />
    );
  }

  return (
    <section aria-label={labels.region} className={`relative ${fadeLayoutClassName}`}>
      {/* Vóór de slides in de DOM: eerste stop in de tab-volgorde. Bij "beweging verminderen" is er geen autoplay. */}
      {!prefersReducedMotion ? <AutoplayToggle paused={paused} labels={labels} onToggle={handleToggleAutoplay} /> : null}

      <Fade
        duration={5000}
        autoplay={!prefersReducedMotion && !paused}
        arrows
        indicators={renderIndicator}
        pauseOnHover
        canSwipe
        prevArrow={<SlideArrow direction="prev" label={labels.previous} className={controlClassName} />}
        nextArrow={<SlideArrow direction="next" label={labels.next} className={controlClassName} />}
      >
        {slides.map((slide, index) => (
          <HeroSlideFigure key={slide.id} slide={slide} priority={index === 0} />
        ))}
      </Fade>
    </section>
  );
}
