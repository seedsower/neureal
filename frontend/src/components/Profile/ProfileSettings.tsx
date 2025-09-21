import React from 'react';
import { motion } from 'framer-motion';

const ProfileSettings: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Profile Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter username"
            className="input-primary w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Bio
          </label>
          <textarea
            placeholder="Tell us about yourself"
            rows={3}
            className="input-primary w-full resize-none"
          />
        </div>
        <button className="btn-primary">
          Save Changes
        </button>
      </div>
    </motion.div>
  );
};

export default ProfileSettings;
