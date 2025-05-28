
# Exodus - Plataforma de Automação Inteligente

Uma plataforma SaaS completa para automação inteligente voltada para experts e infoprodutores, permitindo criar jornadas de onboarding com agentes de IA, acompanhar métricas de engajamento e gerenciar integrações.

## 🚀 Características

- **Dashboard Interativo**: Visão geral com métricas em tempo real
- **Gestão de Jornadas**: Editor visual para criar sequências de automação
- **CRM Integrado**: Gerenciamento completo de leads e clientes
- **Sistema de Disparos**: Templates e mensagens automáticas
- **Integrações**: Conectores para CRMs e APIs de terceiros
- **Design Responsivo**: Interface adaptável para todos os dispositivos
- **Modo Escuro/Claro**: Tema personalizável
- **Animações Fluidas**: Experiência de usuário aprimorada

## 🛠️ Tecnologias

- **Frontend**: React.js + TypeScript + Vite
- **Styling**: TailwindCSS + Shadcn/UI
- **Animações**: Framer Motion
- **Estado**: Zustand
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Roteamento**: React Router DOM

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse a aplicação em `http://localhost:8080`

## 🔐 Credenciais de Demo

Para acessar o sistema, use:
- **Email**: admin@exodus.com
- **Senha**: 123456

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── layout/         # Layout principal (Sidebar, Header)
│   └── ui/             # Componentes base do Shadcn/UI
├── pages/              # Páginas da aplicação
│   ├── auth/           # Autenticação (Login, etc.)
│   ├── Dashboard.tsx   # Dashboard principal
│   └── Journeys.tsx    # Gestão de jornadas
├── stores/             # Estado global (Zustand)
│   ├── authStore.ts    # Autenticação
│   └── appStore.ts     # Configurações da app
├── hooks/              # Hooks customizados
├── lib/                # Utilitários
└── App.tsx             # Componente raiz
```

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação
- Tela de login com validação
- Gerenciamento de estado de usuário
- Proteção de rotas

### ✅ Dashboard
- Cards com métricas (KPIs)
- Gráficos interativos (Line Chart, Bar Chart)
- Performance das jornadas
- Interface responsiva

### ✅ Gestão de Jornadas
- Listagem de jornadas com filtros
- Cards informativos com métricas
- Estados (ativo, pausado, rascunho)
- Ações rápidas (ativar, pausar, duplicar, excluir)

### ✅ Layout & UX
- Sidebar colapsável com animações
- Header com busca e menu de usuário
- Modo escuro/claro
- Animações fluidas com Framer Motion
- Design system consistente

## 🔄 Próximos Passos

### 📋 Páginas Pendentes
- [ ] CRM e Leads (listagem, detalhes, segmentação)
- [ ] Sistema de Disparos (templates, agendamento)
- [ ] Central de Integrações (APIs, webhooks)
- [ ] Configurações da Conta (perfil, faturamento)
- [ ] Relatórios e Analytics

### 🛠️ Funcionalidades Futuras
- [ ] Editor visual de jornadas (drag-and-drop)
- [ ] Sistema de notificações em tempo real
- [ ] Chat/Suporte integrado
- [ ] Exportação de dados
- [ ] API REST para integrações

## 🚀 Deploy

Para fazer o build de produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/` e podem ser servidos por qualquer servidor estático.

## 📚 Documentação

### Estado Global (Zustand)

- `authStore`: Gerencia autenticação e dados do usuário
- `appStore`: Controla sidebar, tema e navegação

### Componentes Principais

- `Layout`: Wrapper principal com sidebar e header
- `StatsCard`: Card de métricas reutilizável
- `Sidebar`: Navegação lateral com animações
- `Header`: Barra superior com busca e perfil

### Estilização

O projeto usa TailwindCSS com configurações customizadas:
- Cores primárias baseadas em Indigo
- Modo escuro completo
- Animações personalizadas
- Componentes do Shadcn/UI

### Animações

Framer Motion é usado para:
- Transições de página
- Hover effects em cards
- Animações de entrada
- Sidebar colapsável

---

**Desenvolvido com ❤️ para automatizar o sucesso dos experts digitais**
