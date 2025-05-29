
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Download,
  Calendar,
  Filter,
  Eye,
  Mail,
  Target,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const statsData = [
  {
    title: 'Total de Disparos',
    value: '24,847',
    change: { value: 18.2, trend: 'up' as const },
    icon: MessageSquare,
  },
  {
    title: 'Taxa de Abertura',
    value: '68.4%',
    change: { value: 3.1, trend: 'up' as const },
    icon: Eye,
  },
  {
    title: 'Novos Leads',
    value: '1,247',
    change: { value: 12.5, trend: 'up' as const },
    icon: Users,
  },
  {
    title: 'Taxa de Conversão',
    value: '4.2%',
    change: { value: 0.8, trend: 'down' as const },
    icon: Target,
  },
];

const monthlyData = [
  { month: 'Jan', disparos: 4200, aberturas: 2800, cliques: 840, conversoes: 126 },
  { month: 'Fev', disparos: 3800, aberturas: 2650, cliques: 760, conversoes: 114 },
  { month: 'Mar', disparos: 5200, aberturas: 3640, cliques: 1040, conversoes: 156 },
  { month: 'Abr', disparos: 4600, aberturas: 3220, cliques: 920, conversoes: 138 },
  { month: 'Mai', disparos: 5800, aberturas: 4060, cliques: 1160, conversoes: 174 },
  { month: 'Jun', disparos: 6200, aberturas: 4340, cliques: 1240, conversoes: 186 },
];

const channelData = [
  { name: 'Email', value: 45, color: '#3b82f6' },
  { name: 'WhatsApp', value: 35, color: '#10b981' },
  { name: 'SMS', value: 15, color: '#f59e0b' },
  { name: 'Push', value: 5, color: '#8b5cf6' },
];

const topJourneys = [
  {
    name: 'Onboarding Iniciantes',
    disparos: 2847,
    conversoes: 284,
    taxa: 9.98,
  },
  {
    name: 'Follow-up Vendas',
    disparos: 1856,
    conversoes: 247,
    taxa: 13.31,
  },
  {
    name: 'Reativação Clientes',
    disparos: 924,
    conversoes: 78,
    taxa: 8.44,
  },
  {
    name: 'Upsell Premium',
    disparos: 567,
    conversoes: 89,
    taxa: 15.70,
  },
];

export const Reports = () => {
  const [dateRange, setDateRange] = useState('30days');

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
              Relatórios e Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Acompanhe o desempenho das suas campanhas
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="90days">Últimos 90 dias</option>
              <option value="1year">Último ano</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
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
          {/* Line Chart - Performance ao longo do tempo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Performance Mensal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="disparos"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Disparos"
                    />
                    <Line
                      type="monotone"
                      dataKey="aberturas"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Aberturas"
                    />
                    <Line
                      type="monotone"
                      dataKey="conversoes"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Conversões"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pie Chart - Canais */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Distribuição por Canal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top Performing Journeys */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Top Jornadas por Conversão</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topJourneys.map((journey, index) => (
                  <div
                    key={journey.name}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {journey.name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>{journey.disparos.toLocaleString()} disparos</span>
                        <span>{journey.conversoes} conversões</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        {journey.taxa.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Taxa de conversão
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Engagement Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Métricas de Engajamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cliques" fill="#6366f1" name="Cliques" />
                  <Bar dataKey="conversoes" fill="#10b981" name="Conversões" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};
