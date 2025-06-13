# Planejamento Detalhado do Frontend

## Visão Geral da Arquitetura Frontend

O frontend será uma aplicação web moderna construída em React com TypeScript, projetada para se integrar perfeitamente com o backend Node.js que planejamos. A aplicação oferecerá uma experiência de usuário rica e responsiva, com funcionalidades avançadas de automação de marketing, gestão de agentes IA e analytics em tempo real.

### Stack Tecnológica Consolidada

**Framework e Linguagem:**
- React 18+ com TypeScript para type safety e produtividade
- Next.js 14+ (App Router) para SSR, SSG e otimizações automáticas
- Tailwind CSS para estilização utilitária e consistente
- Shadcn/UI como biblioteca de componentes base

**Gerenciamento de Estado:**
- Zustand para estado global leve e performático
- TanStack Query (React Query) para cache e sincronização de dados da API
- React Hook Form para formulários complexos com validação

**Comunicação e Realtime:**
- Axios para requisições HTTP com interceptors
- Socket.io client para notificações em tempo real
- Supabase client apenas para funcionalidades específicas de realtime (dashboards)

**Visualização e Interface:**
- Recharts para gráficos e visualizações de dados
- React Table para tabelas complexas com filtros e paginação
- Lucide React para ícones consistentes
- Framer Motion para animações e transições

**Desenvolvimento e Qualidade:**
- Vite para build rápido e hot reload
- ESLint + Prettier para qualidade de código
- Jest + Testing Library para testes
- Storybook para desenvolvimento de componentes isolados

### Arquitetura de Comunicação com Backend

O frontend seguirá o padrão de comunicação exclusiva com o backend, nunca acessando diretamente o Supabase para operações de dados. Esta abordagem garante segurança, consistência e permite implementação de lógica de negócio complexa.

**Fluxo de Comunicação:**
```
Frontend (React) → Backend API (Node.js) → Supabase/Serviços Externos
```

**Configuração do Cliente HTTP:**
```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

class ApiClient {
  private static instance: ApiClient;
  private client: AxiosInstance;
  private authToken: string | null = null;
  private businessId: string | null = null;

  private constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor para adicionar auth token e business ID
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        if (this.businessId) {
          config.headers['X-Business-ID'] = this.businessId;
        }

        // Adiciona correlation ID para tracking
        config.headers['X-Correlation-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor para tratamento de erros
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { response } = error;

        if (response?.status === 401) {
          // Token expirado, tenta refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry da requisição original
            return this.client.request(error.config);
          } else {
            // Redirect para login
            this.handleAuthError();
          }
        }

        if (response?.status === 403) {
          toast.error('Você não tem permissão para realizar esta ação');
        }

        if (response?.status >= 500) {
          toast.error('Erro interno do servidor. Tente novamente em alguns instantes.');
        }

        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  setBusinessId(businessId: string): void {
    this.businessId = businessId;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await axios.post(`${this.client.defaults.baseURL}/auth/refresh`, {
        refresh_token: refreshToken
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', newRefreshToken);
      
      this.setAuthToken(access_token);
      
      return true;
    } catch {
      return false;
    }
  }

  private handleAuthError(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/auth/login';
  }

  // Métodos HTTP genéricos
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

export const apiClient = ApiClient.getInstance();
```

### Estrutura de Rotas e Navegação

A aplicação seguirá uma estrutura hierárquica baseada em roles e funcionalidades, com proteção de rotas e navegação contextual.

**Estrutura de Rotas:**
```
/
├── auth/
│   ├── login
│   ├── register
│   ├── forgot-password
│   └── invite/[token]
├── dashboard/
│   ├── overview (dashboard principal)
│   ├── contacts/
│   │   ├── list
│   │   ├── [id]
│   │   └── import
│   ├── journeys/
│   │   ├── list
│   │   ├── create
│   │   ├── [id]/
│   │   │   ├── edit
│   │   │   ├── analytics
│   │   │   └── test
│   ├── agents/
│   │   ├── list
│   │   ├── create
│   │   ├── [id]/
│   │   │   ├── configure
│   │   │   ├── conversations
│   │   │   ├── performance
│   │   │   └── training
│   ├── tools/
│   │   ├── marketplace
│   │   ├── custom
│   │   └── [id]/configure
│   ├── messages/
│   │   ├── inbox
│   │   ├── sent
│   │   ├── templates
│   │   └── scheduled
│   ├── analytics/
│   │   ├── overview
│   │   ├── performance
│   │   ├── insights
│   │   └── reports
│   └── settings/
│       ├── business
│       ├── team
│       ├── integrations
│       ├── billing
│       └── security
└── admin/
    ├── system
    ├── monitoring
    └── logs
```

**Sistema de Proteção de Rotas:**
```typescript
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'agent';
  requiredPermissions?: string[];
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermissions 
}: ProtectedRouteProps) {
  const { user, isLoading, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && requiredRole && !user.businesses.some(b => b.role === requiredRole)) {
      router.push('/dashboard/overview');
      return;
    }

    if (user && requiredPermissions) {
      const hasAllPermissions = requiredPermissions.every(permission => 
        hasPermission(permission)
      );
      
      if (!hasAllPermissions) {
        router.push('/dashboard/overview');
        return;
      }
    }
  }, [user, isLoading, requiredRole, requiredPermissions, router, hasPermission]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

### Layout e Navegação Principal

**Layout Principal:**
```typescript
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter />
    </div>
  );
}
```

**Sidebar Dinâmica:**
```typescript
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Route, 
  Bot, 
  Wrench, 
  MessageSquare, 
  BarChart3, 
  Settings 
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard/overview',
    icon: LayoutDashboard,
    permissions: []
  },
  {
    name: 'Contatos',
    href: '/dashboard/contacts',
    icon: Users,
    permissions: ['contacts:read']
  },
  {
    name: 'Jornadas',
    href: '/dashboard/journeys',
    icon: Route,
    permissions: ['journeys:read']
  },
  {
    name: 'Agentes IA',
    href: '/dashboard/agents',
    icon: Bot,
    permissions: ['agents:read']
  },
  {
    name: 'Tools',
    href: '/dashboard/tools',
    icon: Wrench,
    permissions: ['tools:read']
  },
  {
    name: 'Mensagens',
    href: '/dashboard/messages',
    icon: MessageSquare,
    permissions: ['messages:read']
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    permissions: ['analytics:read']
  },
  {
    name: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
    permissions: ['settings:read']
  }
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { hasPermission } = useAuth();
  const pathname = usePathname();

  const visibleItems = navigationItems.filter(item => 
    item.permissions.length === 0 || 
    item.permissions.some(permission => hasPermission(permission))
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">AutoMarketing</h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {visibleItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
```


## Integração com a API do Backend e Autenticação

A integração com o backend será implementada através de uma camada de serviços que abstrai as chamadas da API, oferecendo type safety, cache inteligente e tratamento de erros robusto. O sistema de autenticação será totalmente integrado com o Supabase Auth, mas gerenciado através do backend para garantir segurança e controle.

### Camada de Serviços da API

**Serviços Especializados por Domínio:**

```typescript
// services/auth.service.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  businessName?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  businesses: Array<{
    id: string;
    name: string;
    role: 'admin' | 'manager' | 'agent';
  }>;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<{
    user: AuthUser;
    access_token: string;
    refresh_token: string;
  }> {
    const response = await apiClient.post('/auth/login', credentials);
    
    // Armazena tokens
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    
    // Configura cliente API
    apiClient.setAuthToken(response.access_token);
    
    return response;
  }

  async register(data: RegisterData): Promise<{
    user: AuthUser;
    access_token: string;
    refresh_token: string;
  }> {
    return await apiClient.post('/auth/register', data);
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      apiClient.setAuthToken('');
      window.location.href = '/auth/login';
    }
  }

  async getCurrentUser(): Promise<AuthUser> {
    return await apiClient.get('/auth/me');
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, password });
  }

  async acceptInvite(token: string, userData: {
    name: string;
    password: string;
  }): Promise<AuthUser> {
    return await apiClient.post(`/auth/invite/${token}/accept`, userData);
  }
}

export const authService = new AuthService();
```

```typescript
// services/contact.service.ts
export interface Contact {
  id: string;
  full_name: string;
  nickname?: string;
  phone: string;
  email?: string;
  created_at: string;
  metadata?: Record<string, any>;
  tags: string[];
  engagement_score: number;
  last_interaction?: string;
}

export interface ContactFilters {
  search?: string;
  tags?: string[];
  journey_status?: 'active' | 'completed' | 'exited';
  created_after?: string;
  last_interaction_before?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ContactService {
  async getContacts(
    filters: ContactFilters = {},
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Contact>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      )
    });

    return await apiClient.get(`/contacts?${params}`);
  }

  async getContact(id: string): Promise<Contact & {
    journeys: Array<{
      id: string;
      name: string;
      status: string;
      current_step: number;
      started_at: string;
    }>;
    messages: Array<{
      id: string;
      channel: string;
      direction: 'inbound' | 'outbound';
      message_body: string;
      sent_at: string;
      status: string;
    }>;
  }> {
    return await apiClient.get(`/contacts/${id}`);
  }

  async createContact(data: Omit<Contact, 'id' | 'created_at' | 'engagement_score'>): Promise<Contact> {
    return await apiClient.post('/contacts', data);
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    return await apiClient.put(`/contacts/${id}`, data);
  }

  async deleteContact(id: string): Promise<void> {
    await apiClient.delete(`/contacts/${id}`);
  }

  async addTags(id: string, tags: string[]): Promise<void> {
    await apiClient.post(`/contacts/${id}/tags`, { tags });
  }

  async removeTag(id: string, tag: string): Promise<void> {
    await apiClient.delete(`/contacts/${id}/tags/${tag}`);
  }

  async importContacts(
    file: File,
    mapping: Record<string, string>,
    tags: string[] = []
  ): Promise<{ jobId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    formData.append('tags', JSON.stringify(tags));

    return await apiClient.post('/contacts/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async getImportStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    total: number;
    processed: number;
    errors: string[];
  }> {
    return await apiClient.get(`/contacts/import/${jobId}/status`);
  }

  async sendMessage(
    contactId: string,
    message: {
      channel: 'whatsapp' | 'email' | 'sms';
      message_body: string;
      template_id?: string;
      variables?: Record<string, any>;
    }
  ): Promise<{ messageId: string }> {
    return await apiClient.post(`/contacts/${contactId}/messages`, message);
  }
}

