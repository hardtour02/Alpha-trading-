
import React from 'react';
import { ChartBarIcon, CurrencyDollarIcon, BellAlertIcon, ShieldCheckIcon, UserCircleIcon, BookOpenIcon } from './components/icons';

export const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: <ChartBarIcon /> },
  { href: '/markets', label: 'Mercados', icon: <CurrencyDollarIcon /> },
  { href: '/signals', label: 'Señales', icon: <BellAlertIcon /> },
  { href: '/risk-management', label: 'Gestión de riesgo', icon: <ShieldCheckIcon /> },
  { href: '/profile', label: 'Perfil / API', icon: <UserCircleIcon /> },
  { href: '/history', label: 'Historial', icon: <BookOpenIcon /> },
];
