import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  LayoutDashboard, Building2, ClipboardList, BookOpen, Users, FileText,
  LogOut, User, Menu, X, ChevronRight, BarChart3, CheckSquare
} from 'lucide-react';
import Logo from './Logo';

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Municípios', href: '/admin/municipios', icon: Building2 },
  { label: 'Avaliações', href: '/admin/avaliacoes', icon: ClipboardList },
  { label: 'Séries', href: '/admin/series', icon: BookOpen },
  { label: 'Relatórios', href: '/admin/relatorios', icon: FileText },
  { label: 'Usuários', href: '/admin/usuarios', icon: Users },
];

const pedagogicoNav = [
  { label: 'Dashboard', href: '/pedagogico', icon: LayoutDashboard },
  { label: 'Relatórios', href: '/pedagogico/relatorios', icon: FileText },
];

const municipioNav = [
  { label: 'Meus Relatórios', href: '/municipio', icon: BarChart3 },
];

const navByRole = { admin: adminNav, pedagogico: pedagogicoNav, municipio: municipioNav };
const labelByRole = { admin: 'Admin', pedagogico: 'Pedagógico', municipio: 'Município' };
const colorByRole = { admin: 'text-purple-400', pedagogico: 'text-blue-400', municipio: 'text-cyan-400' };

export default function AppLayout({ role = 'admin', userName = 'Usuário', children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = navByRole[role] || adminNav;

  async function handleLogout() {
    await signOut(auth);
    navigate('/login');
  }

  const NavItem = ({ item }) => {
    const active = location.pathname === item.href || (item.href !== '/admin' && item.href !== '/pedagogico' && item.href !== '/municipio' && location.pathname.startsWith(item.href));
    const Icon = item.icon;
    return (
      <Link
        to={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
          active
            ? 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span>{item.label}</span>
        {active && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-sidebar-border">
        <Logo size="sm" />
      </div>
      <div className="px-3 py-2 mt-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-2 mb-2">
          {labelByRole[role]}
        </p>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => <NavItem key={item.href} item={item} />)}
      </nav>
      <div className="px-3 py-4 border-t border-sidebar-border">
        <Link to="/perfil" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors mb-1">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sidebar-accent-foreground truncate text-xs">{userName}</div>
            <div className={`text-xs ${colorByRole[role]}`}>{labelByRole[role]}</div>
          </div>
        </Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm text-sidebar-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-sidebar animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 lg:px-6 h-16 border-b border-border bg-card flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <Link to="/perfil" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium hidden sm:block">{userName}</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}