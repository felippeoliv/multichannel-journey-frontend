
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Star,
  TrendingUp,
  DollarSign,
  Tag,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const contactsData = [
  {
    id: 1,
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '+55 11 99999-9999',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    tags: ['lead', 'premium', 'interessado'],
    source: 'website',
    lastContact: '2024-01-20',
    firstContact: '2024-01-15',
    value: 2500,
    score: 85,
    status: 'ativo',
    city: 'São Paulo',
    state: 'SP',
    company: 'Tech Solutions',
    position: 'Gerente de TI',
    engagementLevel: 'Alto',
    totalInteractions: 15,
    lastInteraction: 'Email aberto',
    conversionProbability: 85,
  },
  {
    id: 2,
    name: 'Carlos Santos',
    email: 'carlos@empresa.com',
    phone: '+55 21 88888-8888',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    tags: ['cliente', 'produto-x', 'recorrente'],
    source: 'facebook',
    lastContact: '2024-01-19',
    firstContact: '2024-01-10',
    value: 1200,
    score: 45,
    status: 'ativo',
    city: 'Rio de Janeiro',
    state: 'RJ',
    company: 'Innovate Corp',
    position: 'CEO',
    engagementLevel: 'Médio',
    totalInteractions: 8,
    lastInteraction: 'WhatsApp respondido',
    conversionProbability: 60,
  },
  {
    id: 3,
    name: 'Maria Oliveira',
    email: 'maria.oliveira@gmail.com',
    phone: '+55 31 77777-7777',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    tags: ['cliente', 'vip', 'produto-y'],
    source: 'indicacao',
    lastContact: '2024-01-18',
    firstContact: '2024-01-05',
    value: 5000,
    score: 95,
    status: 'ativo',
    city: 'Belo Horizonte',
    state: 'MG',
    company: 'Growth Labs',
    position: 'Diretora de Marketing',
    engagementLevel: 'Muito Alto',
    totalInteractions: 32,
    lastInteraction: 'Reunião agendada',
    conversionProbability: 95,
  },
  {
    id: 4,
    name: 'João Costa',
    email: 'joao.costa@email.com',
    phone: '+55 85 66666-6666',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao',
    tags: ['lead', 'startup', 'produto-x'],
    source: 'linkedin',
    lastContact: '2024-01-17',
    firstContact: '2024-01-12',
    value: 800,
    score: 60,
    status: 'ativo',
    city: 'Fortaleza',
    state: 'CE',
    company: 'StartupXYZ',
    position: 'Fundador',
    engagementLevel: 'Médio',
    totalInteractions: 12,
    lastInteraction: 'Email clicado',
    conversionProbability: 70,
  },
];

const getTagColor = (tag: string) => {
  const colors: { [key: string]: string } = {
    'lead': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    'cliente': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    'premium': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    'vip': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    'produto-x': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    'produto-y': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
    'recorrente': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
    'interessado': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
    'startup': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
  };
  return colors[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
};

const getEngagementColor = (level: string) => {
  switch (level) {
    case 'Muito Alto':
      return 'text-green-600 dark:text-green-400';
    case 'Alto':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'Médio':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'Baixo':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

export const ContactsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');

  // Get all unique tags for the filter
  const allTags = Array.from(
    new Set(contactsData.flatMap(contact => contact.tags))
  ).sort();

  const filteredContacts = contactsData.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterTag === 'all' || contact.tags.includes(filterTag);
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
              Tabela de Contatos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Visualização completa de todos os dados dos contatos para análise detalhada
            </p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Contato
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Score Médio</p>
                  <p className="text-2xl font-bold">
                    {Math.round(contactsData.reduce((acc, c) => acc + c.score, 0) / contactsData.length)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</p>
                  <p className="text-2xl font-bold">
                    R$ {contactsData.reduce((acc, c) => acc + c.value, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interações</p>
                  <p className="text-2xl font-bold">
                    {contactsData.reduce((acc, c) => acc + c.totalInteractions, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversão Média</p>
                  <p className="text-2xl font-bold">
                    {Math.round(contactsData.reduce((acc, c) => acc + c.conversionProbability, 0) / contactsData.length)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="all">Todas as tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </option>
              ))}
            </select>
            
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Mais Filtros
            </Button>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Contatos Detalhados ({filteredContacts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contato</TableHead>
                      <TableHead>Empresa/Cargo</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Engajamento</TableHead>
                      <TableHead>Conversão</TableHead>
                      <TableHead>Interações</TableHead>
                      <TableHead>Última Atividade</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact, index) => (
                      <motion.tr
                        key={contact.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={contact.avatar} />
                              <AvatarFallback>
                                {contact.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-3 h-3" />
                                <span>{contact.email}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="w-3 h-3" />
                                <span>{contact.phone}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-medium">{contact.company}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{contact.position}</p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-medium">{contact.city}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{contact.state}</p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} className={`text-xs ${getTagColor(tag)}`}>
                                {tag}
                              </Badge>
                            ))}
                            {contact.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{contact.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="font-medium">{contact.score}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <span className="font-medium">R$ {contact.value.toLocaleString()}</span>
                        </TableCell>
                        
                        <TableCell>
                          <span className={`font-medium ${getEngagementColor(contact.engagementLevel)}`}>
                            {contact.engagementLevel}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="font-medium">{contact.conversionProbability}%</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-medium">{contact.totalInteractions}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{contact.lastInteraction}</p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="text-sm">{contact.lastContact}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Fonte: {contact.source}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                ⋯
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizar Perfil
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Enviar Mensagem
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Tag className="w-4 h-4 mr-2" />
                                Gerenciar Tags
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="w-4 h-4 mr-2" />
                                Agendar Follow-up
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};
