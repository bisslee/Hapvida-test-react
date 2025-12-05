# 📁 Estrutura do Projeto React

## Visão Geral

Projeto React 19+ com TypeScript, Vite, TanStack Query, React Hook Form + Zod, Tailwind CSS (Mobile First), RemixIcon e React Hot Toast.

## 📂 Estrutura de Pastas

```
src/
├── components/          # Componentes React organizados por funcionalidade
│   ├── Cep/            # Componentes relacionados a CEP
│   │   ├── CepForm.tsx      # Formulário de consulta de CEP
│   │   └── CepResult.tsx   # Exibição do resultado do CEP
│   ├── Weather/         # Componentes relacionados ao clima
│   │   ├── WeatherCard.tsx      # Card de clima atual
│   │   └── WeatherForecast.tsx  # Previsão diária
│   ├── History/         # Histórico de consultas
│   │   └── CepHistory.tsx
│   ├── Layout/          # Componentes de layout
│   │   ├── Container.tsx    # Container responsivo
│   │   ├── Header.tsx       # Cabeçalho da aplicação
│   │   └── Layout.tsx       # Layout principal (se necessário)
│   ├── UI/              # Componentes reutilizáveis
│   │   ├── Button.tsx       # Botão com variantes
│   │   ├── Card.tsx         # Card container
│   │   ├── Input.tsx        # Input com validação
│   │   └── LoadingSpinner.tsx # Spinner de loading
│   └── index.ts         # Barrel exports
│
├── hooks/               # Custom hooks
│   ├── useCepHistory.ts     # Hook para gerenciar histórico
│   ├── useDebounce.ts       # Hook para debounce
│   ├── useWeatherQuery.ts    # Hook para consulta de clima
│   └── __tests__/           # Testes dos hooks
│
├── services/            # Serviços de API
│   └── api/
│       ├── cep.ts           # API de CEP (BrasilAPI + ViaCEP)
│       └── weather.ts        # API de clima (Open-Meteo)
│
├── types/               # Definições TypeScript
│   └── index.ts
│
├── utils/               # Funções utilitárias
│   ├── cep.ts               # Utilitários de CEP
│   ├── date.ts              # Formatação de datas
│   ├── cn.ts                # Utility para classes CSS
│   └── index.ts             # Barrel exports
│
├── test/                # Configuração de testes
│   └── setup.ts
│
├── App.tsx              # Componente principal
├── main.tsx             # Entry point
└── index.css            # Estilos globais (Tailwind)

```

## 🎯 Padrões e Convenções

### Mobile First
- Todos os componentes são desenvolvidos pensando primeiro em mobile
- Breakpoints: `sm:` (640px+), `md:` (768px+), `lg:` (1024px+), `xl:` (1280px+)
- Touch targets: mínimo 44px de altura
- Inputs com `text-base` para evitar zoom no iOS

### Componentização
- Componentes pequenos e focados em uma responsabilidade
- Reutilização máxima de componentes UI
- Props tipadas com TypeScript
- Documentação JSDoc nos componentes principais

### Estado e Dados
- **TanStack Query**: Gerenciamento de estado do servidor e cache
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas
- **localStorage**: Persistência do histórico

### Estilização
- **Tailwind CSS**: Utility-first CSS
- **RemixIcon**: Ícones
- **Cores da marca**: Definidas no `tailwind.config.js`

### Testes
- **Vitest**: Framework de testes
- **Testing Library**: Testes de componentes
- Estrutura: `__tests__` dentro de cada módulo

## 📦 Dependências Principais

### Runtime
- `react` + `react-dom` (19+)
- `react-router-dom` (navegação)
- `@tanstack/react-query` (server state)
- `react-hook-form` + `@hookform/resolvers` + `zod` (formulários)
- `react-hot-toast` (notificações)
- `remixicon` (ícones)
- `date-fns` (datas)

### Dev
- `vite` (build tool)
- `typescript`
- `tailwindcss` + `postcss` + `autoprefixer`
- `vitest` + `@testing-library/react` + `@testing-library/jest-dom`
- `eslint` + `prettier`

## 🚀 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
npm run test         # Executar testes
npm run test:ui      # UI do Vitest
npm run test:coverage # Coverage
npm run lint         # ESLint
npm run format       # Prettier
```

## ✅ Status da Implementação

- ✅ Estrutura base criada
- ✅ Componentes UI básicos
- ✅ Formulário de CEP
- ✅ Integração com APIs (CEP e Clima)
- ✅ Histórico com localStorage
- ✅ Mobile First
- ✅ TypeScript configurado
- ✅ Tailwind CSS configurado
- ⏳ Testes (em progresso)
- ⏳ Docker (pendente)
- ⏳ README completo (pendente)

