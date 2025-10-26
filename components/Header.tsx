
import React from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { MenuIcon } from './icons';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const currentLink = NAV_LINKS.find(link => link.href === location.pathname);
  const pageTitle = currentLink ? currentLink.label : 'Dashboard';

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b border-border lg:justify-end">
      <button onClick={toggleSidebar} className="text-text lg:hidden">
        <MenuIcon />
      </button>
      <h1 className="text-xl font-semibold text-text lg:hidden">{pageTitle}</h1>
      <div className="flex items-center">
        {/* Placeholder for user avatar or other actions */}
        <div className="w-8 h-8 bg-button rounded-full"></div>
      </div>
    </header>
  );
};

export default Header;
