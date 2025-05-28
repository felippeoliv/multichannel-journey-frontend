
import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  TrendingUp,
  Target,
  BarChart3,
  GitBranch,
  Activity,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const statsData = [
  {
    title: 'Leads Ativos',
    value: '2,847',
    change: { value: 12, trend: 'up' as const },
    icon: Users,
  },
  {
    title: 'Taxa de Engajamento',
    value: '84.2%',
    change: { value: 5.1, trend: 'up' as const },
    icon: TrendingUp,
  },
  {
    title: 'Disparos do Mês',
    value: '15,624',
    change: { value: 8.3, trend: 'up' as const },
    icon: MessageSquare,
  },
  {
    title: 'NPS Médio',
    value: '9.1',
    change: { value: 2.4, trend: 'up' as const },
    icon: Target,
  },
];

const chartData = [
  { name: 'Jan', disparos: 4000, conversoes: 2400 },
  { name: 'Fev', disparos: 3000, conversoes: 1398 },
  { name: 'Mar', disparos: 2000, conversoes: 9800 },
  { name: 'Abr', disparos: 2780, conversoes: 3908 },
  { name: 'Mai', disparos: 1890, conversoes: 4800 },
  { name: 'Jun', disparos: 2390, conversoes: 3800 },
];

const journeyData = [
  { name: 'Onboarding Básico', leads: 520, status: 'ativo' },
  { name: 'Follow-up Vendas', leads: 320, status: 'ativo' },
  { name: 'Reativação', leads: 150, status: 'pausado' },
  { name: 'Upsell Premium', leads: 89, status: 'ativo' },
];

export const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Visão geral da sua plataforma de automação
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <select className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
              <option>Últimos 30 dias</option>
              <option>Últimos 7 dias</option>
              <option>Este mês</option>
            </select>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Evolução dos Disparos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="disparos"
                      stroke="#6366f1"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="conversoes"
                      stroke="#10b981"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Performance por Canal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="disparos" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Journey Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5" />
                <span>Performance das Jornadas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {journeyData.map((journey, index) => (
                  <div
                    key={journey.name}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          journey.status === 'ativo' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {journey.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {journey.leads} leads ativos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium capitalize text-gray-600 dark:text-gray-300">
                        {journey.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};
