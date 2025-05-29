
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Play,
  Pause,
  Save,
  ArrowRight,
  Clock,
  MessageSquare,
  Mail,
  Zap,
  Settings,
  Trash2,
  Copy,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

const stepTypes = [
  {
    id: 'wait',
    name: 'Aguardar',
    icon: Clock,
    color: 'bg-blue-500',
    description: 'Adicionar um delay na jornada',
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    color: 'bg-green-500',
    description: 'Enviar um email',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageSquare,
    color: 'bg-emerald-500',
    description: 'Enviar mensagem no WhatsApp',
  },
  {
    id: 'action',
    name: 'Ação',
    icon: Zap,
    color: 'bg-purple-500',
    description: 'Executar uma ação personalizada',
  },
];

const initialSteps = [
  {
    id: '1',
    type: 'email',
    title: 'Email de Boas-vindas',
    content: 'Olá {nome}, bem-vindo ao nosso sistema!',
    delay: 0,
    position: { x: 100, y: 100 },
  },
  {
    id: '2',
    type: 'wait',
    title: 'Aguardar 2 dias',
    delay: 2,
    position: { x: 300, y: 100 },
  },
  {
    id: '3',
    type: 'whatsapp',
    title: 'Follow-up WhatsApp',
    content: 'Como está sua experiência com nosso produto?',
    delay: 0,
    position: { x: 500, y: 100 },
  },
];

export const JourneyEditor = () => {
  const [journeyName, setJourneyName] = useState('Nova Jornada de Onboarding');
  const [journeyDescription, setJourneyDescription] = useState('Jornada para novos usuários');
  const [steps, setSteps] = useState(initialSteps);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getStepIcon = (type: string) => {
    const stepType = stepTypes.find(t => t.id === type);
    return stepType?.icon || MessageSquare;
  };

  const getStepColor = (type: string) => {
    const stepType = stepTypes.find(t => t.id === type);
    return stepType?.color || 'bg-gray-500';
  };

  const addStep = (type: string) => {
    const newStep = {
      id: Date.now().toString(),
      type,
      title: `Novo ${stepTypes.find(t => t.id === type)?.name}`,
      content: '',
      delay: 0,
      position: { x: 200, y: 200 },
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (stepId: string, updates: any) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const deleteStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
    if (selectedStep === stepId) {
      setSelectedStep(null);
    }
  };

  const selectedStepData = steps.find(step => step.id === selectedStep);

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-4">
            <div>
              <Input
                value={journeyName}
                onChange={(e) => setJourneyName(e.target.value)}
                className="text-2xl font-bold bg-transparent border-none p-0 focus:ring-0"
              />
              <Input
                value={journeyDescription}
                onChange={(e) => setJourneyDescription(e.target.value)}
                className="text-gray-600 dark:text-gray-400 bg-transparent border-none p-0 focus:ring-0"
              />
            </div>
            <Badge variant="outline">Rascunho</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Play className="w-4 h-4 mr-2" />
              Testar
            </Button>
            <Button variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          </div>
        </motion.div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar com tipos de step */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4"
          >
            <h3 className="font-medium mb-4">Adicionar Etapa</h3>
            <div className="space-y-2">
              {stepTypes.map((stepType) => {
                const IconComponent = stepType.icon;
                return (
                  <motion.button
                    key={stepType.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addStep(stepType.id)}
                    className="w-full flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className={`w-8 h-8 ${stepType.color} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{stepType.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {stepType.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Canvas principal */}
          <div className="flex-1 relative overflow-auto bg-gray-100 dark:bg-gray-950">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            
            {/* Steps */}
            {steps.map((step, index) => {
              const IconComponent = getStepIcon(step.type);
              const isSelected = selectedStep === step.id;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    position: 'absolute',
                    left: step.position.x,
                    top: step.position.y,
                  }}
                  className={`w-64 cursor-pointer ${
                    isSelected ? 'ring-2 ring-primary-500' : ''
                  }`}
                  onClick={() => setSelectedStep(step.id)}
                >
                  <Card className="shadow-lg">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 ${getStepColor(step.type)} rounded flex items-center justify-center`}>
                            <IconComponent className="w-3 h-3 text-white" />
                          </div>
                          <span className="font-medium text-sm">{step.title}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-6 h-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Duplicar step
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-6 h-6 p-0 text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteStep(step.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {step.content && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {step.content.slice(0, 50)}...
                        </p>
                      )}
                      {step.delay > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {step.delay} dias
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Seta para próximo step */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-1/2 -right-8 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Painel de propriedades */}
          {selectedStepData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Propriedades</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStep(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stepTitle">Título</Label>
                  <Input
                    id="stepTitle"
                    value={selectedStepData.title}
                    onChange={(e) => updateStep(selectedStepData.id, { title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                {selectedStepData.type !== 'wait' && (
                  <div>
                    <Label htmlFor="stepContent">Conteúdo</Label>
                    <Textarea
                      id="stepContent"
                      value={selectedStepData.content || ''}
                      onChange={(e) => updateStep(selectedStepData.id, { content: e.target.value })}
                      className="mt-1"
                      rows={4}
                      placeholder="Digite o conteúdo da mensagem..."
                    />
                  </div>
                )}
                
                {selectedStepData.type === 'wait' && (
                  <div>
                    <Label htmlFor="stepDelay">Delay (dias)</Label>
                    <Input
                      id="stepDelay"
                      type="number"
                      value={selectedStepData.delay}
                      onChange={(e) => updateStep(selectedStepData.id, { delay: parseInt(e.target.value) })}
                      className="mt-1"
                      min="0"
                    />
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações Avançadas
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};
