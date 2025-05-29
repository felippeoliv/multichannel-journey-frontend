
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Trash2,
  MessageSquare,
  Users,
  Calendar,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const messagesData = [
  {
    id: 1,
    title: 'Welcome Series - Parte 1',
    content: 'Bem-vindo ao nosso sistema! Aqui está seu primeiro passo...',
    status: 'enviada',
    channel: 'email',
    recipients: 247,
    opened: 189,
    clicked: 45,
    scheduledAt: '2024-01-20 09:00',
    sentAt: '2024-01-20 09:00',
    campaign: 'Onboarding',
  },
  {
    id: 2,
    title: 'Promoção Especial - Black Friday',
    content: 'Não perca nossa oferta especial de Black Friday...',
    status: 'agendada',
    channel: 'whatsapp',
    recipients: 156,
    opened: 0,
    clicked: 0,
    scheduledAt: '2024-01-25 14:00',
    sentAt: null,
    campaign: 'Promocional',
  },
  {
    id: 3,
    title: 'Follow-up Vendas',
    content: 'Vimos que você demonstrou interesse em nosso produto...',
    status: 'rascunho',
    channel: 'email',
    recipients: 89,
    opened: 0,
    clicked: 0,
    scheduledAt: null,
    sentAt: null,
    campaign: 'Vendas',
  },
];

const templatesData = [
  {
    id: 1,
    name: 'Boas-vindas Básico',
    description: 'Template para novos usuários',
    channel: 'email',
    variables: ['nome', 'empresa'],
    lastUsed: '2024-01-15',
  },
  {
    id: 2,
    name: 'Follow-up Vendas',
    description: 'Template para acompanhamento comercial',
    channel: 'whatsapp',
    variables: ['nome', 'produto', 'preco'],
    lastUsed: '2024-01-18',
  },
  {
    id: 3,
    name: 'Reativação Cliente',
    description: 'Template para recuperar clientes inativos',
    channel: 'email',
    variables: ['nome', 'ultima_compra'],
    lastUsed: '2024-01-10',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'enviada':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'agendada':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'rascunho':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    case 'erro':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'enviada':
      return <CheckCircle className="w-4 h-4" />;
    case 'agendada':
      return <Clock className="w-4 h-4" />;
    case 'rascunho':
      return <Edit className="w-4 h-4" />;
    case 'erro':
      return <XCircle className="w-4 h-4" />;
    default:
      return <MessageSquare className="w-4 h-4" />;
  }
};

export const Messages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredMessages = messagesData.filter((message) => {
    const matchesSearch = message.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || message.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
              Disparos & Mensagens
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie suas campanhas e templates de mensagem
            </p>
          </div>
          <Button className="mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Nova Mensagem
          </Button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="messages" className="space-y-6">
            <TabsList>
              <TabsTrigger value="messages">Mensagens</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar mensagens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  >
                    <option value="all">Todos os status</option>
                    <option value="enviada">Enviada</option>
                    <option value="agendada">Agendada</option>
                    <option value="rascunho">Rascunho</option>
                    <option value="erro">Erro</option>
                  </select>
                  
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </div>
              </div>

              {/* Messages List */}
              <div className="space-y-4">
                {filteredMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {message.title}
                              </h3>
                              <Badge className={getStatusColor(message.status)}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(message.status)}
                                  <span>{message.status}</span>
                                </div>
                              </Badge>
                              <Badge variant="outline">
                                {message.channel}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              {message.content}
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>{message.recipients} destinatários</span>
                              </div>
                              {message.status === 'enviada' && (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <Eye className="w-4 h-4 text-gray-400" />
                                    <span>{message.opened} aberturas</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Send className="w-4 h-4 text-gray-400" />
                                    <span>{message.clicked} cliques</span>
                                  </div>
                                </>
                              )}
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>
                                  {message.sentAt ? `Enviada em ${message.sentAt}` : 
                                   message.scheduledAt ? `Agendada para ${message.scheduledAt}` : 
                                   'Sem data'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templatesData.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {template.description}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{template.channel}</Badge>
                          <span className="text-xs text-gray-500">
                            Usado em {template.lastUsed}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Variáveis:</h4>
                          <div className="flex flex-wrap gap-1">
                            {template.variables.map((variable) => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {`{${variable}}`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">
                            Usar Template
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
};
