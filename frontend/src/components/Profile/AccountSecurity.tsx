import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const AccountSecurity: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Account Security</h3>
      
      <div className="space-y-6">
        <div className="flex items-start space-x-3 p-4 bg-success-500/10 border border-success-500/20 rounded-lg">
          <ShieldCheckIcon className="h-5 w-5 text-success-400 mt-0.5" />
          <div>
            <div className="text-success-300 font-medium">Wallet Connected</div>
            <div className="text-sm text-success-400 mt-1">
              Your wallet is securely connected via Web3
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-medium mb-3">Connected Wallet</h4>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Address</div>
            <div className="text-white font-mono text-sm">0x1234...5678</div>
          </div>
        </div>
        
        <div className="flex items-start space-x-3 p-4 bg-accent-500/10 border border-accent-500/20 rounded-lg">
          <ExclamationTriangleIcon className="h-5 w-5 text-accent-400 mt-0.5" />
          <div>
            <div className="text-accent-300 font-medium">Security Notice</div>
            <div className="text-sm text-accent-400 mt-1">
              Never share your private keys or seed phrase with anyone
            </div>
          </div>
        </div>
        
        <button className="btn-danger">
          Disconnect Wallet
        </button>
      </div>
    </motion.div>
  );
};

export default AccountSecurity;