export const contactService = new ContactService();
```

```typescript
// services/journey.service.ts
export interface Journey {
  id: string;
  name: string;
  description?: string;
  type: 'onboarding' | 'engagement' | 'renewal' | 'offer';
  created_at: string;
  steps: JourneyStep[];
}

export interface JourneyStep {
  id: string;
  step_order: number;
  delay_days: number;
  send_time: string;
  step_type: 'whatsapp' | 'email';
  title: string;
  body: string;
}

export interface JourneyAnalytics {
  total_enrolled: number;
  active_contacts: number;
  completed: number;
  conversion_rate: number;
  steps_performance: Array<{
    step_order: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }>;
  abandonment_points: Array<{
    step_order: number;
    abandonment_rate: number;
  }>;
}

class JourneyService {
  async getJourneys(): Promise<Journey[]> {
    return await apiClient.get('/journeys');
  }

  async getJourney(id: string): Promise<Journey> {
    return await apiClient.get(`/journeys/${id}`);
  }

  async createJourney(data: Omit<Journey, 'id' | 'created_at'>): Promise<Journey> {
    return await apiClient.post('/journeys', data);
  }

  async updateJourney(id: string, data: Partial<Journey>): Promise<Journey> {
    return await apiClient.put(`/journeys/${id}`, data);
  }

  async deleteJourney(id: string): Promise<void> {
    await apiClient.delete(`/journeys/${id}`);
  }

  async activateJourney(id: string): Promise<void> {
    await apiClient.post(`/journeys/${id}/activate`);
  }

  async deactivateJourney(id: string): Promise<void> {
    await apiClient.post(`/journeys/${id}/deactivate`);
  }

  async getJourneyAnalytics(id: string): Promise<JourneyAnalytics> {
    return await apiClient.get(`/journeys/${id}/analytics`);
  }

  async enrollContacts(
    id: string,
    enrollment: {
      contact_ids?: string[];
      filters?: {
        tags?: string[];
        created_after?: string;
      };
    }
  ): Promise<{ enrolled_count: number }> {
    return await apiClient.post(`/journeys/${id}/enroll`, enrollment);
  }

  async getEnrollments(id: string): Promise<Array<{
    id: string;
    contact: Contact;
    status: 'active' | 'completed' | 'exited';
    current_step: number;
    started_at: string;
    last_step_at?: string;
  }>> {
    return await apiClient.get(`/journeys/${id}/enrollments`);
  }

  async testJourney(id: string, contactId: string): Promise<{
    simulation_id: string;
    steps: Array<{
      step_order: number;
      scheduled_for: string;
      message_preview: string;
    }>;
  }> {
    return await apiClient.post(`/journeys/${id}/test`, { contact_id: contactId });
  }
}

export const journeyService = new JourneyService();
```

```typescript
// services/agent.service.ts
export interface AIAgent {
  id: string;
  name: string;
  description?: string;
  agent_type: 'success' | 'support' | 'sales' | 'custom';
  llm_provider: 'openai' | 'anthropic' | 'llama2' | 'custom';
  config: {
    model: string;
    temperature: number;
    max_tokens: number;
    system_prompt: string;
    [key: string]: any;
  };
  active: boolean;
  created_at: string;
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  tool_type: string;
  parameters: Record<string, any>;
  enabled: boolean;
}

export interface Conversation {
  id: string;
  contact: Contact;
  status: 'active' | 'completed' | 'escalated';
  started_at: string;
  ended_at?: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

class AgentService {
  async getAgents(): Promise<AIAgent[]> {
    return await apiClient.get('/agents');
  }

  async getAgent(id: string): Promise<AIAgent> {
    return await apiClient.get(`/agents/${id}`);
  }

  async createAgent(data: Omit<AIAgent, 'id' | 'created_at'>): Promise<AIAgent> {
    return await apiClient.post('/agents', data);
  }

  async updateAgent(id: string, data: Partial<AIAgent>): Promise<AIAgent> {
    return await apiClient.put(`/agents/${id}`, data);
  }

  async activateAgent(id: string): Promise<void> {
    await apiClient.post(`/agents/${id}/activate`);
  }

  async deactivateAgent(id: string): Promise<void> {
    await apiClient.post(`/agents/${id}/deactivate`);
  }

  async getAgentTools(id: string): Promise<AgentTool[]> {
    return await apiClient.get(`/agents/${id}/tools`);
  }

  async addToolToAgent(
    agentId: string,
    toolData: {
      ai_tool_id: string;
      enabled: boolean;
      config?: Record<string, any>;
    }
  ): Promise<void> {
    await apiClient.post(`/agents/${agentId}/tools`, toolData);
  }

  async getConversations(agentId: string): Promise<Conversation[]> {
    return await apiClient.get(`/agents/${agentId}/conversations`);
  }

  async getConversation(agentId: string, conversationId: string): Promise<Conversation> {
    return await apiClient.get(`/agents/${agentId}/conversations/${conversationId}`);
  }

  async takeoverConversation(agentId: string, conversationId: string): Promise<void> {
    await apiClient.post(`/agents/${agentId}/conversations/${conversationId}/takeover`);
  }

  async getPerformance(agentId: string): Promise<{
    total_conversations: number;
    avg_response_time: number;
    satisfaction_score: number;
    resolution_rate: number;
    escalation_rate: number;
    daily_stats: Array<{
      date: string;
      conversations: number;
      avg_response_time: number;
    }>;
  }> {
    return await apiClient.get(`/agents/${agentId}/performance`);
  }

  async trainAgent(
    agentId: string,
    trainingData: {
      conversations?: Array<{
        messages: Array<{ role: string; content: string }>;
        rating?: number;
        feedback?: string;
      }>;
      documents?: File[];
    }
  ): Promise<{ training_job_id: string }> {
    const formData = new FormData();
    
    if (trainingData.conversations) {
      formData.append('conversations', JSON.stringify(trainingData.conversations));
    }
    
    if (trainingData.documents) {
      trainingData.documents.forEach((doc, index) => {
        formData.append(`document_${index}`, doc);
      });
    }

    return await apiClient.post(`/agents/${agentId}/train`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
}

export const agentService = new AgentService();
```

### Sistema de Autenticação Integrado

**Hook de Autenticação:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  currentBusiness: string | null;
  permissions: string[];
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  setCurrentBusiness: (businessId: string) => void;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      currentBusiness: null,
      permissions: [],

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(credentials);
          
          set({
            user: response.user,
            currentBusiness: response.user.businesses[0]?.id || null,
            isLoading: false
          });

          // Configura business ID no cliente API
          if (response.user.businesses[0]?.id) {
            apiClient.setBusinessId(response.user.businesses[0].id);
          }

          // Carrega permissões
          await get().refreshPermissions();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          currentBusiness: null,
          permissions: []
        });
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(data);
          set({
            user: response.user,
            currentBusiness: response.user.businesses[0]?.id || null,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setCurrentBusiness: (businessId) => {
        set({ currentBusiness: businessId });
        apiClient.setBusinessId(businessId);
      },

      hasPermission: (permission) => {
        const { permissions } = get();
        return permissions.includes(permission) || permissions.includes('*');
      },

      refreshUser: async () => {
        try {
          const user = await authService.getCurrentUser();
          set({ user });
        } catch (error) {
          console.error('Failed to refresh user:', error);
        }
      },

      refreshPermissions: async () => {
        const { user, currentBusiness } = get();
        if (!user || !currentBusiness) return;

        const business = user.businesses.find(b => b.id === currentBusiness);
        if (!business) return;

        // Mapeia roles para permissões
        const rolePermissions = {
          admin: ['*'],
          manager: [
            'contacts:*', 'journeys:*', 'agents:*', 'messages:*', 
            'analytics:read', 'tools:read', 'settings:read'
          ],
          agent: [
            'contacts:read', 'contacts:update', 'messages:create',
            'conversations:takeover', 'analytics:read'
          ]
        };

        set({ permissions: rolePermissions[business.role] || [] });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        currentBusiness: state.currentBusiness
      })
    }
  )
);

// Hook para uso em componentes
export function useAuth() {
  const store = useAuthStore();
  
  useEffect(() => {
    // Inicializa autenticação na primeira carga
    const token = localStorage.getItem('access_token');
    if (token && !store.user) {
      apiClient.setAuthToken(token);
      store.refreshUser();
    }
  }, []);

  return store;
}
```

**Componente de Login:**
```typescript
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function LoginForm() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(credentials);
      toast.success('Login realizado com sucesso!');
      router.push('/dashboard/overview');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Entrar na Plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                required
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center space-y-2">
              <Link 
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Esqueceu sua senha?
              </Link>
              
              <div className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link 
                  href="/auth/register"
                  className="text-blue-600 hover:underline"
                >
                  Cadastre-se
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Middleware de Autenticação para Next.js

**middleware.ts:**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];
const authRoutes = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  // Permite acesso a rotas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // Se já está autenticado e tenta acessar auth, redireciona para dashboard
    if (token && authRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard/overview', request.url));
    }
    return NextResponse.next();
  }

  // Verifica autenticação para rotas protegidas
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

Esta integração garante comunicação segura e eficiente com o backend, mantendo o frontend como uma camada de apresentação que consome dados através de APIs bem definidas, sem exposição de lógica de negócio ou credenciais sensíveis.


## Gestão de Estado, Dados e Realtime

A gestão de estado será implementada através de uma combinação estratégica de Zustand para estado global, TanStack Query para cache de dados da API e Socket.io para comunicação em tempo real. Esta arquitetura garante performance, sincronização eficiente e experiência de usuário fluida.

### Arquitetura de Estado Global com Zustand

**Store Principal da Aplicação:**
```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  
  // Business Context
  currentBusiness: string | null;
  businesses: Business[];
  
  // Real-time Data
  onlineUsers: string[];
  activeConversations: string[];
  systemStatus: 'online' | 'offline' | 'maintenance';
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  setCurrentBusiness: (businessId: string) => void;
  updateOnlineUsers: (users: string[]) => void;
  updateSystemStatus: (status: 'online' | 'offline' | 'maintenance') => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        sidebarOpen: false,
        theme: 'light',
        notifications: [],
        currentBusiness: null,
        businesses: [],
        onlineUsers: [],
        activeConversations: [],
        systemStatus: 'online',

        // Actions
        setSidebarOpen: (open) => set((state) => {
          state.sidebarOpen = open;
        }),

        setTheme: (theme) => set((state) => {
          state.theme = theme;
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }),

        addNotification: (notification) => set((state) => {
          state.notifications.unshift({
            ...notification,
            id: notification.id || `notif_${Date.now()}`,
            timestamp: notification.timestamp || new Date().toISOString()
          });
          
          // Limita a 50 notificações
          if (state.notifications.length > 50) {
            state.notifications = state.notifications.slice(0, 50);
          }
        }),

        removeNotification: (id) => set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        }),

