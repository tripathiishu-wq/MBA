'use client';

type Props = {
  src: string;
  alt?: string;
  size?: number;
  style?: React.CSSProperties;
};

// Thin client wrapper so onError (event handler) works in server component pages
export default function LogoImg({ src, alt = '', size = 32, style }: Props) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      style={{ objectFit: 'contain', ...style }}
    />
  );
}
