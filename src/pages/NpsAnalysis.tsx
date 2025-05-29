
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Star,
  Filter,
  Calendar,
  Download,
  ThumbsUp,
  ThumbsDown,
  Minus,
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

const npsData = [
  {
    title: 'NPS Geral',
    value: '42',
    change: { value: 8.3, trend: 'up' as const },
    icon: Star,
  },
  {
    title: 'Respostas Totais',
    value: '1,847',
    change: { value: 15.2, trend: 'up' as const },
    icon: MessageSquare,
  },
  {
    title: 'Promotores',
    value: '847',
    change: { value: 12.1, trend: 'up' as const },
    icon: ThumbsUp,
  },
  {
    title: 'Detratores',
    value: '124',
    change: { value: 3.2, trend: 'down' as const },
    icon: ThumbsDown,
  },
];

const monthlyNpsData = [
  { month: 'Jan', nps: 38, respostas: 145, promotores: 67, neutros: 58, detratores: 20 },
  { month: 'Fev', nps: 41, respostas: 178, promotores: 84, neutros: 71, detratores: 23 },
  { month: 'Mar', nps: 44, respostas: 223, promotores: 112, neutros: 89, detratores: 22 },
  { month: 'Abr', nps: 39, respostas: 189, promotores: 89, neutros: 78, detratores: 22 },
  { month: 'Mai', nps: 46, respostas: 267, promotores: 134, neutros: 109, detratores: 24 },
  { month: 'Jun', nps: 42, respostas: 298, promotores: 147, neutros: 127, detratores: 24 },
];

const segmentData = [
  { name: 'Promotores', value: 46, color: '#10b981' },
  { name: 'Neutros', value: 39, color: '#f59e0b' },
  { name: 'Detratores', value: 15, color: '#ef4444' },
];

const categoryData = [
  {
    categoria: 'Onboarding',
    nps: 52,
    respostas: 423,
    tendencia: 'up',
  },
  {
    categoria: 'Suporte',
    nps: 38,
    respostas: 567,
    tendencia: 'down',
  },
  {
    categoria: 'Produto',
    nps: 45,
    respostas: 634,
    tendencia: 'up',
  },
  {
    categoria: 'Billing',
    nps: 28,
    respostas: 223,
    tendencia: 'down',
  },
];

const recentFeedback = [
  {
    id: 1,
    score: 9,
    type: 'promoter',
    comment: 'Plataforma incrível! Interface muito intuitiva e suporte excelente.',
    date: '2024-01-28',
    segment: 'Onboarding',
  },
  {
    id: 2,
    score: 3,
    type: 'detractor',
    comment: 'Tive problemas com a integração, processo muito complicado.',
    date: '2024-01-28',
    segment: 'Suporte',
  },
  {
    id: 3,
    score: 8,
    type: 'promoter',
    comment: 'Ótima ferramenta, mas poderia ter mais templates.',
    date: '2024-01-27',
    segment: 'Produto',
  },
  {
    id: 4,
    score: 7,
    type: 'neutral',
    comment: 'Bom produto, mas preço um pouco alto.',
    date: '2024-01-27',
    segment: 'Billing',
  },
];

const getScoreColor = (score: number) => {
  if (score >= 9) return 'text-green-600 bg-green-100';
  if (score >= 7) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'promoter':
      return <ThumbsUp className="w-4 h-4 text-green-600" />;
    case 'detractor':
      return <ThumbsDown className="w-4 h-4 text-red-600" />;
    default:
      return <Minus className="w-4 h-4 text-yellow-600" />;
  }
};

export const NpsAnalysis = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [selectedSegment, setSelectedSegment] = useState('all');

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
              Análise de NPS
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Acompanhe a satisfação e lealdade dos seus clientes
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
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="all">Todos os segmentos</option>
              <option value="onboarding">Onboarding</option>
              <option value="suporte">Suporte</option>
              <option value="produto">Produto</option>
              <option value="billing">Billing</option>
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
          {npsData.map((stat, index) => (
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
          {/* NPS Evolution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Evolução do NPS</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyNpsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="nps"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      name="NPS"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Distribuição de Respostas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {segmentData.map((entry, index) => (
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

        {/* Category Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>NPS por Categoria</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.map((category) => (
                  <div
                    key={category.categoria}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {category.categoria}
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {category.respostas.toLocaleString()} respostas
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {category.nps}
                        </div>
                        <div className="text-xs text-gray-500">NPS</div>
                      </div>
                      {category.tendencia === 'up' ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Feedback Recente</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${getScoreColor(feedback.score)}`}>
                          {feedback.score}
                        </div>
                        {getTypeIcon(feedback.type)}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {feedback.segment}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{feedback.date}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{feedback.comment}</p>
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
