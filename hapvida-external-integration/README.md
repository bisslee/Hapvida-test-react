# Hapvida - Integração CEP e Clima (Frontend React)

Aplicação React moderna para consulta de CEP e previsão do tempo, desenvolvida como prova técnica para Hapvida.

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [Arquitetura e Boas Práticas](#-arquitetura-e-boas-práticas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Testes](#-testes)
- [Docker](#-docker)
- [APIs Utilizadas](#-apis-utilizadas)
- [Deploy](#-deploy)

## 🎯 Sobre o Projeto

Esta aplicação permite:

- ✅ Consultar CEPs com interface amigável e validação em tempo real
- ✅ Visualizar dados completos do endereço (logradouro, bairro, cidade, UF, coordenadas)
- ✅ Consultar previsão do tempo baseada no CEP informado
- ✅ Manter histórico de consultas no localStorage
- ✅ Interface totalmente responsiva (Mobile First)
- ✅ Tratamento robusto de erros e estados de loading
- ✅ Testes automatizados com alta cobertura

## 🚀 Tecnologias

### Core

- **React 19.2** com TypeScript 5.9
- **Vite 7.2** - Build tool rápida e moderna
- **React Router DOM 7.10** - Navegação (preparado para futuras rotas)

### Formulários e Validação

- **React Hook Form 7.68** - Gerenciamento de formulários performático
- **Zod 4.1** - Validação de schemas type-safe
- **@hookform/resolvers 5.2** - Integração React Hook Form + Zod

### Estado e Cache

- **TanStack Query 5.90** - Gerenciamento de estado servidor, cache automático (10 min), retry inteligente

### Estilização

- **Tailwind CSS 3.4** - Utility-first CSS, Mobile First
- **RemixIcon 4.7** - Biblioteca de ícones completa
- **PostCSS + Autoprefixer** - Processamento CSS

### UX/UI

- **React Hot Toast 2.6** - Notificações toast elegantes
- **date-fns 4.1** - Formatação de datas (com locale pt-BR)

### Testes

- **Vitest 4.0** - Framework de testes rápido
- **Testing Library 16.3** - Testes de componentes focados em UX
- **@vitest/coverage-v8** - Cobertura de código
- **@vitest/ui** - Interface visual para testes

### Qualidade de Código

- **ESLint 9.39** - Linter com regras TypeScript e React
- **Prettier 3.7** - Formatação automática de código
- **TypeScript** - Type safety em todo o projeto

## 📋 Pré-requisitos

- Node.js 20+
- npm ou yarn
- Git

## 🛠️ Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
# Acesse http://localhost:5173

# Build para produção
npm run build

# Preview do build de produção
npm run preview

# Executar testes
npm test

# Executar testes com UI interativa
npm run test:ui

# Executar testes com cobertura
npm run test:coverage

# Formatar código
npm run format

# Lint
npm run lint
```

## ✨ Funcionalidades Implementadas

### ✅ US01: Consulta de CEP com Interface Amigável

- Formulário com validação em tempo real usando React Hook Form + Zod
- Máscara de CEP (XXXXX-XXX) aplicada automaticamente
- Consulta BrasilAPI (primária) com fallback automático para ViaCEP
- Exibição completa dos dados do endereço com coordenadas
- Feedback visual durante carregamento (spinner + texto)
- Tratamento de erros amigável com opção de retry
- Normalização automática de CEP (aceita com ou sem hífen)

### ✅ US02: Consulta de Clima Integrada ao CEP

- Seletor de dias de previsão (1-7 dias, padrão: 3)
- Reutilização de coordenadas do CEP quando disponíveis
- Geocodificação automática quando coordenadas não disponíveis
  - Open-Meteo Geocoding (primário)
  - Nominatim/OpenStreetMap (fallback)
- Exibição de clima atual (temperatura, sensação térmica, umidade)
- Previsão diária (temperatura mínima e máxima)
- Cache de 10 minutos via TanStack Query
- Múltiplas tentativas de geocodificação com variações de query

### ✅ US03: Interface Responsiva e Acessível

- Design Mobile First (320px a 1920px+)
- Componentes com estados visuais claros (hover, focus, active, disabled)
- Feedback visual adequado (loading, success, error)
- Loading states em todas operações assíncronas
- Contrast ratio adequado (WCAG AA)
- Touch targets mínimos de 44px
- Navegação por teclado (Enter, Space, Tab)
- ARIA labels e roles apropriados

### ✅ US04: Tratamento de Erros e Estados de Loading

- Estados de loading com indicadores visuais (spinner + texto)
- Mensagens de erro amigáveis categorizadas:
  - CEP inválido
  - CEP não encontrado
  - Erro de conectividade
  - Timeout de requisição
  - Erro de coordenadas
  - Erro de clima
- Toast notifications para feedback imediato
- Opção de tentar novamente (retry) para erros recuperáveis
- Componente `ErrorDisplay` reutilizável com ícones e cores contextuais

### ✅ US05: Histórico de Consultas

- Lista das últimas 10 consultas (limite configurável)
- Persistência no localStorage com sincronização cross-tab
- Clique para recarregar dados do histórico
- Opção de remover item individual
- Opção de limpar todo o histórico (com confirmação)
- Formatação de datas relativas ("há 5 minutos", "há 2 horas")
- Badge no tab mostrando quantidade de registros
- Context API para gerenciamento centralizado de estado

### ✅ US06: Testes Automatizados

- **85 testes** implementados cobrindo:
  - Utilitários (CEP, datas, erros)
  - Serviços de API (CEP, clima)
  - Hooks customizados (useCepHistory, useWeatherQuery)
  - Componentes UI (Button, ErrorDisplay, Input)
  - Componentes de funcionalidade (CepForm, CepHistory)
- Vitest + Testing Library
- Mocks apropriados (localStorage, fetch, toast)
- Testes de integração (fluxos completos)
- Cobertura de casos de erro e edge cases

### ✅ US07: Estrutura e Organização

- Estrutura de pastas organizada por responsabilidade
- Componentes com responsabilidade única (SRP)
- Hooks customizados reutilizáveis
- Types TypeScript bem definidos e exportados
- Barrel exports (`index.ts`) para imports limpos
- ESLint e Prettier configurados
- Path aliases (`@/`) para imports absolutos

### ✅ US08: Dockerização

- Dockerfile multi-stage otimizado
- Docker Compose configurado
- Aplicação funcional em container
- Nginx para servir arquivos estáticos

### ✅ US09: Documentação

- README completo e estruturado
- Instruções claras de instalação e execução
- Documentação das tecnologias
- Comandos para todas operações
- Análise de arquitetura e boas práticas

## 🏗️ Arquitetura e Boas Práticas

### Arquitetura

O projeto segue uma arquitetura **component-based** com separação clara de responsabilidades:

```
src/
├── components/     # Componentes React organizados por feature
├── hooks/          # Custom hooks reutilizáveis
├── services/       # Serviços de API e integrações externas
├── contexts/       # React Context para estado global
├── utils/          # Funções utilitárias puras
├── types/          # Definições TypeScript
└── test/           # Configuração de testes
```

### Padrões e Princípios

#### 1. **Separation of Concerns**

- **Components**: Apenas lógica de apresentação e interação
- **Hooks**: Lógica de estado e efeitos colaterais
- **Services**: Comunicação com APIs externas
- **Utils**: Funções puras e testáveis

#### 2. **Single Responsibility Principle (SRP)**

Cada componente tem uma única responsabilidade:

- `CepForm`: Apenas formulário de consulta
- `CepResult`: Apenas exibição de resultados
- `WeatherCard`: Apenas clima atual
- `WeatherForecast`: Apenas previsão diária

#### 3. **Composition over Inheritance**

Componentes são compostos, não herdados:

- `Tabs` recebe `children` para flexibilidade
- `Card` é wrapper genérico
- `Button`, `Input` são componentes primitivos reutilizáveis

#### 4. **Custom Hooks para Lógica Reutilizável**

- `useCepHistory`: Gerenciamento de histórico
- `useWeatherQuery`: Consulta de clima com TanStack Query
- `useDebounce`: Debounce genérico (preparado para futuras features)

#### 5. **Context API para Estado Global**

- `CepHistoryContext`: Estado do histórico compartilhado
- Evita prop drilling
- Sincronização automática com localStorage

#### 6. **Type Safety**

- TypeScript em 100% do código
- Interfaces bem definidas em `types/index.ts`
- Tipos derivados de schemas Zod quando possível

### Boas Práticas Implementadas

#### ✅ Performance

- **Code Splitting**: Vite faz automaticamente
- **Lazy Loading**: Import dinâmico em `App.tsx` para `fetchCep` e `normalizeError`
- **Memoization**: `React.useMemo` no Context para evitar re-renders
- **Cache**: TanStack Query com staleTime de 10 minutos
- **Debounce**: Preparado para validação de formulários (se necessário)

#### ✅ Acessibilidade

- **ARIA Labels**: Todos os elementos interativos têm labels
- **Roles**: `button`, `tab`, `tabpanel`, `list`, `listitem`
- **Keyboard Navigation**: Suporte completo (Enter, Space, Tab, Escape)
- **Focus Management**: Indicadores visuais de foco
- **Semantic HTML**: Uso correto de tags semânticas

#### ✅ UX/UI

- **Mobile First**: Design pensado primeiro para mobile
- **Loading States**: Feedback visual em todas operações assíncronas
- **Error Handling**: Mensagens claras e ações de recuperação
- **Toast Notifications**: Feedback imediato de ações
- **Empty States**: Mensagens quando não há dados

#### ✅ Manutenibilidade

- **Naming Conventions**: Nomes descritivos e consistentes
- **File Organization**: Estrutura clara e previsível
- **Comments**: JSDoc em componentes principais
- **DRY**: Reutilização máxima de componentes e funções
- **SOLID**: Princípios aplicados onde apropriado

#### ✅ Testabilidade

- **Pure Functions**: Utils são funções puras, fáceis de testar
- **Component Isolation**: Componentes testados isoladamente
- **Mock Strategy**: Mocks apropriados para dependências externas
- **Test Coverage**: Alta cobertura de casos críticos

#### ✅ Segurança

- **Input Validation**: Validação no cliente e preparado para validação no servidor
- **XSS Prevention**: React escapa automaticamente
- **No Sensitive Data**: Nenhum dado sensível no código

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Cep/            # Componentes relacionados a CEP
│   │   ├── __tests__/
│   │   │   └── CepForm.test.tsx
│   │   ├── CepForm.tsx      # Formulário de consulta
│   │   └── CepResult.tsx   # Exibição do resultado
│   ├── Weather/         # Componentes relacionados ao clima
│   │   ├── WeatherCard.tsx      # Card de clima atual
│   │   └── WeatherForecast.tsx  # Previsão diária
│   ├── History/         # Histórico de consultas
│   │   ├── __tests__/
│   │   │   └── CepHistory.test.tsx
│   │   └── CepHistory.tsx
│   ├── Layout/          # Componentes de layout
│   │   ├── Container.tsx    # Container responsivo
│   │   ├── Header.tsx       # Cabeçalho
│   │   └── Layout.tsx       # Layout principal
│   ├── UI/              # Componentes reutilizáveis
│   │   ├── __tests__/
│   │   │   ├── Button.test.tsx
│   │   │   └── ErrorDisplay.test.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ErrorDisplay.tsx
│   │   ├── Input.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── Tabs.tsx
│   └── index.ts         # Barrel exports
│
├── hooks/               # Custom hooks
│   ├── __tests__/
│   │   ├── useCepHistory.test.ts
│   │   └── useWeatherQuery.test.tsx
│   ├── useDebounce.ts
│   └── useWeatherQuery.ts
│
├── services/            # Serviços de API
│   └── api/
│       ├── __tests__/
│       │   ├── cep.test.ts
│       │   └── weather.test.ts
│       ├── cep.ts           # API de CEP (BrasilAPI + ViaCEP)
│       └── weather.ts       # API de clima (Open-Meteo)
│
├── contexts/            # React Context
│   └── CepHistoryContext.tsx
│
├── types/               # Definições TypeScript
│   └── index.ts
│
├── utils/               # Funções utilitárias
│   ├── __tests__/
│   │   ├── cep.test.ts
│   │   ├── date.test.ts
│   │   └── errors.test.ts
│   ├── cep.ts               # Utilitários de CEP
│   ├── cn.ts                # Utility para classes CSS
│   ├── date.ts              # Formatação de datas
│   ├── errors.ts            # Normalização de erros
│   └── index.ts             # Barrel exports
│
├── test/                # Configuração de testes
│   └── setup.ts
│
├── App.tsx              # Componente principal
├── main.tsx             # Entry point
└── index.css            # Estilos globais (Tailwind)
```

## 🧪 Testes

### Estrutura de Testes

Os testes estão organizados em `__tests__` dentro de cada módulo, seguindo a convenção do projeto.

### Cobertura

- **85 testes** implementados
- **Cobertura de casos críticos**: Utils, Services, Hooks, Componentes principais
- **Testes de integração**: Fluxos completos (consulta CEP → histórico → clima)

### Executar Testes

```bash
# Executar todos os testes
npm test

# Executar com UI interativa
npm run test:ui

# Executar com cobertura
npm run test:coverage

# Executar em modo watch
npm test -- --watch
```

### Tipos de Testes

1. **Unit Tests**: Funções puras (utils)
2. **Component Tests**: Renderização e interações (Testing Library)
3. **Integration Tests**: Fluxos completos (hooks + services)
4. **Error Cases**: Tratamento de erros e edge cases

## 🐳 Docker

### Build e Execução com Docker

```bash
# Build da imagem
docker build -t hapvida-cep-clima .

# Executar container
docker run -d -p 3000:80 --name hapvida-cep-clima hapvida-cep-clima
```

### Docker Compose

```bash
# Executar com docker-compose
docker-compose up -d

# Parar
docker-compose down
```

A aplicação estará disponível em `http://localhost:3000`

## 📡 APIs Utilizadas

### CEP

- **BrasilAPI CEP v2** (primário): `https://brasilapi.com.br/api/cep/v2/{cep}`
- **ViaCEP** (fallback): `https://viacep.com.br/ws/{cep}/json/`

### Clima

- **Open-Meteo Forecast**: `https://api.open-meteo.com/v1/forecast`
- **Open-Meteo Geocoding** (primário): `https://geocoding-api.open-meteo.com/v1/search`
- **Nominatim/OpenStreetMap** (fallback): `https://nominatim.openstreetmap.org/search`

### Características

- Todas as APIs são públicas (sem autenticação)
- Fallback automático em caso de falha
- Timeout configurado (AbortSignal.timeout)
- Retry inteligente via TanStack Query

## 🎨 Design System

### Cores (Mobile First)

- **Primary**: Azul escuro (#2C3850), Preto, Branco
- **Secondary**: Azul (#1565C0), Cinza claro
- **Accent**: Verde (#4CAF50), Vermelho (#FF4336)

### Breakpoints Tailwind

- Mobile: padrão (< 640px)
- Tablet: `sm:` (640px+)
- Desktop: `md:` (768px+), `lg:` (1024px+), `xl:` (1280px+)

### Componentes UI

- **Button**: Variantes (primary, secondary, ghost), tamanhos, loading state
- **Input**: Label, placeholder, ícones, erro, helper text
- **Card**: Container genérico com padding e sombra
- **Tabs**: Navegação por abas com badges
- **ErrorDisplay**: Exibição de erros com ícones e retry
- **LoadingSpinner**: Spinner animado com tamanhos variados

## 🚀 Deploy

A aplicação pode ser deployada em qualquer plataforma que suporte aplicações React estáticas:

- **Vercel** (recomendado): Deploy automático via Git
- **Netlify**: Deploy automático via Git
- **AWS S3 + CloudFront**: Hosting estático
- **GitHub Pages**: Gratuito para projetos públicos
- **Docker**: Container com nginx

### Build de Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`, prontos para deploy.

## 📊 Status do Projeto

### ✅ Implementado

- [x] US01: Consulta de CEP
- [x] US02: Consulta de Clima
- [x] US03: Interface Responsiva
- [x] US04: Tratamento de Erros
- [x] US05: Histórico de Consultas
- [x] US06: Testes Automatizados
- [x] US07: Estrutura e Organização
- [x] US08: Dockerização
- [x] US09: Documentação

### 🔄 Melhorias Futuras (Opcional)

- [ ] PWA (Progressive Web App)
- [ ] Internacionalização (i18n)
- [ ] Dark Mode
- [ ] Filtros no histórico
- [ ] Exportar histórico (CSV/JSON)
- [ ] Gráficos de temperatura
- [ ] Notificações push
- [ ] Testes E2E (Playwright/Cypress)

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm test` - Executa testes
- `npm run test:ui` - Executa testes com UI
- `npm run test:coverage` - Executa testes com cobertura
- `npm run lint` - Executa ESLint
- `npm run format` - Formata código com Prettier

## 🔧 Variáveis de Ambiente

Não são necessárias variáveis de ambiente, todas as APIs são públicas.

## 📄 Licença

Este projeto foi desenvolvido como prova técnica para Hapvida.

---