        setCurrentBusiness: (businessId) => set((state) => {
          state.currentBusiness = businessId;
          // Atualiza cliente API
          apiClient.setBusinessId(businessId);
        }),

        updateOnlineUsers: (users) => set((state) => {
          state.onlineUsers = users;
        }),

        updateSystemStatus: (status) => set((state) => {
          state.systemStatus = status;
        })
      })),
      {
        name: 'app-storage',
        partialize: (state) => ({
          theme: state.theme,
          currentBusiness: state.currentBusiness,
          sidebarOpen: state.sidebarOpen
        })
      }
    ),
    { name: 'app-store' }
  )
);
```

**Store Específico para Dashboards:**
```typescript
interface DashboardState {
  // Métricas principais
  metrics: {
    contacts: {
      total: number;
      new_this_month: number;
      growth_rate: number;
    };
    messages: {
      sent_today: number;
      delivered_rate: number;
      response_rate: number;
    };
    journeys: {
      active: number;
      total_enrolled: number;
      avg_conversion: number;
    };
    agents: {
      active_conversations: number;
      avg_response_time: number;
      satisfaction_score: number;
    };
  } | null;
  
  // Dados para gráficos
  engagementData: Array<{
    date: string;
    messages_sent: number;
    messages_received: number;
    engagement_rate: number;
  }>;
  
  // Atividades recentes
  recentActivities: Activity[];
  
  // Estado de carregamento
  isLoadingMetrics: boolean;
  isLoadingActivities: boolean;
  lastUpdated: string | null;
  
  // Actions
  setMetrics: (metrics: DashboardState['metrics']) => void;
  setEngagementData: (data: DashboardState['engagementData']) => void;
  addActivity: (activity: Activity) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  refreshDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    immer((set, get) => ({
      metrics: null,
      engagementData: [],
      recentActivities: [],
      isLoadingMetrics: false,
      isLoadingActivities: false,
      lastUpdated: null,

      setMetrics: (metrics) => set((state) => {
        state.metrics = metrics;
        state.lastUpdated = new Date().toISOString();
      }),

      setEngagementData: (data) => set((state) => {
        state.engagementData = data;
      }),

      addActivity: (activity) => set((state) => {
        state.recentActivities.unshift(activity);
        // Mantém apenas as 20 atividades mais recentes
        if (state.recentActivities.length > 20) {
          state.recentActivities = state.recentActivities.slice(0, 20);
        }
      }),

      setLoadingState: (key, loading) => set((state) => {
        (state as any)[key] = loading;
      }),

      refreshDashboard: async () => {
        const { setLoadingState, setMetrics, setEngagementData } = get();
        
        try {
          setLoadingState('isLoadingMetrics', true);
          
          const [metrics, engagement] = await Promise.all([
            analyticsService.getDashboardMetrics(),
            analyticsService.getEngagementData()
          ]);
          
          setMetrics(metrics);
          setEngagementData(engagement);
        } catch (error) {
          console.error('Failed to refresh dashboard:', error);
        } finally {
          setLoadingState('isLoadingMetrics', false);
        }
      }
    })),
    { name: 'dashboard-store' }
  )
);
```

### Cache e Sincronização com TanStack Query

**Configuração do Query Client:**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: (failureCount, error: any) => {
        // Não retry em erros de autenticação
        if (error?.response?.status === 401) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 1,
      onError: (error: any) => {
        // Log global de erros de mutação
        console.error('Mutation error:', error);
        
        if (error?.response?.status >= 500) {
          toast.error('Erro interno do servidor. Tente novamente.');
        }
      }
    }
  }
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

**Hooks Customizados para Queries:**
```typescript
// hooks/useContacts.ts
export function useContacts(
  filters: ContactFilters = {},
  page = 1,
  limit = 20
) {
  return useQuery({
    queryKey: ['contacts', filters, page, limit],
    queryFn: () => contactService.getContacts(filters, page, limit),
    keepPreviousData: true, // Para paginação suave
    staleTime: 2 * 60 * 1000 // 2 minutos para dados de contatos
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => contactService.getContact(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000 // 1 minuto para dados específicos
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: contactService.createContact,
    onSuccess: (newContact) => {
      // Invalida lista de contatos
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      
      // Adiciona o novo contato ao cache
      queryClient.setQueryData(['contact', newContact.id], newContact);
      
      toast.success('Contato criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar contato');
    }
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contact> }) =>
      contactService.updateContact(id, data),
    onSuccess: (updatedContact, { id }) => {
      // Atualiza cache específico do contato
      queryClient.setQueryData(['contact', id], updatedContact);
      
      // Atualiza listas que podem conter este contato
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      
      toast.success('Contato atualizado com sucesso!');
    }
  });
}

export function useImportContacts() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, mapping, tags }: {
      file: File;
      mapping: Record<string, string>;
      tags: string[];
    }) => contactService.importContacts(file, mapping, tags),
    onSuccess: () => {
      // Invalida lista de contatos após importação
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Importação iniciada com sucesso!');
    }
  });
}
```

```typescript
// hooks/useJourneys.ts
export function useJourneys() {
  return useQuery({
    queryKey: ['journeys'],
    queryFn: journeyService.getJourneys,
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
}

export function useJourney(id: string) {
  return useQuery({
    queryKey: ['journey', id],
    queryFn: () => journeyService.getJourney(id),
    enabled: !!id
  });
}

export function useJourneyAnalytics(id: string) {
  return useQuery({
    queryKey: ['journey-analytics', id],
    queryFn: () => journeyService.getJourneyAnalytics(id),
    enabled: !!id,
    refetchInterval: 30 * 1000, // Atualiza a cada 30 segundos
    staleTime: 15 * 1000 // Considera stale após 15 segundos
  });
}

export function useCreateJourney() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: journeyService.createJourney,
    onSuccess: (newJourney) => {
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      queryClient.setQueryData(['journey', newJourney.id], newJourney);
      toast.success('Jornada criada com sucesso!');
    }
  });
}

export function useActivateJourney() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: journeyService.activateJourney,
    onSuccess: (_, journeyId) => {
      queryClient.invalidateQueries({ queryKey: ['journey', journeyId] });
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      toast.success('Jornada ativada com sucesso!');
    }
  });
}
```

### Sistema de Comunicação Realtime

**Configuração do Socket.io Client:**
```typescript
import { io, Socket } from 'socket.io-client';

class RealtimeService {
  private static instance: RealtimeService;
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private businessId: string | null = null;

