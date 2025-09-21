import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

import { ROUTES } from '@/config/constants';
import Logo from '@/components/UI/Logo';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center mobile-padding">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Logo className="h-16 w-16 mx-auto mb-6" animated />
          
          <div className="mb-6">
            <h1 className="text-6xl md:text-8xl font-bold gradient-text mb-4">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved to another location.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTES.HOME} className="btn-primary">
              <HomeIcon className="h-5 w-5 mr-2" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-outline"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Go Back
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12"
        >
          <p className="text-sm text-slate-500">
            Lost in the prediction market? Let's get you back on track.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
