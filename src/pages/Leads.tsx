import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  Tag,
  Star,
  MessageSquare,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    value: 2500,
    score: 85,
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
    value: 1200,
    score: 45,
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
    value: 5000,
    score: 95,
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
    value: 800,
    score: 60,
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

export const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');

  // Get all unique tags for the filter
  const allTags = Array.from(
    new Set(contactsData.flatMap(contact => contact.tags))
  ).sort();

  const filteredContacts = contactsData.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase());
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
              Contatos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie seus contatos com sistema de tags flexível
            </p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/contacts-table'}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Tabela Detalhada
            </Button>
            <Button className="mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Novo Contato
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Leads</p>
                  <p className="text-2xl font-bold">
                    {contactsData.filter(c => c.tags.includes('lead')).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clientes</p>
                  <p className="text-2xl font-bold">
                    {contactsData.filter(c => c.tags.includes('cliente')).length}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">VIPs</p>
                  <p className="text-2xl font-bold">
                    {contactsData.filter(c => c.tags.includes('vip')).length}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold">{contactsData.length}</p>
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
              placeholder="Buscar contatos..."
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
              Filtros
            </Button>
          </div>
        </motion.div>

        {/* Contacts List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Lista de Contatos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredContacts.map((contact, index) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback>
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {contact.name}
                          </h3>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{contact.phone}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-2 flex-wrap gap-1">
                          {contact.tags.map((tag) => (
                            <Badge key={tag} className={`text-xs ${getTagColor(tag)}`}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium">{contact.score}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          R$ {contact.value.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {contact.source}
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Tag className="w-4 h-4 mr-2" />
                          Gerenciar Tags
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contatar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};