  private constructor() {}

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  connect(businessId: string, authToken: string): void {
    if (this.socket?.connected && this.businessId === businessId) {
      return; // Já conectado ao business correto
    }

    this.disconnect(); // Desconecta conexão anterior se existir
    this.businessId = businessId;

    this.socket = io(process.env.NEXT_PUBLIC_REALTIME_URL || 'ws://localhost:3000', {
      auth: {
        token: authToken,
        businessId: businessId
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventHandlers();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.businessId = null;
    this.reconnectAttempts = 0;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Realtime connected');
      this.reconnectAttempts = 0;
      
      // Atualiza status no store
      useAppStore.getState().updateSystemStatus('online');
      
      // Join business room
      this.socket?.emit('join_business', this.businessId);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Realtime disconnected:', reason);
      useAppStore.getState().updateSystemStatus('offline');
      
      if (reason === 'io server disconnect') {
        // Servidor desconectou, reconecta automaticamente
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Realtime connection error:', error);
      this.handleReconnect();
    });

    // Eventos de negócio
    this.socket.on('new_message', this.handleNewMessage.bind(this));
    this.socket.on('contact_updated', this.handleContactUpdated.bind(this));
    this.socket.on('journey_progress', this.handleJourneyProgress.bind(this));
    this.socket.on('agent_response', this.handleAgentResponse.bind(this));
    this.socket.on('system_notification', this.handleSystemNotification.bind(this));
    this.socket.on('user_activity', this.handleUserActivity.bind(this));
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      useAppStore.getState().updateSystemStatus('offline');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.socket?.connect();
    }, delay);
  }

  private handleNewMessage(data: {
    messageId: string;
    contactId: string;
    channel: string;
    direction: 'inbound' | 'outbound';
    content: string;
    timestamp: string;
  }): void {
    // Invalida queries relacionadas a mensagens
    queryClient.invalidateQueries({ queryKey: ['messages'] });
    queryClient.invalidateQueries({ queryKey: ['contact', data.contactId] });
    
    // Adiciona notificação se for mensagem recebida
    if (data.direction === 'inbound') {
      useAppStore.getState().addNotification({
        id: `msg_${data.messageId}`,
        type: 'info',
        title: 'Nova mensagem recebida',
        message: `Mensagem de contato via ${data.channel}`,
        timestamp: data.timestamp,
        actions: [
          {
            label: 'Ver conversa',
            action: () => window.location.href = `/dashboard/contacts/${data.contactId}`
          }
        ]
      });
    }
  }

  private handleContactUpdated(data: {
    contactId: string;
    changes: Partial<Contact>;
  }): void {
    // Atualiza cache do contato específico
    queryClient.setQueryData(['contact', data.contactId], (oldData: any) => {
      if (!oldData) return oldData;
      return { ...oldData, ...data.changes };
    });
    
    // Invalida lista de contatos
    queryClient.invalidateQueries({ queryKey: ['contacts'] });
  }

  private handleJourneyProgress(data: {
    journeyId: string;
    contactId: string;
    stepOrder: number;
    status: 'active' | 'completed' | 'failed';
  }): void {
    // Invalida analytics da jornada
    queryClient.invalidateQueries({ queryKey: ['journey-analytics', data.journeyId] });
    
    // Atualiza métricas do dashboard se necessário
    if (window.location.pathname === '/dashboard/overview') {
      useDashboardStore.getState().refreshDashboard();
    }
  }

  private handleAgentResponse(data: {
    agentId: string;
    conversationId: string;
    response: string;
    timestamp: string;
  }): void {
    // Invalida conversas do agente
    queryClient.invalidateQueries({ queryKey: ['agent-conversations', data.agentId] });
    queryClient.invalidateQueries({ queryKey: ['conversation', data.conversationId] });
    
    // Notificação para usuários monitorando o agente
    if (window.location.pathname.includes(`/agents/${data.agentId}`)) {
      useAppStore.getState().addNotification({
        id: `agent_${data.agentId}_${Date.now()}`,
        type: 'success',
        title: 'Nova resposta do agente',
        message: 'O agente IA respondeu a uma conversa',
        timestamp: data.timestamp
      });
    }
  }

  private handleSystemNotification(data: {
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    persistent?: boolean;
  }): void {
    useAppStore.getState().addNotification({
      id: `system_${Date.now()}`,
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  private handleUserActivity(data: {
    userId: string;
    action: 'online' | 'offline';
    users: string[];
  }): void {
    useAppStore.getState().updateOnlineUsers(data.users);
  }

  // Métodos públicos para emitir eventos
  joinConversation(conversationId: string): void {
    this.socket?.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: string): void {
    this.socket?.emit('leave_conversation', conversationId);
  }

  sendTyping(conversationId: string): void {
    this.socket?.emit('typing', conversationId);
  }

  stopTyping(conversationId: string): void {
    this.socket?.emit('stop_typing', conversationId);
  }
}

export const realtimeService = RealtimeService.getInstance();
```

**Hook para Realtime:**
```typescript
export function useRealtime() {
  const { user, currentBusiness } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user && currentBusiness) {
      const token = localStorage.getItem('access_token');
      if (token) {
        realtimeService.connect(currentBusiness, token);
        setIsConnected(true);
      }
    }

    return () => {
      realtimeService.disconnect();
      setIsConnected(false);
    };
  }, [user, currentBusiness]);

