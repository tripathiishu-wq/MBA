'use client';
import { useState } from 'react';

type Props = {
  src: string;
  alt?: string;
  size?: number;
  style?: React.CSSProperties;
  'aria-hidden'?: boolean | 'true' | 'false';
};

/**
 * Logo image with two-stage fallback:
 * 1. Clearbit Logo API — proper company logos
 * 2. Google favicon — always resolves, lower quality but reliable
 * 3. Hidden — no broken image icon ever shown
 */
export default function LogoImg({ src, alt = '', size = 32, style, ...rest }: Props) {
  const [stage, setStage] = useState<'primary' | 'fallback' | 'hidden'>('primary');

  if (!src || stage === 'hidden') return null;

  // Derive Google favicon URL from Clearbit URL
  const getFallback = (clearbitUrl: string) => {
    const domain = clearbitUrl.replace('https://logo.clearbit.com/', '').split('?')[0];
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size >= 64 ? 64 : 32}`;
  };

  const imgSrc = stage === 'primary' ? src : getFallback(src);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      width={size}
      height={size}
      style={{ objectFit: 'contain', ...style }}
      onError={() => {
        if (stage === 'primary') setStage('fallback');
        else setStage('hidden');
      }}
      {...rest}
    />
  );
}
