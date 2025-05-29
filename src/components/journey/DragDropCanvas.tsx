
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Copy, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Step {
  id: string;
  type: string;
  title: string;
  content?: string;
  delay: number;
  position: { x: number; y: number };
}

interface DragDropCanvasProps {
  steps: Step[];
  selectedStep: string | null;
  onSelectStep: (stepId: string | null) => void;
  onUpdateStep: (stepId: string, updates: any) => void;
  onDeleteStep: (stepId: string) => void;
  onAddStep: (type: string) => void;
  getStepIcon: (type: string) => any;
  getStepColor: (type: string) => string;
  stepTypes: any[];
}

export const DragDropCanvas = ({
  steps,
  selectedStep,
  onSelectStep,
  onUpdateStep,
  onDeleteStep,
  onAddStep,
  getStepIcon,
  getStepColor,
  stepTypes,
}: DragDropCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const stepType = e.dataTransfer.getData('stepType');
    
    if (stepType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newStep = {
        id: Date.now().toString(),
        type: stepType,
        title: `Novo ${stepTypes.find(t => t.id === stepType)?.name}`,
        content: '',
        delay: 0,
        position: { x: Math.max(0, x - 100), y: Math.max(0, y - 50) },
      };
      
      onAddStep(stepType);
      // Update the position of the newly created step
      setTimeout(() => {
        onUpdateStep(newStep.id, { position: { x: Math.max(0, x - 100), y: Math.max(0, y - 50) } });
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleStepMouseDown = (e: React.MouseEvent, stepId: string) => {
    if (e.button !== 0) return; // Only left click
    
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setDraggedStep(stepId);
    setDragOffset(offset);

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - offset.x;
      const newY = e.clientY - canvasRect.top - offset.y;

      onUpdateStep(stepId, {
        position: {
          x: Math.max(0, Math.min(newX, canvasRect.width - 250)),
          y: Math.max(0, Math.min(newY, canvasRect.height - 150)),
        },
      });
    };

    const handleMouseUp = () => {
      setDraggedStep(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const duplicateStep = (step: Step) => {
    const newStep = {
      ...step,
      id: Date.now().toString(),
      title: `${step.title} (Cópia)`,
      position: {
        x: step.position.x + 20,
        y: step.position.y + 20,
      },
    };
    
    onAddStep(step.type);
    setTimeout(() => {
      onUpdateStep(newStep.id, newStep);
    }, 0);
  };

  return (
    <div 
      ref={canvasRef}
      className="flex-1 relative overflow-auto bg-gray-100 dark:bg-gray-950"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />
      
      {/* Steps */}
      {steps.map((step, index) => {
        const IconComponent = getStepIcon(step.type);
        const isSelected = selectedStep === step.id;
        const isDragging = draggedStep === step.id;
        
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: isDragging ? 1.05 : 1,
              zIndex: isDragging ? 50 : 1,
            }}
            style={{
              position: 'absolute',
              left: step.position.x,
              top: step.position.y,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            className={`w-64 select-none ${
              isSelected ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => onSelectStep(step.id)}
            onMouseDown={(e) => handleStepMouseDown(e, step.id)}
          >
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
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
                        duplicateStep(step);
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
                        onDeleteStep(step.id);
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
            
            {/* Connection Arrow */}
            {index < steps.length - 1 && (
              <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 pointer-events-none">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Drop Zone Indicator */}
      <div className="absolute inset-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg pointer-events-none opacity-0 transition-opacity hover:opacity-100">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Arraste etapas aqui para criar sua jornada
          </p>
        </div>
      </div>
    </div>
  );
};
