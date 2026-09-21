'use client';

import { useState, type ComponentProps, type ReactElement } from 'react';
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

// Fade zet de breedte van de slides pas na hydration; tot de eerste afbeelding
// geladen is tonen we een spinner in een vlak met dezelfde hoogte, zodat de
// hero niet eerst kleiner verschijnt en dan naar volle breedte springt.

// Bewust vaste kleuren: de pijl is een lichte pil op de foto, in beide thema's.
const controlClassName =
  'flex size-9 items-center justify-center rounded-full bg-white/70 text-[#2b241c] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50';

// De library tekent de stip als ::before in vast zwart met opacity .25 (actief .75): onzichtbaar in het
// donkere thema. Themakleur en meer contrast; `!` omdat de library-selectors specifieker zijn.
const indicatorClassName =
  'each-slideshow-indicator opacity-60! before:bg-text! hover:opacity-100! [&.active]:opacity-100!';

// `!`: de library zet zelf left/right: 0 met hogere specificiteit.
const arrowPositionClassName = { prev: 'left-4!', next: 'right-4!' } as const;

export type HeroSlideshowLabels = {
  /** Naam van de regio (landmark) rond de slideshow. */
  region: string;
  loading: string;
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

function HeroLoading({ label }: { label: string }): ReactElement {
  return (
    <>
      {/* pb-[37px]: hoogte van de indicator-strook onder de slides (margin-top 20 + stip 17,
          zie react-slideshow-image/dist/styles.css), mee gereserveerd tegen verspringen. */}
      <div aria-hidden className="w-full pb-[37px] noscript:hidden">
        <div className="aspect-video w-full bg-card" />
      </div>
      <output className="absolute inset-x-0 top-0 grid aspect-video place-items-center noscript:hidden">
        <span
          aria-hidden
          className="size-10 rounded-full border-4 border-primary/30 border-t-primary motion-safe:animate-spin"
        />
        <span className="sr-only">{label}</span>
      </output>
    </>
  );
}

type HeroSlideFigureProps = {
  slide: HeroSlide;
  /** De eerste slide is de LCP-afbeelding: laat de browser die met hoge prioriteit ophalen. */
  priority?: boolean;
  /** Alleen voor de eerste slide: roept aan zodra de afbeelding klaar is (of mislukt). */
  onImageSettled?: () => void;
};

function HeroSlideFigure({ slide, priority, onImageSettled }: HeroSlideFigureProps): ReactElement {
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
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
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
  labels: HeroSlideshowLabels;
};

export function HeroSlideshow({ slides, labels }: HeroSlideshowProps): ReactElement | null {
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  if (slides.length === 0) {
    return null;
  }

  function handleToggleAutoplay() {
    setPaused((current) => !current);
  }

  function handleFirstImageSettled() {
    setReady(true);
  }

  function renderIndicator(index = 0): ReactElement {
    return (
      <SlideIndicator className={indicatorClassName} label={labels.goToSlide.replace('{number}', String(index + 1))} />
    );
  }

  return (
    <section aria-label={labels.region} className="relative">
      {!ready ? <HeroLoading label={labels.loading} /> : null}

      {/* Vóór de slides in de DOM: eerste stop in de tab-volgorde. Bij "beweging verminderen" is er geen autoplay. */}
      {ready && !prefersReducedMotion ? (
        <AutoplayToggle paused={paused} labels={labels} onToggle={handleToggleAutoplay} />
      ) : null}

      {/* Tijdens het laden onzichtbaar (buiten tab-volgorde en schermlezer) maar wel gemeten door
          Fade. Zonder JS wordt ready nooit waar; `noscript:` toont de slideshow dan toch. */}
      <div
        data-loading={ready ? undefined : ''}
        className="opacity-100 transition-opacity duration-500 motion-reduce:transition-none data-loading:pointer-events-none data-loading:invisible data-loading:absolute data-loading:inset-x-0 data-loading:top-0 data-loading:opacity-0 noscript:pointer-events-auto noscript:visible noscript:static noscript:opacity-100"
      >
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
            <HeroSlideFigure
              key={slide.id}
              slide={slide}
              priority={index === 0}
              onImageSettled={index === 0 ? handleFirstImageSettled : undefined}
            />
          ))}
        </Fade>
      </div>
    </section>
  );
}
