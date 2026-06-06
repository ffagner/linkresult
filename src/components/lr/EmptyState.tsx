import React, { type ReactNode } from 'react';
import type { ComponentType } from 'react';

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        {Icon && <Icon className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="font-heading font-semibold text-foreground text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-6">{description}</p>
      {action && action}
    </div>
  );
}