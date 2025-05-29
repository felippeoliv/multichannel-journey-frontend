
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface GenerateJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}

const examplePrompts = [
  "Criar uma jornada de onboarding para novos usuários com boas-vindas, tutorial e follow-up",
  "Jornada de recuperação de carrinho abandonado com 3 lembretes espaçados",
  "Sequência de nutrição para leads interessados em produtos premium",
  "Jornada de reativação para usuários inativos há mais de 30 dias"
];

export const GenerateJourneyModal = ({ isOpen, onClose, onGenerate }: GenerateJourneyModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onGenerate(prompt);
    setIsGenerating(false);
    setPrompt('');
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span>Gerar Jornada Inteligente</span>
          </DialogTitle>
          <DialogDescription>
            Descreva a jornada que você quer criar e nossa IA irá gerar automaticamente os passos para você.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="prompt">Descreva sua jornada</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Criar uma jornada de boas-vindas para novos clientes com email de boas-vindas, aguardar 2 dias, enviar tutorial por WhatsApp e fazer follow-up..."
              className="min-h-[120px] mt-2"
            />
          </div>

          <div>
            <Label className="text-sm text-gray-600 dark:text-gray-400">
              Exemplos de prompts:
            </Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {examplePrompts.map((example, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleExampleClick(example)}
                  className="text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{example}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600"
            >
              {isGenerating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 mr-2"
                >
                  <Wand2 className="w-4 h-4" />
                </motion.div>
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? 'Gerando...' : 'Gerar Jornada'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