  return {
    isConnected,
    joinConversation: realtimeService.joinConversation.bind(realtimeService),
    leaveConversation: realtimeService.leaveConversation.bind(realtimeService),
    sendTyping: realtimeService.sendTyping.bind(realtimeService),
    stopTyping: realtimeService.stopTyping.bind(realtimeService)
  };
}
```

### Sincronização Offline e Cache Persistente

**Service Worker para Cache:**
```typescript
// public/sw.js
const CACHE_NAME = 'automarketing-v1';
const urlsToCache = [
  '/',
  '/dashboard/overview',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se disponível
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
```

**Hook para Status de Conectividade:**
```typescript
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sincroniza dados quando volta online
      queryClient.refetchQueries({ type: 'active' });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

Esta arquitetura de estado e dados garante uma experiência de usuário fluida, com sincronização eficiente, atualizações em tempo real e capacidade de funcionar offline quando necessário.


## Desenvolvimento de Componentes e UI/UX

O desenvolvimento de componentes seguirá uma abordagem modular e escalável, utilizando o design system Shadcn/UI como base e criando componentes específicos para as funcionalidades de automação de marketing. A interface será projetada para ser intuitiva, responsiva e acessível, com foco na experiência do usuário e produtividade.

### Design System e Componentes Base

**Configuração do Design System:**
```typescript
// lib/design-tokens.ts
export const designTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }]
    }
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  }
};
```

**Componente de Card Personalizado:**
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: LucideIcon;
  className?: string;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  className,
  loading = false
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-gray-400" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {change && (
          <p className="text-xs text-gray-600 mt-1">
            <span
              className={cn(
                'font-medium',
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
            </span>
            {' '}desde {change.period}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

**Componente de Tabela Avançada:**
```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: Array<{
    label: string;
    onClick: (row: T) => void;
    variant?: 'default' | 'destructive';
  }>;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  pagination,
  searchable = false,
  searchValue = '',
  onSearchChange,
  actions = [],
  emptyMessage = 'Nenhum item encontrado'
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: keyof T) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  if (loading) {
    return (
      <div className="space-y-4">
        {searchable && (
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        )}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableHead>
                ))}
                {actions.length > 0 && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={String(column.key)}
                  style={{ width: column.width }}
                  className={column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <ArrowUpDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="w-12"></TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="text-center py-8 text-gray-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render 
                        ? column.render(row[column.key], row)
                        : String(row[column.key] || '-')
                      }
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, index) => (
                            <DropdownMenuItem
                              key={index}
                              onClick={() => action.onClick(row)}
                              className={action.variant === 'destructive' ? 'text-red-600' : ''}
                            >
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} resultados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm">
              Página {pagination.page} de {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Páginas Principais da Aplicação

**Dashboard Overview:**
```typescript
import { MetricCard } from '@/components/ui/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  MessageSquare, 
  Route, 
  Bot,
  TrendingUp,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardOverview() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: engagementData } = useEngagementData();
  const { data: recentActivities } = useRecentActivities();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Visão geral das suas métricas de automação de marketing
        </p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Contatos"
          value={metrics?.contacts.total || 0}
          change={{
            value: metrics?.contacts.growth_rate || 0,
            type: (metrics?.contacts.growth_rate || 0) >= 0 ? 'increase' : 'decrease',
            period: 'último mês'
          }}
          icon={Users}
          loading={metricsLoading}
        />
        
        <MetricCard
          title="Mensagens Enviadas Hoje"
          value={metrics?.messages.sent_today || 0}
          change={{
            value: metrics?.messages.delivered_rate || 0,
            type: 'increase',
            period: 'taxa de entrega'
          }}
          icon={MessageSquare}
          loading={metricsLoading}
        />
        
        <MetricCard
          title="Jornadas Ativas"
          value={metrics?.journeys.active || 0}
          change={{
            value: metrics?.journeys.avg_conversion || 0,
            type: 'increase',
            period: 'conversão média'
          }}
          icon={Route}
          loading={metricsLoading}
        />
        
        <MetricCard
          title="Conversas de IA"
          value={metrics?.agents.active_conversations || 0}
          change={{
            value: metrics?.agents.satisfaction_score || 0,
            type: 'increase',
            period: 'satisfação'
          }}
          icon={Bot}
          loading={metricsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Engajamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Engajamento dos Últimos 30 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="messages_sent" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Mensagens Enviadas"
                />
                <Line 
                  type="monotone" 
                  dataKey="messages_received" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Mensagens Recebidas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities?.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.timestamp), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Página de Contatos:**
```typescript
import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Download } from 'lucide-react';
import { useContacts, useDeleteContact } from '@/hooks/useContacts';
import { ContactFilters } from '@/types/contact';

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ContactFilters>({});
  const [searchValue, setSearchValue] = useState('');

  const { data: contactsData, isLoading } = useContacts(
    { ...filters, search: searchValue },
    page,
    20
  );
  
  const deleteContactMutation = useDeleteContact();

  const columns = [
    {
      key: 'full_name' as keyof Contact,
      label: 'Nome',
      sortable: true,
      render: (value: string, row: Contact) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {row.nickname && (
            <div className="text-sm text-gray-500">"{row.nickname}"</div>
          )}
        </div>
      )
    },
    {
      key: 'phone' as keyof Contact,
      label: 'Telefone',
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'email' as keyof Contact,
      label: 'Email',
      render: (value: string) => value || '-'
    },
    {
      key: 'tags' as keyof Contact,
      label: 'Tags',
      render: (tags: string[]) => (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'engagement_score' as keyof Contact,
      label: 'Engajamento',
      sortable: true,
      render: (score: number) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${score}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">{score}%</span>
        </div>
      )
    },
    {
      key: 'created_at' as keyof Contact,
      label: 'Criado em',
      sortable: true,
      render: (date: string) => format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
    }
  ];

  const actions = [
    {
      label: 'Ver detalhes',
      onClick: (contact: Contact) => router.push(`/dashboard/contacts/${contact.id}`)
    },
    {
      label: 'Editar',
      onClick: (contact: Contact) => {
        // Abrir modal de edição
      }
    },
    {
      label: 'Excluir',
      onClick: (contact: Contact) => {
        if (confirm('Tem certeza que deseja excluir este contato?')) {
          deleteContactMutation.mutate(contact.id);
        }
      },
      variant: 'destructive' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contatos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie sua base de contatos e acompanhe o engajamento
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contato
          </Button>
        </div>
      </div>

      {/* Tabela de contatos */}
      <DataTable
        data={contactsData?.data || []}
        columns={columns}
        loading={isLoading}
        searchable
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        actions={actions}
        pagination={{
          page,
          limit: 20,
          total: contactsData?.pagination.total || 0,
          onPageChange: setPage
        }}
        emptyMessage="Nenhum contato encontrado. Que tal importar sua primeira lista?"
      />
    </div>
  );
}
```

**Página de Criação de Jornada:**
```typescript
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Play } from 'lucide-react';
import { useCreateJourney } from '@/hooks/useJourneys';

interface JourneyStep {
  id: string;
  step_order: number;
  delay_days: number;
  send_time: string;
  step_type: 'whatsapp' | 'email';
  title: string;
  body: string;
}

export default function CreateJourneyPage() {
  const [journeyData, setJourneyData] = useState({
    name: '',
    description: '',
    type: 'engagement' as const
  });
  
  const [steps, setSteps] = useState<JourneyStep[]>([
    {
      id: '1',
      step_order: 1,
      delay_days: 0,
      send_time: '09:00',
      step_type: 'whatsapp',
      title: 'Mensagem de Boas-vindas',
      body: 'Olá {{contact.nickname}}! Seja bem-vindo(a) à nossa plataforma.'
    }
  ]);

  const createJourneyMutation = useCreateJourney();

  const addStep = () => {
    const newStep: JourneyStep = {
      id: Date.now().toString(),
      step_order: steps.length + 1,
      delay_days: 1,
      send_time: '09:00',
      step_type: 'whatsapp',
      title: '',
      body: ''
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const updateStep = (stepId: string, updates: Partial<JourneyStep>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const handleSave = async () => {
    try {
      await createJourneyMutation.mutateAsync({
        ...journeyData,
        steps: steps.map(({ id, ...step }) => step)
      });
      router.push('/dashboard/journeys');
    } catch (error) {
      console.error('Failed to create journey:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Jornada</h1>
          <p className="text-gray-600 mt-1">
            Crie uma sequência automatizada de mensagens
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={createJourneyMutation.isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {createJourneyMutation.isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Configurações da Jornada */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nome da Jornada</label>
              <Input
                value={journeyData.name}
                onChange={(e) => setJourneyData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Onboarding de Novos Clientes"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <Select
                value={journeyData.type}
                onValueChange={(value) => setJourneyData(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="engagement">Engajamento</SelectItem>
                  <SelectItem value="renewal">Renovação</SelectItem>
                  <SelectItem value="offer">Oferta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <Textarea
              value={journeyData.description}
              onChange={(e) => setJourneyData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o objetivo desta jornada..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Steps da Jornada */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Passos da Jornada</h2>
          <Button onClick={addStep} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Passo
          </Button>
        </div>

        {steps.map((step, index) => (
          <Card key={step.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Passo {index + 1}
                  {index > 0 && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (após {step.delay_days} dia{step.delay_days !== 1 ? 's' : ''})
                    </span>
                  )}
                </CardTitle>
                {steps.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(step.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {index > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Aguardar (dias)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={step.delay_days}
                      onChange={(e) => updateStep(step.id, { 
                        delay_days: parseInt(e.target.value) || 0 
                      })}
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Horário de Envio
                  </label>
                  <Input
                    type="time"
                    value={step.send_time}
                    onChange={(e) => updateStep(step.id, { send_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Canal</label>
                  <Select
                    value={step.step_type}
                    onValueChange={(value) => updateStep(step.id, { 
                      step_type: value as 'whatsapp' | 'email' 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Título</label>
                <Input
                  value={step.title}
                  onChange={(e) => updateStep(step.id, { title: e.target.value })}
                  placeholder="Título da mensagem"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Mensagem</label>
                <Textarea
                  value={step.body}
                  onChange={(e) => updateStep(step.id, { body: e.target.value })}
                  placeholder="Digite sua mensagem aqui... Use {{contact.nickname}} para personalizar"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variáveis disponíveis: {{contact.nickname}}, {{contact.full_name}}, {{business.name}}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

Esta estrutura de componentes e páginas oferece uma base sólida para construir uma interface de usuário moderna, intuitiva e altamente funcional, com foco na experiência do usuário e produtividade para automação de marketing.


## Estratégias de Segurança no Frontend

A segurança no frontend é fundamental para proteger dados sensíveis, prevenir ataques e garantir a integridade da aplicação. Implementaremos uma estratégia multicamada que inclui validação de dados, sanitização de inputs, proteção contra XSS, CSRF e outras vulnerabilidades comuns.

### Validação e Sanitização de Dados

**Sistema de Validação com Zod:**
```typescript
import { z } from 'zod';

// Schemas de validação para diferentes entidades
export const contactSchema = z.object({
  full_name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  nickname: z.string()
    .max(50, 'Apelido deve ter no máximo 50 caracteres')
    .optional(),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de telefone inválido')
    .transform(phone => phone.replace(/\D/g, '')), // Remove caracteres não numéricos
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .optional()
    .or(z.literal('')),
  
  tags: z.array(z.string().max(30, 'Tag deve ter no máximo 30 caracteres'))
    .max(10, 'Máximo de 10 tags permitidas'),
  
  metadata: z.record(z.any())
    .optional()
    .refine(
      (data) => !data || JSON.stringify(data).length <= 5000,
      'Metadata deve ter no máximo 5000 caracteres quando serializada'
    )
});

export const journeySchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  description: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  
  type: z.enum(['onboarding', 'engagement', 'renewal', 'offer']),
  
  steps: z.array(z.object({
    step_order: z.number().int().positive(),
    delay_days: z.number().int().min(0).max(365),
    send_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
    step_type: z.enum(['whatsapp', 'email']),
    title: z.string().min(1, 'Título é obrigatório').max(200, 'Título deve ter no máximo 200 caracteres'),
    body: z.string().min(1, 'Mensagem é obrigatória').max(4000, 'Mensagem deve ter no máximo 4000 caracteres')
  })).min(1, 'Pelo menos um passo é obrigatório')
});

export const agentSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  description: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  
  agent_type: z.enum(['success', 'support', 'sales', 'custom']),
  
  llm_provider: z.enum(['openai', 'anthropic', 'llama2', 'custom']),
  
  config: z.object({
    model: z.string().min(1, 'Modelo é obrigatório'),
    temperature: z.number().min(0).max(2),
    max_tokens: z.number().int().min(1).max(8000),
    system_prompt: z.string()
      .min(10, 'Prompt do sistema deve ter pelo menos 10 caracteres')
      .max(2000, 'Prompt do sistema deve ter no máximo 2000 caracteres')
  })
});

// Hook para validação de formulários
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: any): data is T => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const validateField = (fieldName: string, value: any): boolean => {
    try {
      const fieldSchema = schema.shape[fieldName];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
        return true;
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: error.errors[0]?.message || 'Valor inválido'
        }));
      }
      return false;
    }
  };

  return { validate, validateField, errors, clearErrors: () => setErrors({}) };
}
```

**Sanitização de Inputs:**
```typescript
import DOMPurify from 'dompurify';

class InputSanitizer {
  // Sanitiza HTML para prevenir XSS
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
      ALLOWED_ATTR: []
    });
  }

  // Remove caracteres perigosos de strings simples
  static sanitizeText(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < e >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Sanitiza números de telefone
  static sanitizePhone(phone: string): string {
    return phone.replace(/[^\d+]/g, '');
  }

  // Sanitiza emails
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  // Sanitiza URLs
  static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Permite apenas http e https
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      return parsed.toString();
    } catch {
      return '';
    }
  }

  // Sanitiza objetos recursivamente
  static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeText(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Sanitiza a chave também
        const sanitizedKey = this.sanitizeText(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }
}

