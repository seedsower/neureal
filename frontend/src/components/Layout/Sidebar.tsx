import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ChartBarSquareIcon,
  BriefcaseIcon,
  TrophyIcon,
  ChartBarIcon,
  UserIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import { ROUTES, EXTERNAL_LINKS } from '@/config/constants';
import { NavItem } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation: NavItem[] = [
    { name: 'Home', href: ROUTES.HOME, icon: HomeIcon },
    { name: 'Predict', href: ROUTES.PREDICT, icon: ChartBarSquareIcon },
    { name: 'Portfolio', href: ROUTES.PORTFOLIO, icon: BriefcaseIcon },
    { name: 'Leaderboard', href: ROUTES.LEADERBOARD, icon: TrophyIcon },
    { name: 'Stats', href: ROUTES.STATS, icon: ChartBarIcon },
    { name: 'Profile', href: ROUTES.PROFILE, icon: UserIcon },
    { name: 'Help', href: ROUTES.HELP, icon: QuestionMarkCircleIcon },
  ];

  const externalLinks = [
    { name: 'Documentation', href: EXTERNAL_LINKS.DOCS, external: true },
    { name: 'GitHub', href: EXTERNAL_LINKS.GITHUB, external: true },
    { name: 'Discord', href: EXTERNAL_LINKS.DISCORD, external: true },
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 40,
      },
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 40,
      },
    },
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
    closed: {
      opacity: 0,
      x: -20,
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-y-0 left-0 z-50 w-64 glass-dark border-r border-slate-700/50 lg:relative lg:z-auto"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold text-white">Menu</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors lg:hidden"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                <motion.div
                  variants={{
                    open: {
                      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                    },
                    closed: {
                      transition: { staggerChildren: 0.05, staggerDirection: -1 },
                    },
                  }}
                  initial="closed"
                  animate="open"
                  className="space-y-1"
                >
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <motion.div key={item.name} variants={itemVariants}>
                        <Link
                          to={item.href}
                          onClick={onClose}
                          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                          }`}
                        >
                          {Icon && <Icon className="h-5 w-5 mr-3" />}
                          {item.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Divider */}
                <div className="my-6 border-t border-slate-700/50" />

                {/* External Links */}
                <div className="space-y-1">
                  <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Resources
                  </h3>
                  {externalLinks.map((link) => (
                    <motion.div key={link.name} variants={itemVariants}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                      >
                        {link.name}
                        <svg
                          className="h-3 w-3 ml-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </motion.div>
                  ))}
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-slate-700/50">
                <div className="text-xs text-slate-500 text-center">
                  <p>Neureal v1.0.0</p>
                  <p className="mt-1">Built on Base</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
