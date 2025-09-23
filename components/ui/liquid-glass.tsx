'use client'

import { clsx } from 'clsx';
import { ReactNode, useState, useRef, MouseEvent } from 'react';

interface LiquidGlassProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  displacementScale?: number;
  blurAmount?: number;
  saturation?: number;
  elasticity?: number;
  cornerRadius?: number;
  overLight?: boolean;
  disableTransform?: boolean; // 👈 thêm prop mới
}

const LiquidGlass = ({
  children,
  className = '',
  onClick,
  displacementScale = 50,
  blurAmount = 0.1,
  saturation = 130,
  elasticity = 0.15,
  cornerRadius = 24,
  overLight = false,
  disableTransform = false, // 👈 mặc định vẫn có transform
}: LiquidGlassProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const containerStyle = {
    '--mouse-x': mousePosition.x,
    '--mouse-y': mousePosition.y,
    '--displacement': `${displacementScale}px`,
    '--blur': `${blurAmount * 100}px`,
    '--saturation': `${saturation}%`,
    '--elasticity': elasticity,
    '--corner-radius': `${cornerRadius}px`,
    transform: disableTransform
      ? 'translateY(0px)' // 👈 nếu disable thì luôn cố định
      : isHovered
        ? `translate(${mousePosition.x * elasticity * 2}px, ${mousePosition.y * elasticity * 2}px) translateY(-2px)`
        : 'translateY(0px)',
    filter: `saturate(${saturation}%)`,
  } as React.CSSProperties;

  const overlayStyle = {
    background: isHovered
      ? `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 40%, rgba(255, 255, 255, 0.05) 70%)`
      : 'rgba(255, 255, 255, 0.08)',
    opacity: isHovered ? 1 : 0.6,
  } as React.CSSProperties;

  const blurValue = blurAmount * 100;

  return (
    <div
      ref={containerRef}
      className={clsx(
        'relative overflow-hidden transition-all duration-200 ease-out',
        'will-change-transform',
        onClick ? 'cursor-pointer' : 'cursor-default',
        'shadow-lg',
        className,
      )}
      style={{
        ...containerStyle,
        ...(className?.includes('rounded')
          ? {}
          : { borderRadius: `${cornerRadius}px` }),
        backdropFilter: `blur(${Math.min(blurValue, 20)}px)`,
        WebkitBackdropFilter: `blur(${Math.min(blurValue, 20)}px)`,
        background: overLight
          ? 'rgba(0, 0, 0, 0.1)'
          : 'rgba(255, 255, 255, 0.25)',
        ...(className?.includes('border')
          ? {}
          : {
              border: `1px solid ${overLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)'}`,
            }),
        boxShadow: isHovered
          ? `0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.1)`
          : `0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 10px rgba(255, 255, 255, 0.05)`,
        transform: containerStyle.transform,
        filter: `saturate(${Math.min(saturation, 150)}%)`,
      }}
      onMouseMove={disableTransform ? undefined : handleMouseMove}
      onMouseEnter={disableTransform ? undefined : handleMouseEnter}
      onMouseLeave={disableTransform ? undefined : handleMouseLeave}
      onClick={onClick}
    >
      <div
        className={clsx(
          'pointer-events-none absolute inset-0 transition-opacity duration-200',
        )}
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.03) 100%)',
          borderRadius: 'inherit',
        }}
      />
      {!disableTransform && isHovered && (
        <div
          className={clsx(
            'pointer-events-none absolute inset-0 transition-opacity duration-200',
          )}
          style={overlayStyle}
        />
      )}
      {children}
      {!disableTransform && isHovered && (
        <div
          className={clsx('pointer-events-none absolute inset-0 opacity-10')}
          style={{
            borderRadius: 'inherit',
            filter:
              'drop-shadow(1px 0 0 rgba(255, 0, 0, 0.2)) drop-shadow(-1px 0 0 rgba(0, 255, 255, 0.2))',
          }}
        />
      )}
    </div>
  );
};

export default LiquidGlass;