// Hook para sanitização automática
export function useSanitizedInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);
  const [sanitizedValue, setSanitizedValue] = useState(
    InputSanitizer.sanitizeText(initialValue)
  );

  const handleChange = (newValue: string) => {
    setValue(newValue);
    setSanitizedValue(InputSanitizer.sanitizeText(newValue));
  };

  return {
    value,
    sanitizedValue,
    onChange: handleChange
  };
}
```

### Proteção contra Ataques XSS e CSRF

**Componente de Input Seguro:**
```typescript
import { forwardRef, InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SecureInputProps extends InputHTMLAttributes<HTMLInputElement> {
  sanitize?: boolean;
  allowHtml?: boolean;
  maxLength?: number;
}

export const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
  ({ sanitize = true, allowHtml = false, maxLength, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // Aplica limite de caracteres
      if (maxLength && value.length > maxLength) {
        value = value.substring(0, maxLength);
      }

      // Sanitiza se necessário
      if (sanitize) {
        value = allowHtml 
          ? InputSanitizer.sanitizeHtml(value)
          : InputSanitizer.sanitizeText(value);
      }

      // Atualiza o valor do input
      e.target.value = value;
      
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        onChange={handleChange}
        className={cn(props.className)}
      />
    );
  }
);

SecureInput.displayName = 'SecureInput';
```

**Proteção CSRF:**
```typescript
// utils/csrf.ts
class CSRFProtection {
  private static token: string | null = null;

  static async getToken(): Promise<string> {
    if (!this.token) {
      try {
        const response = await fetch('/api/csrf-token', {
          credentials: 'include'
        });
        const data = await response.json();
        this.token = data.token;
      } catch (error) {
        console.error('Failed to get CSRF token:', error);
        throw new Error('CSRF token unavailable');
      }
    }
    return this.token;
  }

  static async addTokenToRequest(config: any): Promise<any> {
    const token = await this.getToken();
    return {
      ...config,
      headers: {
        ...config.headers,
        'X-CSRF-Token': token
      }
    };
  }

  static clearToken(): void {
    this.token = null;
  }
}

// Interceptor para adicionar token CSRF automaticamente
apiClient.interceptors.request.use(async (config) => {
  // Adiciona CSRF token apenas para requests que modificam dados
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
    return await CSRFProtection.addTokenToRequest(config);
  }
  return config;
});
```

### Gerenciamento Seguro de Tokens e Sessões

**Armazenamento Seguro de Tokens:**
```typescript
class SecureStorage {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly ENCRYPTION_KEY = 'user_session_key';

  // Criptografia simples para tokens (em produção, usar bibliotecas mais robustas)
  private static encrypt(text: string): string {
    // Implementação básica - em produção usar crypto-js ou similar
    return btoa(text);
  }

  private static decrypt(encryptedText: string): string {
    try {
      return atob(encryptedText);
    } catch {
      return '';
    }
  }

  static setAccessToken(token: string): void {
    const encrypted = this.encrypt(token);
    localStorage.setItem(this.ACCESS_TOKEN_KEY, encrypted);
  }

  static getAccessToken(): string | null {
    const encrypted = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    if (!encrypted) return null;
    
    const decrypted = this.decrypt(encrypted);
    
    // Verifica se o token não expirou
    if (this.isTokenExpired(decrypted)) {
      this.clearTokens();
      return null;
    }
    
    return decrypted;
  }

  static setRefreshToken(token: string): void {
    const encrypted = this.encrypt(token);
    // Refresh token em httpOnly cookie seria mais seguro
    localStorage.setItem(this.REFRESH_TOKEN_KEY, encrypted);
  }

  static getRefreshToken(): string | null {
    const encrypted = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!encrypted) return null;
    return this.decrypt(encrypted);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  private static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  // Limpa dados sensíveis quando a aba é fechada
  static setupCleanupOnUnload(): void {
    window.addEventListener('beforeunload', () => {
      // Mantém apenas refresh token para reconexão automática
      const refreshToken = this.getRefreshToken();
      this.clearTokens();
      if (refreshToken) {
        this.setRefreshToken(refreshToken);
      }
    });
  }
}
```

**Monitoramento de Sessão:**
```typescript
class SessionMonitor {
  private static instance: SessionMonitor;
  private inactivityTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos
  private readonly WARNING_TIME = 5 * 60 * 1000; // 5 minutos antes do timeout

  private constructor() {
    this.setupEventListeners();
  }

  static getInstance(): SessionMonitor {
    if (!SessionMonitor.instance) {
      SessionMonitor.instance = new SessionMonitor();
    }
    return SessionMonitor.instance;
  }

  private setupEventListeners(): void {
    // Eventos que indicam atividade do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.resetTimer.bind(this), true);
    });

    // Monitora mudanças de visibilidade da página
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseTimer();
      } else {
        this.resumeTimer();
      }
    });
  }

  private resetTimer(): void {
    this.clearTimers();
    
    // Timer de aviso
    this.warningTimer = setTimeout(() => {
      this.showInactivityWarning();
    }, this.INACTIVITY_TIMEOUT - this.WARNING_TIME);

    // Timer de logout
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivityLogout();
    }, this.INACTIVITY_TIMEOUT);
  }

  private clearTimers(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  private pauseTimer(): void {
    this.clearTimers();
  }

  private resumeTimer(): void {
    this.resetTimer();
  }

  private showInactivityWarning(): void {
    // Mostra modal de aviso
    const { addNotification } = useAppStore.getState();
    addNotification({
      id: 'inactivity_warning',
      type: 'warning',
      title: 'Sessão expirando',
      message: 'Sua sessão expirará em 5 minutos devido à inatividade.',
      persistent: true,
      actions: [
        {
          label: 'Manter sessão',
          action: () => {
            this.resetTimer();
            useAppStore.getState().removeNotification('inactivity_warning');
          }
        }
      ]
    });
  }

  private handleInactivityLogout(): void {
    const { logout } = useAuthStore.getState();
    logout();
    
    toast.error('Sessão expirada devido à inatividade');
  }

  start(): void {
    this.resetTimer();
  }

  stop(): void {
    this.clearTimers();
  }
}

// Hook para monitoramento de sessão
export function useSessionMonitor() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const monitor = SessionMonitor.getInstance();
      monitor.start();
      
      return () => {
        monitor.stop();
      };
    }
  }, [user]);
}
```

### Validação de Permissões no Frontend

**Sistema de Permissões:**
```typescript
interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

class PermissionValidator {
  private static permissions: string[] = [];

  static setPermissions(permissions: string[]): void {
    this.permissions = permissions;
  }

  static hasPermission(permission: string): boolean {
    // Verifica permissão específica ou wildcard
    return this.permissions.includes(permission) || 
           this.permissions.includes('*') ||
           this.permissions.some(p => {
             const [resource, action] = p.split(':');
             const [reqResource, reqAction] = permission.split(':');
             return resource === reqResource && (action === '*' || action === reqAction);
           });
  }

  static hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  static hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  static canAccessResource(resource: string, action: string = 'read'): boolean {
    return this.hasPermission(`${resource}:${action}`);
  }
}

// Componente para proteção baseada em permissões
interface ProtectedComponentProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function ProtectedComponent({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null
}: ProtectedComponentProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  const hasAccess = useMemo(() => {
    if (permission) {
      return hasPermission(permission);
    }
    
    if (permissions.length > 0) {
      return requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    }
    
    return true;
  }, [permission, permissions, requireAll, hasPermission, hasAnyPermission, hasAllPermissions]);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Hook para verificação de permissões
export function usePermissions() {
  const { user, currentBusiness } = useAuth();

  const permissions = useMemo(() => {
    if (!user || !currentBusiness) return [];
    
    const business = user.businesses.find(b => b.id === currentBusiness);
    if (!business) return [];

    // Mapeia roles para permissões (sincronizado com backend)
    const rolePermissions = {
      admin: ['*'],
      manager: [
        'contacts:*', 'journeys:*', 'agents:*', 'messages:*',
        'analytics:read', 'tools:read', 'settings:read'
      ],
      agent: [
        'contacts:read', 'contacts:update', 'messages:create',
        'conversations:takeover', 'analytics:read'
      ]
    };

    return rolePermissions[business.role] || [];
  }, [user, currentBusiness]);

  const hasPermission = useCallback((permission: string): boolean => {
    return permissions.includes(permission) || 
           permissions.includes('*') ||
           permissions.some(p => {
             const [resource, action] = p.split(':');
             const [reqResource, reqAction] = permission.split(':');
             return resource === reqResource && (action === '*' || action === reqAction);
           });
  }, [permissions]);

  const hasAnyPermission = useCallback((perms: string[]): boolean => {
    return perms.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((perms: string[]): boolean => {
    return perms.every(permission => hasPermission(permission));
  }, [hasPermission]);

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
}
```

### Auditoria e Logging de Segurança

**Sistema de Auditoria Frontend:**
```typescript
interface AuditEvent {
  event_type: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
  user_agent?: string;
  ip_address?: string;
  timestamp: string;
}

class SecurityAuditor {
  private static instance: SecurityAuditor;
  private events: AuditEvent[] = [];
  private readonly MAX_EVENTS = 100;

  private constructor() {}

  static getInstance(): SecurityAuditor {
    if (!SecurityAuditor.instance) {
      SecurityAuditor.instance = new SecurityAuditor();
    }
    return SecurityAuditor.instance;
  }

  logEvent(event: Omit<AuditEvent, 'timestamp' | 'user_agent'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent
    };

    this.events.unshift(auditEvent);
    
    // Mantém apenas os últimos eventos
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(0, this.MAX_EVENTS);
    }

    // Envia para backend se for evento crítico
    if (this.isCriticalEvent(event.event_type)) {
      this.sendToBackend(auditEvent);
    }
  }

  private isCriticalEvent(eventType: string): boolean {
    const criticalEvents = [
      'login_attempt',
      'login_failure',
      'permission_denied',
      'data_export',
      'sensitive_data_access',
      'configuration_change'
    ];
    return criticalEvents.includes(eventType);
  }

  private async sendToBackend(event: AuditEvent): Promise<void> {
    try {
      await apiClient.post('/audit/events', event);
    } catch (error) {
      console.error('Failed to send audit event:', error);
    }
  }

  getEvents(): AuditEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }
}

