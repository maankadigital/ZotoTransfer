import React from 'react';

interface LogoProps {
  className?: string;
  isWhite?: boolean;
  variant?: 'icon' | 'full'; // icon = Z icon only, full = Z icon + "ZotoTransfer" wordmark
}

/**
 * ZotoTransfer Logo component.
 * Uses the real brand SVG files from /public.
 * - variant="icon"  → z-logo-blue.svg / z-logo-white.svg
 * - variant="full"  → logo-full-blue.svg / logo-full-white.svg
 */
export const Logo: React.FC<LogoProps> = ({
  className = 'h-10',
  isWhite = false,
  variant = 'icon',
}) => {
  if (variant === 'full') {
    return (
      <img
        src={isWhite ? '/logo-full-white.svg' : '/logo-full-blue.svg'}
        alt="ZotoTransfer"
        className={className}
        style={{ objectFit: 'contain', display: 'block' }}
        draggable={false}
      />
    );
  }

  return (
    <img
      src={isWhite ? '/z-logo-white.svg' : '/z-logo-blue.svg'}
      alt="ZotoTransfer"
      className={className}
      style={{ objectFit: 'contain', display: 'block' }}
      draggable={false}
    />
  );
};
