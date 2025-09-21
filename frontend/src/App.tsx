import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import PredictPage from './pages/PredictPage';
import PortfolioPage from './pages/PortfolioPage';
import LeaderboardPage from './pages/LeaderboardPage';
import StatsPage from './pages/StatsPage';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';
import NotFoundPage from './pages/NotFoundPage';

import { ROUTES } from './config/constants';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
};

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path={ROUTES.HOME}
              element={
                <motion.div
                  key="home"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <HomePage />
                </motion.div>
              }
            />
            <Route
              path={ROUTES.PREDICT}
              element={
                <motion.div
                  key="predict"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <PredictPage />
                </motion.div>
              }
            />
            <Route
              path={ROUTES.PORTFOLIO}
              element={
                <motion.div
                  key="portfolio"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <PortfolioPage />
                </motion.div>
              }
            />
            <Route
              path={ROUTES.LEADERBOARD}
              element={
                <motion.div
                  key="leaderboard"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <LeaderboardPage />
                </motion.div>
              }
            />
            <Route
              path={ROUTES.STATS}
              element={
                <motion.div
                  key="stats"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <StatsPage />
                </motion.div>
              }
            />
            <Route
              path={ROUTES.PROFILE}
              element={
                <motion.div
                  key="profile"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ProfilePage />
                </motion.div>
              }
            />
            <Route
              path={ROUTES.HELP}
              element={
                <motion.div
                  key="help"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <HelpPage />
                </motion.div>
              }
            />
            <Route
              path="*"
              element={
                <motion.div
                  key="404"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <NotFoundPage />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </Layout>
    </div>
  );
}

export default App;
