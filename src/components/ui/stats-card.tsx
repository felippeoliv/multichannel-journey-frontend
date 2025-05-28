
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon: LucideIcon;
  className?: string;
}

export const StatsCard = ({ title, value, change, icon: Icon, className }: StatsCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "text-sm font-medium",
                  change.trend === 'up' ? "text-green-600" : "text-red-600"
                )}
              >
                {change.trend === 'up' ? '+' : ''}{change.value}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
    </motion.div>
  );
};
