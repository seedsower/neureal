import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Disclosure } from '@headlessui/react';
import {
  ChevronDownIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import { EXTERNAL_LINKS } from '../config/constants';

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqItems = [
    {
      question: 'What is Neureal?',
      answer: 'Neureal is a decentralized prediction market built on the Base network where users can stake NEURAL tokens to predict whether the token price will go UP or DOWN in 24-hour rounds.',
    },
    {
      question: 'How do prediction rounds work?',
      answer: 'Each round lasts 24 hours. Users can make predictions during the active phase, then the round locks for 24 hours while the price is tracked. After the round ends, winners can claim their share of the losing pool.',
    },
    {
      question: 'What are the minimum and maximum prediction amounts?',
      answer: 'You can stake a minimum of 1 NEURAL token and a maximum of 100,000 NEURAL tokens per prediction.',
    },
    {
      question: 'How are rewards calculated?',
      answer: 'Winners share the losing pool proportionally based on their stake size. The platform takes a 1% fee from winnings. If you staked 10% of the winning pool, you get 10% of the rewards.',
    },
    {
      question: 'When can I claim my rewards?',
      answer: 'Rewards can be claimed after a round is resolved. You have unlimited time to claim your rewards, but they won\'t earn additional yield while unclaimed.',
    },
    {
      question: 'What happens if I predict incorrectly?',
      answer: 'If your prediction is incorrect, your staked tokens go to the winning pool and are distributed among the correct predictors.',
    },
    {
      question: 'Can I change my prediction after submitting?',
      answer: 'No, predictions cannot be changed once submitted. You can only make one prediction per round per wallet.',
    },
    {
      question: 'What wallets are supported?',
      answer: 'We support MetaMask, WalletConnect, and other Web3 wallets compatible with the Base network.',
    },
    {
      question: 'Are there any fees?',
      answer: 'The platform charges a 1% fee on winnings. You\'ll also pay standard Base network gas fees for transactions.',
    },
    {
      question: 'Is Neureal audited?',
      answer: 'Yes, our smart contracts have been audited by reputable security firms. Audit reports are available in our documentation.',
    },
  ];

  const helpCategories = [
    {
      title: 'Getting Started',
      icon: BookOpenIcon,
      description: 'Learn the basics of using Neureal',
      link: EXTERNAL_LINKS.DOCS,
    },
    {
      title: 'Community Support',
      icon: ChatBubbleLeftRightIcon,
      description: 'Get help from our community',
      link: EXTERNAL_LINKS.DISCORD,
    },
    {
      title: 'Report Issues',
      icon: ExclamationTriangleIcon,
      description: 'Report bugs or technical issues',
      link: EXTERNAL_LINKS.GITHUB,
    },
  ];

  const filteredFAQ = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <QuestionMarkCircleIcon className="h-16 w-16 text-primary-400 mx-auto mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Help Center
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Find answers to common questions and get support for using Neureal
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-primary w-full pl-12"
          />
          <QuestionMarkCircleIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        </div>
      </motion.div>

      {/* Help Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
      >
        {helpCategories.map((category, index) => (
          <motion.a
            key={category.title}
            href={category.link}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="card-glass p-6 hover:shadow-glow-sm transition-all duration-300 group"
          >
            <category.icon className="h-8 w-8 text-primary-400 mb-4 group-hover:text-primary-300 transition-colors" />
            <h3 className="text-lg font-semibold text-white mb-2">{category.title}</h3>
            <p className="text-slate-300 text-sm">{category.description}</p>
          </motion.a>
        ))}
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {filteredFAQ.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Disclosure>
                {({ open }) => (
                  <div className="card-glass overflow-hidden">
                    <Disclosure.Button className="flex justify-between items-center w-full px-6 py-4 text-left hover:bg-slate-700/20 transition-colors">
                      <span className="font-medium text-white">{item.question}</span>
                      <ChevronDownIcon
                        className={`${
                          open ? 'transform rotate-180' : ''
                        } w-5 h-5 text-slate-400 transition-transform`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-6 pb-4">
                      <p className="text-slate-300 leading-relaxed">{item.answer}</p>
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            </motion.div>
          ))}
        </div>

        {filteredFAQ.length === 0 && (
          <div className="text-center py-12">
            <QuestionMarkCircleIcon className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No results found for "{searchQuery}"</p>
            <p className="text-slate-500 text-sm mt-2">
              Try different keywords or check our documentation
            </p>
          </div>
        )}
      </motion.div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center bg-gradient-to-r from-primary-600/20 to-secondary-600/20 rounded-2xl p-8 border border-primary-500/20 max-w-2xl mx-auto"
      >
        <h3 className="text-xl font-bold text-white mb-4">
          Still need help?
        </h3>
        <p className="text-slate-300 mb-6">
          Join our community for real-time support and discussions
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={EXTERNAL_LINKS.DISCORD}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Join Discord
          </a>
          <a
            href={EXTERNAL_LINKS.DOCS}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            Read Docs
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default HelpPage;
