import React from 'react';
import { ChartBarIcon, CurrencyDollarIcon, BellAlertIcon, ShieldCheckIcon, UserCircleIcon, BookOpenIcon } from './components/icons';

export const NAV_LINKS = [
  { href: '/risk-management', label: 'Gestión de riesgo', icon: <ShieldCheckIcon /> },
  { href: '/dashboard', label: 'Registro Trading', icon: <ChartBarIcon /> },
  { href: '/markets', label: 'Mercados', icon: <CurrencyDollarIcon /> },
  { href: '/signals', label: 'Señales', icon: <BellAlertIcon /> },
  { href: '/profile', label: 'Perfil / API', icon: <UserCircleIcon /> },
  { href: '/history', label: 'Historial', icon: <BookOpenIcon /> },
];