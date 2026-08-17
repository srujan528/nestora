'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { HiInformationCircle } from 'react-icons/hi';

export default function NotificationBar() {
  const t = useTranslations('NotificationBar');
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get notification messages
  const notifications = [
    t('message1'),
    t('message2'),
    t('message3'),
  ].filter(msg => msg && msg.trim() !== '');

  useEffect(() => {
    if (!mounted || notifications.length <= 1 || isExpanded) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % notifications.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [mounted, notifications.length, isExpanded]);

  if (!mounted || notifications.length === 0) {
    return null;
  }

  return (
    <div className="mb-2 sm:mb-3" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-5">
        <div
          className="relative flex items-center justify-center py-3 px-4 sm:px-6 gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl cursor-pointer shadow-sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Icon */}
          <HiInformationCircle className="flex-shrink-0 w-5 h-5" />

          {/* Message Content */}
          <div className="flex-1 text-center overflow-hidden">
            <p
              className={`text-sm font-medium transition-all duration-300 ${
                isExpanded
                  ? 'whitespace-normal'
                  : 'truncate whitespace-nowrap'
              }`}
            >
              {notifications[currentIndex]}
            </p>
          </div>

          {/* Indicators */}
          {notifications.length > 1 && (
            <div className="flex-shrink-0 flex gap-1.5">
              {notifications.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-white w-4'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Notification ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
