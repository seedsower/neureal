import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

import { useAppStore } from '../../store/appStore';
import { formatRelativeTime } from '../../utils/formatters';
import { NotificationMessage } from '../../types';

const NotificationDropdown: React.FC = () => {
  const { notifications, markNotificationRead, clearNotifications } = useAppStore();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-success-400" />;
      case 'error':
        return <XMarkIcon className="h-5 w-5 text-danger-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-accent-400" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-primary-400" />;
    }
  };

  const handleMarkAsRead = (notification: NotificationMessage) => {
    if (!notification.read) {
      markNotificationRead(notification.id);
    }
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right glass-dark rounded-xl shadow-glass border border-slate-700/50 focus:outline-none z-50">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <BellIcon className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <Menu.Item key={notification.id}>
                    {({ active }) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          active ? 'bg-slate-700/50' : ''
                        } ${
                          !notification.read ? 'bg-primary-500/10 border border-primary-500/20' : ''
                        }`}
                        onClick={() => handleMarkAsRead(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-white truncate">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-primary-500 rounded-full ml-2" />
                              )}
                            </div>
                            
                            <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <p className="text-xs text-slate-500 mt-2">
                              {formatRelativeTime(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </Menu.Item>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-700/50">
                <button className="w-full text-sm text-primary-400 hover:text-primary-300 transition-colors">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NotificationDropdown;
