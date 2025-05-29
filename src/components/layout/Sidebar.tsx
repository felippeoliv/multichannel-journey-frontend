
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  GitBranch,
  Settings,
  PlusCircle,
  BarChart3,
  Zap,
  ChevronLeft,
  User
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'Jornadas',
    icon: GitBranch,
    href: '/journeys',
  },
  {
    title: 'Contatos',
    icon: Users,
    href: '/leads',
  },
  {
    title: 'Disparos',
    icon: MessageSquare,
    href: '/messages',
  },
  {
    title: 'Integrações',
    icon: Zap,
    href: '/integrations',
  },
  {
    title: 'Relatórios',
    icon: BarChart3,
    href: '/reports',
  },
];

export const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarCollapsed ? 80 : 280,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Exodus
                </span>
              </motion.div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft
                className={cn(
                  "w-5 h-5 text-gray-500 transition-transform",
                  sidebarCollapsed && "rotate-180"
                )}
              />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  isActive && "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium"
                >
                  {item.title}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Quick Actions */}
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t border-gray-200 dark:border-gray-700"
          >
            <NavLink 
              to="/journeys/editor"
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium">Nova Jornada</span>
            </NavLink>
          </motion.div>
        )}

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <NavLink
            to="/settings"
            className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-medium"
              >
                Perfil
              </motion.span>
            )}
          </NavLink>
        </div>
      </div>
    </motion.aside>
  );
};
