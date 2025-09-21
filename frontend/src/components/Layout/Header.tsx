import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Bars3Icon,
  BellIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

import { useAppStore } from '../../store/appStore';
import { ROUTES } from '../../config/constants';
import Logo from '../UI/Logo';
import PriceDisplay from '../UI/PriceDisplay';
import NotificationDropdown from '../UI/NotificationDropdown';

const Header: React.FC = () => {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen, notifications } = useAppStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  const navigation = [
    { name: 'Predict', href: ROUTES.PREDICT, current: location.pathname === ROUTES.PREDICT },
    { name: 'Portfolio', href: ROUTES.PORTFOLIO, current: location.pathname === ROUTES.PORTFOLIO },
    { name: 'Leaderboard', href: ROUTES.LEADERBOARD, current: location.pathname === ROUTES.LEADERBOARD },
    { name: 'Stats', href: ROUTES.STATS, current: location.pathname === ROUTES.STATS },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
      <div className="mobile-padding">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center">
              <Logo className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold gradient-text hidden sm:block">
                Neureal
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex space-x-8 ml-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.current
                      ? 'text-primary-400 bg-primary-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center section - Price display */}
          <div className="hidden md:block">
            <PriceDisplay />
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Stats button (mobile) */}
            <Link
              to={ROUTES.STATS}
              className="md:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <ChartBarIcon className="h-6 w-6" />
            </Link>

            {/* Notifications */}
            <div className="relative">
              <NotificationDropdown />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 bg-danger-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-xs font-medium text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Wallet connection */}
            <ConnectButton
              chainStatus="icon"
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
              showBalance={{
                smallScreen: false,
                largeScreen: true,
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile price display */}
      <div className="md:hidden border-t border-slate-700/50 px-4 py-2">
        <PriceDisplay compact />
      </div>
    </header>
  );
};

export default Header;
