import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon'
  /**
   * 'auto' segue o tema (bg-card/bg-background — text-foreground e
   * text-muted-foreground mudam junto). 'light' força texto claro, para
   * superfícies sempre escuras independente do tema (sidebar, viewers em
   * bg-slate-800, telas de erro com gradiente fixo). 'dark' força texto
   * escuro, para o card sempre branco das telas de login/recuperação.
   * Sem isso, o texto "Link" fica invisível quando o tom do tema não bate
   * com o tom fixo do fundo onde a logo está.
   */
  tone?: 'auto' | 'light' | 'dark'
}

const toneClasses: Record<NonNullable<LogoProps['tone']>, { text: string; subtitle: string }> = {
  auto: { text: 'text-foreground', subtitle: 'text-muted-foreground' },
  light: { text: 'text-white', subtitle: 'text-slate-400' },
  dark: { text: 'text-slate-900', subtitle: 'text-slate-500' },
};

export default function Logo({ size = 'md', variant = 'full', tone = 'auto' }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-base' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
  };
  const s = sizes[size] || sizes.md;
  const t = toneClasses[tone];

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
          <div className={`font-display font-bold ${s.text} ${t.text} leading-none`}>
            Link<span className="text-primary">Results</span>
          </div>
          <div className={`text-[10px] ${t.subtitle} font-medium tracking-wider uppercase leading-none mt-0.5`}>
            Tendência Consultoria
          </div>
        </div>
      )}
    </div>
  );
}
