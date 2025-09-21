import React from 'react';
import { motion } from 'framer-motion';

const NotificationSettings: React.FC = () => {
  const notificationOptions = [
    { id: 'roundStart', label: 'Round Start', description: 'Get notified when new rounds begin' },
    { id: 'roundEnd', label: 'Round End', description: 'Get notified when rounds are resolved' },
    { id: 'winnings', label: 'Winnings', description: 'Get notified about your winning predictions' },
    { id: 'push', label: 'Push Notifications', description: 'Enable browser push notifications' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Notification Settings</h3>
      <div className="space-y-4">
        {notificationOptions.map((option) => (
          <div key={option.id} className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">{option.label}</div>
              <div className="text-sm text-slate-400">{option.description}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        ))}
        
        <div className="pt-4 border-t border-slate-700/50">
          <button className="btn-primary">
            Save Settings
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationSettings;
