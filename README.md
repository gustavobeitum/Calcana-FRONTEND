# 🌱 Calcana — Frontend

Interface web do **Sistema Calcana**, desenvolvido como projeto de extensão universitária em parceria com a **Assocana** (Associação Rural dos Fornecedores e Plantadores de Cana do Vale do Paranapanema). O sistema digitaliza e moderniza a gestão de análises de ATR (Açúcar Total Recuperável), substituindo processos manuais por uma plataforma centralizada e acessível.

---

## 📋 Sobre o Projeto

O Calcana permite que técnicos e administradores cadastrem, acompanhem e analisem os dados de qualidade da cana-de-açúcar de produtores rurais da região. Por meio do sistema, é possível registrar análises laboratoriais (Brix, Pol, fibra, pureza, ATR), gerenciar propriedades e fornecedores, visualizar dashboards com métricas e enviar relatórios por e-mail automaticamente.

---

## 🚀 Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | Biblioteca principal de UI |
| TypeScript | 5.9 | Tipagem estática |
| Vite | 7 | Build e dev server |
| Tailwind CSS | 3.4 | Estilização |
| shadcn/ui + Radix UI | — | Componentes de interface |
| React Router DOM | 7 | Roteamento |
| TanStack Query | 5 | Gerenciamento de estado e cache de requisições |
| Axios | 1.13 | Requisições HTTP |
| Recharts | 3.4 | Gráficos e visualizações |
| jwt-decode | 4 | Decodificação de tokens JWT |
| Sonner | 2 | Notificações toast |

---

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── admin/          # Gestão de operadores/usuários
│   ├── analises/       # Lançamento e listagem de análises de ATR
│   ├── auth/           # Tela de login
│   ├── cadastros/      # Fornecedores e Propriedades
│   ├── dashboard/      # Painel com métricas e gráficos
│   ├── historico/      # Histórico de análises
│   ├── layout/         # Header e Sidebar
│   ├── theme/          # Suporte a tema claro/escuro
│   └── ui/             # Componentes reutilizáveis (shadcn/ui)
├── hooks/              # Custom hooks (ex: useDebounce)
├── routes/             # Configuração de rotas
├── services/           # Integração com a API (axios)
└── App.tsx             # Componente raiz com controle de autenticação
```

---

## ⚙️ Como Rodar Localmente

**Pré-requisitos:** Node.js 18+ e npm.

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/calcana-frontend.git
cd calcana-frontend

# 2. Instale as dependências
npm install

# 3. Configure a URL da API
# Edite src/services/api.ts e aponte para o backend (ex: http://localhost:8080)

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

### Scripts disponíveis

```bash
npm run dev       # Servidor de desenvolvimento com HMR
npm run build     # Build de produção
npm run preview   # Pré-visualizar o build de produção
npm run lint      # Verificar erros de lint
```

---

## 🔐 Autenticação

O sistema utiliza **JWT** para autenticação. O token é armazenado no `localStorage` com a chave `calcana_token` e validado automaticamente a cada carregamento da aplicação. Há controle de perfis de acesso (operador e administrador), com rotas protegidas de acordo com o papel do usuário.

---

## 🖥️ Funcionalidades

- **Login** com autenticação JWT e controle de expiração de sessão
- **Dashboard** com métricas de análises, produtores e gráficos mensais
- **Lançamento de Análises** de ATR com campos técnicos (Brix, Pol, fibra, pureza, etc.)
- **Histórico** de análises com filtros e busca
- **Cadastro de Fornecedores** (produtores de cana)
- **Cadastro de Propriedades** rurais vinculadas a fornecedores
- **Gestão de Operadores** (área administrativa)
- **Tema claro/escuro** com persistência de preferência
- **Notificações toast** de feedback para o usuário

---

## 🔗 Repositório do Backend

A API que alimenta este frontend está disponível em:
👉 [calcana-api](https://github.com/seu-usuario/calcana-api)

---

## 🎓 Projeto de Extensão

Este sistema foi desenvolvido como **projeto de extensão universitária**, com o objetivo de aplicar conhecimentos acadêmicos em uma solução real para a comunidade agrícola da região, beneficiando produtores rurais e a associação Assocana.
