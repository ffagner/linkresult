import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon'
}

export default function Logo({ size = 'md', variant = 'full' }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-base' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-2.5">
      <div
        style={{ width: s.icon, height: s.icon }}
        className="bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30"
      >
        <svg width={s.icon * 0.6} height={s.icon * 0.6} viewBox="0 0 24 24" fill="none">
          <path d="M4 9h6M4 15h6M14 9l2 2 4-4M14 15l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {variant === 'full' && (
        <div>
          <div className={`font-display font-bold ${s.text} text-foreground leading-none`}>
            Link<span className="text-primary">Results</span>
          </div>
          <div className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase leading-none mt-0.5">
            Tendência Consultoria
          </div>
        </div>
      )}
    </div>
  );
}