// Hook para auditoria
export function useSecurityAudit() {
  const auditor = SecurityAuditor.getInstance();

  const logSecurityEvent = useCallback((
    eventType: string,
    details?: Record<string, any>
  ) => {
    auditor.logEvent({
      event_type: eventType,
      details
    });
  }, [auditor]);

  const logResourceAccess = useCallback((
    resourceType: string,
    resourceId: string,
    action: string = 'read'
  ) => {
    auditor.logEvent({
      event_type: 'resource_access',
      resource_type: resourceType,
      resource_id: resourceId,
      details: { action }
    });
  }, [auditor]);

  const logPermissionDenied = useCallback((
    resource: string,
    action: string
  ) => {
    auditor.logEvent({
      event_type: 'permission_denied',
      details: { resource, action }
    });
  }, [auditor]);

  return {
    logSecurityEvent,
    logResourceAccess,
    logPermissionDenied
  };
}
```

Esta estratégia de segurança no frontend garante proteção robusta contra vulnerabilidades comuns, mantendo a usabilidade e performance da aplicação, enquanto oferece visibilidade completa sobre eventos de segurança.


## Deployment, Performance e Testes

O deployment e otimização de performance são aspectos críticos para garantir que a aplicação frontend seja rápida, confiável e escalável. Implementaremos estratégias de build otimizado, cache inteligente, monitoramento de performance e testes abrangentes.

### Estratégias de Build e Otimização

**Configuração do Vite para Produção:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // Análise do bundle em produção
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true
    })
  ],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa vendors principais
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'chart-vendor': ['recharts'],
          'form-vendor': ['react-hook-form', 'zod'],
          'query-vendor': ['@tanstack/react-query'],
          'utils': ['date-fns', 'clsx', 'tailwind-merge']
        },
        
        // Nomeia chunks de forma consistente
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop() 
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    
    // Otimizações de minificação
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      },
      mangle: {
        safari10: true
      }
    },
    
    // Configurações de chunk
    chunkSizeWarningLimit: 1000,
    
    // Compressão
    reportCompressedSize: true
  },
  
  // Otimizações de desenvolvimento
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: true
    }
  },
  
  // Pré-bundling de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'date-fns',
      'recharts'
    ]
  }
});
```

**Lazy Loading e Code Splitting:**
```typescript
// utils/lazy-loading.tsx
import { lazy, Suspense, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// HOC para lazy loading com fallback customizado
export function withLazyLoading<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function WrappedComponent(props: any) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Lazy loading das páginas principais
export const DashboardOverview = withLazyLoading(
  () => import('@/pages/dashboard/overview'),
  <div className="flex items-center justify-center h-64">
    <LoadingSpinner />
  </div>
);

export const ContactsPage = withLazyLoading(
  () => import('@/pages/contacts/list')
);

export const JourneysPage = withLazyLoading(
  () => import('@/pages/journeys/list')
);

export const AgentsPage = withLazyLoading(
  () => import('@/pages/agents/list')
);

export const AnalyticsPage = withLazyLoading(
  () => import('@/pages/analytics/overview')
);

// Lazy loading de componentes pesados
export const DataTable = withLazyLoading(
  () => import('@/components/ui/data-table')
);

export const ChartContainer = withLazyLoading(
  () => import('@/components/charts/chart-container')
);
```

**Otimização de Imagens:**
```typescript
// components/ui/optimized-image.tsx
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  loading?: 'lazy' | 'eager';
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+',
  loading = 'lazy',
  quality = 80
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setHasError(true);
    };
    
    img.src = src;
  }, [src]);

  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Imagem não encontrada</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-50',
        className
      )}
      onLoad={() => setIsLoaded(true)}
    />
  );
}
```

### Cache e Service Workers

**Configuração de Service Worker:**
```typescript
// public/sw.js
const CACHE_NAME = 'automarketing-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

const STATIC_ASSETS = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json'
];

const API_CACHE_PATTERNS = [
  /\/api\/dashboard\/metrics/,
  /\/api\/contacts\?/,
  /\/api\/journeys/
];

// Instala o service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Ativa o service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE
            )
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Intercepta requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache first para assets estáticos
  if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset))) {
    event.respondWith(
      caches.match(request)
        .then((response) => response || fetch(request))
    );
    return;
  }

  // Network first com cache fallback para APIs
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cacheia apenas respostas de sucesso para APIs específicas
          if (response.ok && API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Fallback para cache se network falhar
          return caches.match(request);
        })
    );
    return;
  }

  // Cache first para outros recursos
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => cache.put(request, responseClone));
            }
            return response;
          });
      })
  );
});

// Limpa cache antigo periodicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(DYNAMIC_CACHE);
  }
});
```

**Registro do Service Worker:**
```typescript
// utils/service-worker.ts
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  async register(): Promise<void> {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateNotification();
              }
            });
          }
        });

        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private showUpdateNotification(): void {
    const { addNotification } = useAppStore.getState();
    addNotification({
      id: 'app_update',
      type: 'info',
      title: 'Atualização disponível',
      message: 'Uma nova versão da aplicação está disponível.',
      persistent: true,
      actions: [
        {
          label: 'Atualizar',
          action: () => this.updateApp()
        },
        {
          label: 'Depois',
          action: () => useAppStore.getState().removeNotification('app_update')
        }
      ]
    });
  }

  private updateApp(): void {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  async clearCache(): Promise<void> {
    if (this.registration?.active) {
      this.registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
  }
}
```

### Monitoramento de Performance

**Web Vitals e Métricas:**
```typescript
// utils/performance-monitor.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];

  private constructor() {
    this.initializeWebVitals();
    this.monitorCustomMetrics();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeWebVitals(): void {
    // Largest Contentful Paint
    getLCP((metric) => {
      this.recordMetric({
        name: 'LCP',
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now()
      });
    });

    // First Input Delay
    getFID((metric) => {
      this.recordMetric({
        name: 'FID',
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now()
      });
    });

    // Cumulative Layout Shift
    getCLS((metric) => {
      this.recordMetric({
        name: 'CLS',
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now()
      });
    });

    // First Contentful Paint
    getFCP((metric) => {
      this.recordMetric({
        name: 'FCP',
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now()
      });
    });

    // Time to First Byte
    getTTFB((metric) => {
      this.recordMetric({
        name: 'TTFB',
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now()
      });
    });
  }

  private monitorCustomMetrics(): void {
    // Monitora tempo de carregamento de rotas
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          this.recordMetric({
            name: 'DOM_CONTENT_LOADED',
            value: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            rating: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart < 1000 ? 'good' : 'needs-improvement',
            timestamp: Date.now()
          });
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });

    // Monitora recursos carregados
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) { // Recursos que demoram mais de 1s
          console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms`);
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
  }

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Envia métricas críticas para o backend
    if (metric.rating === 'poor') {
      this.sendMetricToBackend(metric);
    }

    // Mantém apenas as últimas 50 métricas
    if (this.metrics.length > 50) {
      this.metrics = this.metrics.slice(-50);
    }
  }

  private async sendMetricToBackend(metric: PerformanceMetric): Promise<void> {
    try {
      await fetch('/api/performance/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...metric,
          userAgent: navigator.userAgent,
          url: window.location.href,
          connection: (navigator as any).connection?.effectiveType
        })
      });
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }
}

// Hook para monitoramento de performance
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance();
    
    const interval = setInterval(() => {
      setMetrics(monitor.getMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    getAverageMetric: (name: string) => {
      const monitor = PerformanceMonitor.getInstance();
      return monitor.getAverageMetric(name);
    }
  };
}
```

### Estratégias de Teste

**Configuração do Jest:**
```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/**/*.stories.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json']
};
```

**Setup de Testes:**
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Mock do IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock do ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Setup do MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock do fetch
global.fetch = jest.fn();
```

**Mocks com MSW:**
```typescript
// src/test/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          businesses: [
            {
              id: 'business-1',
              name: 'Test Business',
              role: 'admin'
            }
          ]
        },
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token'
      })
    );
  }),

  // Contacts endpoints
  rest.get('/api/contacts', (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    const limit = req.url.searchParams.get('limit') || '20';
    
    return res(
      ctx.json({
        data: [
          {
            id: '1',
            full_name: 'João Silva',
            phone: '+5511999999999',
            email: 'joao@example.com',
            tags: ['cliente', 'vip'],
            engagement_score: 85,
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 1,
          totalPages: 1
        }
      })
    );
  }),

  // Dashboard metrics
  rest.get('/api/dashboard/metrics', (req, res, ctx) => {
    return res(
      ctx.json({
        contacts: {
          total: 1250,
          new_this_month: 85,
          growth_rate: 12.5
        },
        messages: {
          sent_today: 342,
          delivered_rate: 98.5,
          response_rate: 24.3
        },
        journeys: {
          active: 8,
          total_enrolled: 450,
          avg_conversion: 18.7
        },
        agents: {
          active_conversations: 12,
          avg_response_time: 2.3,
          satisfaction_score: 4.6
        }
      })
    );
  })
];
```

