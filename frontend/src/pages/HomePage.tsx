import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChartBarSquareIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  ClockIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

import { ROUTES } from '@/config/constants';
import Logo from '@/components/UI/Logo';
import PriceDisplay from '@/components/UI/PriceDisplay';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: ChartBarSquareIcon,
      title: '24-Hour Rounds',
      description: 'Predict NEURAL token price movements in structured 24-hour prediction rounds.',
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Stake & Earn',
      description: 'Stake NEURAL tokens on your predictions and earn from the losing pool when you win.',
    },
    {
      icon: TrophyIcon,
      title: 'Compete & Win',
      description: 'Climb the leaderboards and compete with other traders for the highest returns.',
    },
    {
      icon: ClockIcon,
      title: 'Real-time Updates',
      description: 'Get live price feeds and instant notifications about round status and results.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Transparent',
      description: 'Built on Base network with smart contracts ensuring fair and transparent outcomes.',
    },
    {
      icon: GlobeAltIcon,
      title: 'Decentralized',
      description: 'Fully decentralized prediction market with no central authority or manipulation.',
    },
  ];

  const stats = [
    { label: 'Total Volume', value: '$2.5M+' },
    { label: 'Active Users', value: '10K+' },
    { label: 'Rounds Completed', value: '500+' },
    { label: 'Average APY', value: '85%' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-secondary-600/20 to-accent-600/20" />
        <div className="relative mobile-padding py-20 lg:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <Logo className="h-20 w-20 mx-auto mb-6" animated />
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="gradient-text">Neureal</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
                The premier Web3 prediction market for NEURAL token price movements
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <PriceDisplay className="justify-center mb-8" />
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={ROUTES.PREDICT} className="btn-primary">
                  Start Predicting
                </Link>
                <Link to={ROUTES.STATS} className="btn-outline">
                  View Statistics
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mobile-padding py-20">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Neureal?
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Experience the future of decentralized prediction markets with cutting-edge features
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card-glass p-6 hover:shadow-glow-sm transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-primary-500/20 rounded-lg mr-4">
                  <feature.icon className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              </div>
              <p className="text-slate-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mobile-padding py-20 bg-dark-800/30">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Simple steps to start earning with your predictions
            </p>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect Wallet',
                description: 'Connect your Web3 wallet and get NEURAL tokens to start predicting.',
              },
              {
                step: '02',
                title: 'Make Prediction',
                description: 'Choose UP or DOWN for the next 24-hour round and stake your tokens.',
              },
              {
                step: '03',
                title: 'Claim Rewards',
                description: 'If your prediction is correct, claim your share of the losing pool.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full text-white font-bold text-xl mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{item.title}</h3>
                <p className="text-slate-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mobile-padding py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-primary-600/20 to-secondary-600/20 rounded-2xl p-12 border border-primary-500/20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Predicting?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of traders making profitable predictions on NEURAL token price movements
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTES.PREDICT} className="btn-primary">
              Start Now
            </Link>
            <Link to={ROUTES.LEADERBOARD} className="btn-ghost">
              View Leaderboard
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
