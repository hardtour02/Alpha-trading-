import React from 'react';
import { ChartBarIcon, ShieldCheckIcon, UserCircleIcon, BookOpenIcon, SignalIcon } from './components/icons';

export const NAV_LINKS = [
  { href: '/dashboard', label: 'Registro Trading', icon: <ChartBarIcon /> },
  { href: '/risk-management', label: 'Gestión de riesgo', icon: <ShieldCheckIcon /> },
  { href: '/signals', label: 'Señales', icon: <SignalIcon /> },
  { href: '/profile', label: 'Perfil / API', icon: <UserCircleIcon /> },
  { href: '/history', label: 'Historial', icon: <BookOpenIcon /> },
];