**Testes de Componentes:**
```typescript
// src/components/ui/__tests__/metric-card.test.tsx
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../metric-card';
import { Users } from 'lucide-react';

describe('MetricCard', () => {
  it('renders metric card with basic props', () => {
    render(
      <MetricCard
        title="Total Users"
        value={1250}
        icon={Users}
      />
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,250')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(
      <MetricCard
        title="Total Users"
        value={0}
        loading={true}
      />
    );

    expect(screen.getByTestId('metric-card-skeleton')).toBeInTheDocument();
  });

  it('renders change indicator correctly', () => {
    render(
      <MetricCard
        title="Total Users"
        value={1250}
        change={{
          value: 12.5,
          type: 'increase',
          period: 'último mês'
        }}
      />
    );

    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    expect(screen.getByText('desde último mês')).toBeInTheDocument();
  });
});
```

**Testes de Integração:**
```typescript
// src/pages/__tests__/contacts.integration.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ContactsPage from '../contacts/list';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('ContactsPage Integration', () => {
  it('loads and displays contacts', async () => {
    render(<ContactsPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Carregando...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    expect(screen.getByText('+5511999999999')).toBeInTheDocument();
    expect(screen.getByText('joao@example.com')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    render(<ContactsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(searchInput, { target: { value: 'João' } });

    await waitFor(() => {
      expect(searchInput).toHaveValue('João');
    });
  });
});
```

### Deployment e CI/CD

**GitHub Actions Workflow:**
```yaml
# .github/workflows/deploy.yml
name: Deploy Frontend

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
          NEXT_PUBLIC_REALTIME_URL: ${{ secrets.REALTIME_URL }}
      
      - name: Run bundle analysis
        run: npm run analyze
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Scripts de Build:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "analyze": "ANALYZE=true vite build",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

Esta estratégia de deployment e performance garante que a aplicação seja otimizada, testada e monitorada adequadamente, oferecendo uma experiência de usuário excepcional em produção.


## Estrutura de Projeto e Organização

### Organização de Diretórios

```
frontend/
├── public/
│   ├── sw.js
│   ├── manifest.json
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── metric-card.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── breadcrumbs.tsx
│   │   │   └── dashboard-layout.tsx
│   │   ├── forms/
│   │   │   ├── contact-form.tsx
│   │   │   ├── journey-form.tsx
│   │   │   ├── agent-form.tsx
│   │   │   └── login-form.tsx
│   │   ├── charts/
│   │   │   ├── engagement-chart.tsx
│   │   │   ├── performance-chart.tsx
│   │   │   └── chart-container.tsx
│   │   └── notifications/
│   │       ├── notification-center.tsx
│   │       └── toast-provider.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── forgot-password.tsx
│   │   ├── dashboard/
│   │   │   └── overview.tsx
│   │   ├── contacts/
│   │   │   ├── list.tsx
│   │   │   ├── detail.tsx
│   │   │   └── import.tsx
│   │   ├── journeys/
│   │   │   ├── list.tsx
│   │   │   ├── create.tsx
│   │   │   ├── edit.tsx
│   │   │   └── analytics.tsx
│   │   ├── agents/
│   │   │   ├── list.tsx
│   │   │   ├── create.tsx
│   │   │   ├── configure.tsx
│   │   │   └── conversations.tsx
│   │   ├── analytics/
│   │   │   ├── overview.tsx
│   │   │   ├── performance.tsx
│   │   │   └── insights.tsx
│   │   └── settings/
│   │       ├── business.tsx
│   │       ├── team.tsx
│   │       ├── integrations.tsx
│   │       └── security.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useContacts.ts
│   │   ├── useJourneys.ts
│   │   ├── useAgents.ts
│   │   ├── useAnalytics.ts
│   │   ├── useRealtime.ts
│   │   └── usePermissions.ts
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── contact.service.ts
│   │   │   ├── journey.service.ts
│   │   │   ├── agent.service.ts
│   │   │   └── analytics.service.ts
│   │   ├── realtime/
│   │   │   └── realtime.service.ts
│   │   └── storage/
│   │       └── secure-storage.ts
│   ├── stores/
│   │   ├── auth.store.ts
│   │   ├── app.store.ts
│   │   ├── dashboard.store.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── sanitization.ts
│   │   ├── formatting.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── contact.ts
│   │   ├── journey.ts
│   │   ├── agent.ts
│   │   ├── analytics.ts
│   │   └── common.ts
│   ├── test/
│   │   ├── setup.ts
│   │   ├── mocks/
│   │   │   ├── handlers.ts
│   │   │   └── server.ts
│   │   └── utils/
│   │       └── test-utils.tsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── components.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── jest.config.js
├── playwright.config.ts
└── README.md
```

### Configuração de Desenvolvimento

**package.json:**
```json
{
  "name": "marketing-automation-frontend",
  "version": "1.0.0",
  "description": "Frontend para plataforma de automação de marketing com IA",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "analyze": "ANALYZE=true vite build",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "@tanstack/react-query": "^5.8.4",
    "zustand": "^4.4.7",
    "axios": "^1.6.2",
    "socket.io-client": "^4.7.4",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.2",
    "date-fns": "^2.30.0",
    "recharts": "^2.8.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "sonner": "^1.2.4",
    "framer-motion": "^10.16.5",
    "dompurify": "^3.0.6",
    "web-vitals": "^3.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@types/dompurify": "^3.0.5",
    "@vitejs/plugin-react": "^4.1.1",
    "vite": "^5.0.0",
    "typescript": "^5.2.2",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "eslint": "^8.53.0",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8",
    "ts-jest": "^29.1.1",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "msw": "^2.0.8",
    "@playwright/test": "^1.40.1",
    "@storybook/react": "^7.5.3",
    "@storybook/react-vite": "^7.5.3",
    "rollup-plugin-visualizer": "^5.9.2"
  }
}
```

## Conclusão e Roadmap de Implementação

### Resumo do Planejamento Frontend

Este planejamento detalhado do frontend estabelece uma arquitetura moderna e robusta que se integra perfeitamente com o backend Node.js planejado. A solução oferece uma experiência de usuário excepcional através de:

**Arquitetura Escalável:** Stack tecnológica moderna com React 18, TypeScript, Next.js e Tailwind CSS, garantindo performance e manutenibilidade.

**Integração Segura:** Comunicação exclusiva com o backend através de APIs REST, sem exposição direta ao Supabase, mantendo a segurança e consistência dos dados.

**Estado Inteligente:** Gestão de estado híbrida com Zustand para estado global, TanStack Query para cache de dados e Socket.io para atualizações em tempo real.

**Interface Intuitiva:** Design system consistente baseado em Shadcn/UI, componentes reutilizáveis e experiência de usuário otimizada para produtividade.

**Segurança Robusta:** Validação de dados com Zod, sanitização de inputs, proteção contra XSS/CSRF e sistema de permissões granular.

**Performance Otimizada:** Lazy loading, code splitting, cache inteligente, service workers e monitoramento de Web Vitals.

### Benefícios da Arquitetura Proposta

**Para Usuários Finais:**
- Interface responsiva e intuitiva
- Atualizações em tempo real
- Performance consistente
- Experiência offline limitada

**Para Desenvolvedores:**
- Código bem estruturado e tipado
- Componentes reutilizáveis
- Testes abrangentes
- Debugging facilitado

**Para o Negócio:**
- Escalabilidade horizontal
- Segurança enterprise
- Manutenibilidade a longo prazo
- Flexibilidade para novos recursos

### Roadmap de Implementação

**Fase 1 (Semanas 1-2): Fundação**
- Setup do projeto com Vite e TypeScript
- Configuração do design system e componentes base
- Implementação do sistema de autenticação
- Setup de roteamento e layout principal

**Fase 2 (Semanas 3-4): Funcionalidades Core**
- Implementação das páginas principais (Dashboard, Contatos)
- Integração com APIs do backend
- Sistema de estado com Zustand e TanStack Query
- Componentes de formulários e validação

**Fase 3 (Semanas 5-6): Funcionalidades Avançadas**
- Páginas de Jornadas e Agentes IA
- Integração de realtime com Socket.io
- Sistema de notificações
- Analytics e visualizações

**Fase 4 (Semanas 7-8): Polimento e Produção**
- Otimizações de performance
- Testes abrangentes (unit, integration, e2e)
- Setup de CI/CD
- Deploy em produção

### Métricas de Sucesso

**Performance:**
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Bundle size < 500KB (gzipped)

**Qualidade:**
- Cobertura de testes > 80%
- Zero vulnerabilidades críticas
- Acessibilidade WCAG 2.1 AA
- SEO score > 90

**Experiência do Usuário:**
- Tempo de carregamento inicial < 3s
- Interações responsivas < 100ms
- Taxa de erro < 1%
- Satisfação do usuário > 4.5/5

### Considerações Finais

O frontend planejado representa uma solução moderna e completa para automação de marketing, oferecendo uma interface poderosa e intuitiva que maximiza a produtividade dos usuários. A arquitetura proposta garante que a aplicação seja não apenas funcional, mas também escalável, segura e mantível a longo prazo.

A integração cuidadosa com o backend Node.js garante que todas as funcionalidades complexas de automação, IA e analytics sejam apresentadas de forma clara e acessível, permitindo que os usuários aproveitem ao máximo o poder da plataforma sem complexidade desnecessária.

---

**Autor:** Manus AI  
**Data:** Janeiro 2024  
**Versão:** 1.0

