declare module '@/components/ui/button' {
  import { type ButtonHTMLAttributes, type ReactNode } from 'react'
  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    asChild?: boolean
  }
  export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>
}

declare module '@/components/ui/input' {
  import { type InputHTMLAttributes } from 'react'
  interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}
  export const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>
}

declare module '@/components/ui/label' {
  import { type LabelHTMLAttributes } from 'react'
  interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}
  export const Label: React.ForwardRefExoticComponent<LabelProps & React.RefAttributes<HTMLLabelElement>>
}

declare module '@/components/ui/select' {
  import { type ReactNode } from 'react'
  export const Select: React.FC<{ value?: string; onValueChange?: (v: string) => void; required?: boolean; children: ReactNode }>
  export const SelectTrigger: React.FC<{ className?: string; children: ReactNode }>
  export const SelectValue: React.FC<{ placeholder?: string }>
  export const SelectContent: React.FC<{ children: ReactNode }>
  export const SelectItem: React.FC<{ value: string; children: ReactNode }>
}

declare module '@/components/ui/badge' {
  import { type ReactNode } from 'react'
  export const Badge: React.FC<{ variant?: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string; children: ReactNode }>
}

declare module '@/components/ui/card' {
  import { type ReactNode } from 'react'
  export const Card: React.FC<{ className?: string; children: ReactNode }>
  export const CardHeader: React.FC<{ className?: string; children: ReactNode }>
  export const CardTitle: React.FC<{ className?: string; children: ReactNode }>
  export const CardDescription: React.FC<{ className?: string; children: ReactNode }>
  export const CardContent: React.FC<{ className?: string; children: ReactNode }>
  export const CardFooter: React.FC<{ className?: string; children: ReactNode }>
}

declare module '@/components/ui/dialog' {
  import { type ReactNode } from 'react'
  export const Dialog: React.FC<{ open?: boolean; onOpenChange?: (v: boolean) => void; children: ReactNode }>
  export const DialogTrigger: React.FC<{ asChild?: boolean; children: ReactNode }>
  export const DialogContent: React.FC<{ className?: string; children: ReactNode }>
  export const DialogHeader: React.FC<{ className?: string; children: ReactNode }>
  export const DialogTitle: React.FC<{ className?: string; children: ReactNode }>
  export const DialogDescription: React.FC<{ className?: string; children: ReactNode }>
}

declare module '@/components/ui/table' {
  import { type ReactNode } from 'react'
  export const Table: React.FC<{ className?: string; children: ReactNode }>
  export const TableHeader: React.FC<{ className?: string; children: ReactNode }>
  export const TableBody: React.FC<{ className?: string; children: ReactNode }>
  export const TableRow: React.FC<{ className?: string; children: ReactNode }>
  export const TableHead: React.FC<{ className?: string; children: ReactNode }>
  export const TableCell: React.FC<{ className?: string; children: ReactNode }>
}

declare module '@/components/ui/sonner' {
  export const Toaster: React.FC<{ position?: string; richColors?: boolean }>
}

declare module '@/components/ui/avatar' {
  import { type ReactNode } from 'react'
  export const Avatar: React.FC<{ className?: string; children: ReactNode }>
  export const AvatarImage: React.FC<{ src?: string; alt?: string; className?: string }>
  export const AvatarFallback: React.FC<{ className?: string; children: ReactNode }>
}

declare module '@/components/ui/breadcrumb' {
  import { type ReactNode } from 'react'
  export const Breadcrumb: React.FC<{ children: ReactNode }>
  export const BreadcrumbList: React.FC<{ className?: string; children: ReactNode }>
  export const BreadcrumbItem: React.FC<{ className?: string; children: ReactNode }>
  export const BreadcrumbLink: React.FC<{ href?: string; className?: string; children: ReactNode }>
  export const BreadcrumbSeparator: React.FC<{ children?: ReactNode }>
}

declare module '@/components/ui/scroll-area' {
  import { type ReactNode } from 'react'
  export const ScrollArea: React.FC<{ className?: string; children: ReactNode }>
  export const ScrollBar: React.FC<{ className?: string }>
  export const ScrollAreaViewport: React.FC<{ className?: string; children: ReactNode }>
}
