
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
  Send,
  MousePointer,
  Heart,
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
    title: 'Taxa de Entrega',
    value: '94.8%',
    change: { value: 2.1, trend: 'up' as const },
    icon: Send,
  },
  {
    title: 'Taxa de Leitura',
    value: '68.4%',
    change: { value: 5.3, trend: 'up' as const },
    icon: Eye,
  },
  {
    title: 'Engajamento Geral',
    value: '32.7%',
    change: { value: 3.8, trend: 'up' as const },
    icon: MousePointer,
  },
];

const monthlyData = [
  { month: 'Jan', disparos: 4200, entrega: 3948, leitura: 2800, cliques: 840, engajamento: 1260 },
  { month: 'Fev', disparos: 3800, entrega: 3572, leitura: 2650, cliques: 760, engajamento: 1140 },
  { month: 'Mar', disparos: 5200, entrega: 4888, leitura: 3640, cliques: 1040, engajamento: 1560 },
  { month: 'Abr', disparos: 4600, entrega: 4324, leitura: 3220, cliques: 920, engajamento: 1380 },
  { month: 'Mai', disparos: 5800, entrega: 5452, leitura: 4060, cliques: 1160, engajamento: 1740 },
  { month: 'Jun', disparos: 6200, entrega: 5828, leitura: 4340, cliques: 1240, engajamento: 1860 },
];

const channelData = [
  { name: 'Email', value: 45, color: '#3b82f6' },
  { name: 'WhatsApp', value: 35, color: '#10b981' },
  { name: 'SMS', value: 15, color: '#f59e0b' },
  { name: 'Push', value: 5, color: '#8b5cf6' },
];

const topJourneys = [
  {
    name: 'Pesquisa de Satisfação',
    disparos: 567,
    entrega: 97.3,
    leitura: 81.2,
    engajamento: 62.3,
  },
  {
    name: 'Follow-up Vendas',
    disparos: 1856,
    entrega: 96.1,
    leitura: 72.3,
    engajamento: 45.2,
  },
  {
    name: 'Onboarding Iniciantes',
    disparos: 2847,
    entrega: 94.2,
    leitura: 68.4,
    engajamento: 31.8,
  },
  {
    name: 'Reativação Clientes',
    disparos: 924,
    entrega: 91.7,
    leitura: 58.3,
    engajamento: 28.4,
  },
];

export const Reports = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [selectedJourney, setSelectedJourney] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');

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
              Relatórios de Engajamento
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Acompanhe o desempenho e engajamento das suas campanhas
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
            <select
              value={selectedJourney}
              onChange={(e) => setSelectedJourney(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="all">Todas as jornadas</option>
              <option value="onboarding">Onboarding</option>
              <option value="vendas">Vendas</option>
              <option value="pesquisa">Pesquisa</option>
              <option value="reativacao">Reativação</option>
            </select>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="all">Todos os canais</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
            </select>
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
          {/* Line Chart - Engajamento ao longo do tempo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Evolução do Engajamento</span>
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
                      stroke="#6b7280"
                      strokeWidth={2}
                      name="Disparos"
                    />
                    <Line
                      type="monotone"
                      dataKey="entrega"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Entrega"
                    />
                    <Line
                      type="monotone"
                      dataKey="leitura"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Leitura"
                    />
                    <Line
                      type="monotone"
                      dataKey="engajamento"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Engajamento"
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
                <Heart className="w-5 h-5" />
                <span>Jornadas com Melhor Engajamento</span>
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
                        <span>Entrega: {journey.entrega}%</span>
                        <span>Leitura: {journey.leitura}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-purple-600">
                        {journey.engajamento.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Taxa de engajamento
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Engagement Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Funil de Engajamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="entrega" fill="#3b82f6" name="Entrega" />
                  <Bar dataKey="leitura" fill="#10b981" name="Leitura" />
                  <Bar dataKey="cliques" fill="#f59e0b" name="Cliques" />
                  <Bar dataKey="engajamento" fill="#8b5cf6" name="Engajamento" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};
