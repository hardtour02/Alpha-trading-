import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { CryptoIcon } from './icons';

const Navigation: React.FC = () => {
    const linkClasses = "flex items-center px-4 py-3 text-sm font-medium text-text-secondary rounded-lg hover:bg-button hover:text-text transition-colors";
    const activeLinkClasses = "bg-button text-text";
    
    const mobileLinkClasses = "flex flex-col items-center justify-center text-xs text-text-secondary hover:text-text transition-colors flex-1 py-2";
    const mobileActiveLinkClasses = "text-text";

    const sidebarContent = (
      <>
        <div className="flex-shrink-0 px-4 py-6">
            <Link to="/" className="flex items-center gap-3">
                <CryptoIcon className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold whitespace-nowrap">BOT ALPHA TRADING</span>
            </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2">
            {NAV_LINKS.map((link) => (
                <NavLink
                    key={link.href}
                    to={link.href}
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                >
                    <div className="mr-3">{React.cloneElement(link.icon, { className: 'h-5 w-5' })}</div>
                    {link.label}
                </NavLink>
            ))}
        </nav>
      </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 bg-card border-r border-border">
                {sidebarContent}
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border flex justify-around items-center h-16">
                {NAV_LINKS.map((link) => {
                    // Shorten labels for mobile view to prevent wrapping and improve UI.
                    const mobileLabel = link.label.split(' ')[0].replace('/', '').trim();
                    return (
                        <NavLink
                            key={link.href}
                            to={link.href}
                            className={({ isActive }) => `${mobileLinkClasses} ${isActive ? mobileActiveLinkClasses : ''}`}
                        >
                            {React.cloneElement(link.icon, { className: 'h-6 w-6 mb-1' })}
                            <span>{mobileLabel}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </>
    );
};

export default Navigation;