
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Settings,
  CheckCircle,
  XCircle,
  Plus,
  ExternalLink,
  Key,
  Webhook,
  Database,
  MessageSquare,
  Mail,
  ShoppingCart,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const integrationsData = [
  {
    id: 1,
    name: 'WhatsApp Business',
    description: 'Envie mensagens automatizadas via WhatsApp',
    category: 'messaging',
    icon: MessageSquare,
    connected: true,
    status: 'ativo',
    lastSync: '2024-01-20 10:30',
    features: ['Mensagens', 'Templates', 'Webhooks'],
  },
  {
    id: 2,
    name: 'Pipedrive CRM',
    description: 'Sincronize leads e oportunidades',
    category: 'crm',
    icon: Database,
    connected: true,
    status: 'ativo',
    lastSync: '2024-01-20 09:15',
    features: ['Leads', 'Deals', 'Pessoas'],
  },
  {
    id: 3,
    name: 'SendGrid Email',
    description: 'Disparo de emails em massa',
    category: 'email',
    icon: Mail,
    connected: false,
    status: 'inativo',
    lastSync: null,
    features: ['Emails', 'Templates', 'Analytics'],
  },
  {
    id: 4,
    name: 'Stripe Payments',
    description: 'Processar pagamentos e assinaturas',
    category: 'payment',
    icon: ShoppingCart,
    connected: true,
    status: 'ativo',
    lastSync: '2024-01-20 08:45',
    features: ['Pagamentos', 'Assinaturas', 'Webhooks'],
  },
  {
    id: 5,
    name: 'Evolution API',
    description: 'API para automação avançada',
    category: 'api',
    icon: Zap,
    connected: false,
    status: 'inativo',
    lastSync: null,
    features: ['API', 'Webhooks', 'Automação'],
  },
  {
    id: 6,
    name: 'Google Analytics',
    description: 'Rastreamento e métricas avançadas',
    category: 'analytics',
    icon: Database,
    connected: true,
    status: 'ativo',
    lastSync: '2024-01-20 11:00',
    features: ['Tracking', 'Conversões', 'Relatórios'],
  },
];

const webhooksData = [
  {
    id: 1,
    name: 'Lead Criado',
    url: 'https://api.exodus.com/webhooks/lead-created',
    events: ['lead.created', 'lead.updated'],
    status: 'ativo',
    lastTriggered: '2024-01-20 10:15',
  },
  {
    id: 2,
    name: 'Pagamento Aprovado',
    url: 'https://api.exodus.com/webhooks/payment-approved',
    events: ['payment.approved', 'subscription.created'],
    status: 'ativo',
    lastTriggered: '2024-01-19 16:30',
  },
  {
    id: 3,
    name: 'Mensagem Enviada',
    url: 'https://api.exodus.com/webhooks/message-sent',
    events: ['message.sent', 'message.delivered'],
    status: 'inativo',
    lastTriggered: null,
  },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'messaging':
      return MessageSquare;
    case 'email':
      return Mail;
    case 'crm':
      return Database;
    case 'payment':
      return ShoppingCart;
    case 'api':
      return Zap;
    case 'analytics':
      return Database;
    default:
      return Settings;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'messaging':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'email':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'crm':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'payment':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'api':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'analytics':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

export const Integrations = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredIntegrations = integrationsData.filter((integration) => {
    return selectedCategory === 'all' || integration.category === selectedCategory;
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
              Integrações
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Conecte suas ferramentas favoritas com o Exodus
            </p>
          </div>
          <Button className="mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Nova Integração
          </Button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="integrations" className="space-y-6">
            <TabsList>
              <TabsTrigger value="integrations">Integrações</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            </TabsList>

            <TabsContent value="integrations" className="space-y-6">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  Todas
                </Button>
                <Button
                  variant={selectedCategory === 'messaging' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('messaging')}
                >
                  Mensagens
                </Button>
                <Button
                  variant={selectedCategory === 'email' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('email')}
                >
                  Email
                </Button>
                <Button
                  variant={selectedCategory === 'crm' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('crm')}
                >
                  CRM
                </Button>
                <Button
                  variant={selectedCategory === 'payment' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('payment')}
                >
                  Pagamentos
                </Button>
              </div>

              {/* Integrations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIntegrations.map((integration, index) => {
                  const IconComponent = integration.icon;
                  return (
                    <motion.div
                      key={integration.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                    >
                      <Card className="h-full">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{integration.name}</CardTitle>
                                <Badge className={getCategoryColor(integration.category)}>
                                  {integration.category}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {integration.connected ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-gray-400" />
                              )}
                              <Switch checked={integration.connected} />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {integration.description}
                          </p>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Recursos:</h4>
                            <div className="flex flex-wrap gap-1">
                              {integration.features.map((feature) => (
                                <Badge key={feature} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {integration.connected && integration.lastSync && (
                            <p className="text-xs text-gray-500">
                              Última sincronização: {integration.lastSync}
                            </p>
                          )}
                          
                          <div className="flex space-x-2">
                            {integration.connected ? (
                              <Button size="sm" variant="outline" className="flex-1">
                                <Settings className="w-4 h-4 mr-2" />
                                Configurar
                              </Button>
                            ) : (
                              <Button size="sm" className="flex-1">
                                Conectar
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-6">
              {/* Webhooks List */}
              <div className="space-y-4">
                {webhooksData.map((webhook, index) => (
                  <motion.div
                    key={webhook.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Webhook className="w-5 h-5 text-gray-400" />
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {webhook.name}
                              </h3>
                              <Badge className={webhook.status === 'ativo' ? 
                                'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                              }>
                                {webhook.status}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {webhook.url}
                            </p>
                            
                            <div className="flex flex-wrap gap-1 mb-2">
                              {webhook.events.map((event) => (
                                <Badge key={event} variant="outline" className="text-xs">
                                  {event}
                                </Badge>
                              ))}
                            </div>
                            
                            {webhook.lastTriggered && (
                              <p className="text-xs text-gray-500">
                                Último disparo: {webhook.lastTriggered}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch checked={webhook.status === 'ativo'} />
                            <Button variant="outline" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="api-keys" className="space-y-6">
              {/* API Keys Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>Chaves de API</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">API Key Principal</h4>
                      <Badge variant="outline">Ativa</Badge>
                    </div>
                    <code className="text-sm bg-white dark:bg-gray-900 p-2 rounded border block">
                      exd_live_abc123...xyz789 (oculta)
                    </code>
                    <p className="text-xs text-gray-500 mt-2">
                      Criada em 15/01/2024 • Último uso: há 2 horas
                    </p>
                  </div>
                  
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Gerar Nova Chave
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
};
