
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { CloseIcon, CryptoIcon } from './icons';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const linkClasses = "flex items-center px-4 py-3 text-text-secondary hover:bg-card hover:text-text transition-colors duration-200 rounded-lg";
  const activeLinkClasses = "bg-button text-text";

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside
        className={`fixed top-0 left-0 z-30 w-64 h-full bg-background border-r border-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <CryptoIcon />
            <span className="text-xl font-bold text-text">TradingUI</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-text-secondary lg:hidden">
            <CloseIcon />
          </button>
        </div>
        <nav className="mt-4 p-2">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="mb-1">
                <NavLink
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
