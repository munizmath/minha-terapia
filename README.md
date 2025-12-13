# Minha Terapia

Aplicação web progressiva (PWA) para gerenciamento de medicamentos, medições de saúde, rastreamento de sintomas e atividades, com módulo completo de **Psicoterapia Cognitivo-Comportamental (TCC)**. Desenvolvida com React e Vite, oferece uma interface moderna e responsiva para auxiliar no cuidado da saúde física e mental.

## 🌐 Acesso Web

**GitHub Pages:** [https://munizmath.github.io/minha-terapia/](https://munizmath.github.io/minha-terapia/)

**Vercel (alternativa):** [https://app-m1d90czsc-matheusmuniz-2500s-projects.vercel.app](https://app-m1d90czsc-matheusmuniz-2500s-projects.vercel.app)

**Repositório GitHub:** [https://github.com/munizmath/minha-terapia](https://github.com/munizmath/minha-terapia)

## 📋 Índice

- [Acesso Web](#-acesso-web)
- [Características](#características)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Executando o Projeto](#executando-o-projeto)
- [Deploy](#deploy)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Notas de Segurança](#notas-de-segurança)
- [Dependências](#dependências)

## 🎯 Características

### Saúde Física
- ✅ **Gerenciamento de Medicamentos**: Adicione, edite e remova medicamentos com horários personalizados
- 📊 **Dashboard Interativo**: Visualize medicamentos agendados, medições e atividades do dia
- 📈 **Acompanhamento de Progresso**: Gráficos avançados e estatísticas de adesão ao tratamento
- 📝 **Medições de Saúde**: Registre pressão arterial, glicemia, peso, temperatura e outras métricas
- 🎭 **Rastreamento de Sintomas**: Monitore humor, dor, fadiga, ansiedade e qualidade do sono
- 🏃 **Rastreamento de Atividades**: Registre atividades físicas, exercícios e terapias

### Psicoterapia (TCC)
- 🔄 **Frequência de Hábitos**: Registre e monitore a frequência de comportamentos e hábitos
- 💭 **Registro de Pensamentos Disfuncionais (RPD)**: Identifique e trabalhe pensamentos negativos
- 📋 **Registro ABC**: Análise de Antecedentes, Comportamentos e Consequências
- 🎴 **Cartões de Enfrentamento**: Estratégias e técnicas para momentos difíceis

### Suporte e Configurações
- 👨‍⚕️ **Gestão de Especialistas**: Mantenha contatos de médicos, psicólogos e profissionais de saúde
- 🆘 **Contatos de Emergência**: Acesso rápido a contatos importantes
- 👥 **Cuidadores**: Gerencie múltiplos perfis de pessoas sob cuidado
- 📤 **Exportação/Importação**: Backup e restauração de dados via Excel (XLSX)
- 🔔 **Notificações**: Lembretes automáticos para horários de medicamentos
- 🌓 **Tema Claro/Escuro**: Interface adaptável às preferências do usuário
- 📱 **PWA**: Instalável como aplicativo nativo em dispositivos móveis

## 🛠 Tecnologias

- **React 19.2.0** - Biblioteca JavaScript para construção de interfaces
- **Vite 7.2.5 (rolldown-vite)** - Build tool e servidor de desenvolvimento
- **React Router DOM 7.10.1** - Roteamento para aplicações React
- **Vite PWA Plugin 1.2.0** - Suporte a Progressive Web App
- **date-fns 4.1.0** - Manipulação e formatação de datas
- **lucide-react 0.560.0** - Biblioteca de ícones
- **xlsx 0.18.5** - Leitura e escrita de arquivos Excel
- **uuid 13.0.0** - Geração de identificadores únicos
- **ESLint 9.39.1** - Linter para qualidade de código

## 📦 Pré-requisitos

- **Node.js** >= 18.x
- **npm** >= 9.x ou **yarn** >= 1.22.x

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositório>
cd app
```

2. Instale as dependências:
```bash
npm install
```

## ▶️ Executando o Projeto

### Modo Desenvolvimento
```bash
npm run dev
```
O servidor será iniciado em `http://localhost:5173` (ou porta disponível). O servidor está configurado para aceitar conexões de rede (`--host`), permitindo acesso de outros dispositivos na mesma rede.

### Build para Produção
```bash
npm run build
```
Os arquivos otimizados serão gerados na pasta `dist/`.

### Preview da Build
```bash
npm run preview
```
Visualiza a versão de produção localmente antes do deploy.

### Linting
```bash
npm run lint
```
Executa o ESLint para verificar a qualidade do código.

## 🚀 Deploy

O projeto está configurado para deploy em **duas plataformas**:

### GitHub Pages

A aplicação está configurada para deploy automático no **GitHub Pages**. Cada push para a branch `main` aciona o workflow que faz build e deploy automaticamente.

**URL do GitHub Pages**: [https://munizmath.github.io/minha-terapia/](https://munizmath.github.io/minha-terapia/)

#### Habilitar GitHub Pages

1. Acesse o repositório: [https://github.com/munizmath/minha-terapia](https://github.com/munizmath/minha-terapia)
2. Vá em **Settings** → **Pages**
3. Em **Source**, selecione **GitHub Actions**
4. O workflow `.github/workflows/deploy-gh-pages.yml` será executado automaticamente

#### Workflow Automático

O workflow está configurado para:
- Build automático a cada push na branch `main`
- Deploy automático para GitHub Pages
- Suporte a base path `/minha-terapia/`

### Vercel (Alternativa)

O projeto também está configurado para deploy na **Vercel**.

**URL da Vercel**: [https://app-m1d90czsc-matheusmuniz-2500s-projects.vercel.app](https://app-m1d90czsc-matheusmuniz-2500s-projects.vercel.app)

#### Deploy Manual via Vercel CLI

1. Instale o Vercel CLI (se ainda não tiver):
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Deploy para produção:
```bash
vercel --prod
```

#### Configuração Automática

O arquivo `vercel.json` está configurado com:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- Headers de segurança (CSP, XSS Protection, etc.)
- Rewrites para SPA (Single Page Application)

### URLs

- **GitHub Pages**: [https://munizmath.github.io/minha-terapia/](https://munizmath.github.io/minha-terapia/)
- **Vercel**: [https://app-m1d90czsc-matheusmuniz-2500s-projects.vercel.app](https://app-m1d90czsc-matheusmuniz-2500s-projects.vercel.app)
- **Repositório**: [https://github.com/munizmath/minha-terapia](https://github.com/munizmath/minha-terapia)

## 📁 Estrutura do Projeto

```
app/
├── public/                 # Arquivos estáticos públicos
├── src/
│   ├── assets/            # Recursos estáticos (imagens, etc.)
│   ├── components/        # Componentes reutilizáveis
│   │   ├── dashboard/     # Componentes do dashboard
│   │   └── layout/        # Componentes de layout (Navbar, TopBar, Layout)
│   ├── context/           # Context API (MedicationContext)
│   ├── hooks/             # Custom hooks (useNotifications)
│   ├── pages/             # Páginas/rotas da aplicação
│   │   ├── psicoterapia/  # Módulo de TCC (hábitos, pensamentos, ABC, cartões)
│   │   ├── support/       # Páginas de suporte (perfil, especialistas, etc.)
│   │   └── tracker/       # Rastreadores (sintomas, atividades)
│   ├── theme/             # Variáveis de tema CSS
│   ├── utils/             # Funções utilitárias (scheduler)
│   ├── App.jsx            # Componente raiz e rotas
│   ├── main.jsx           # Ponto de entrada da aplicação
│   └── index.css          # Estilos globais
├── dist/                  # Build de produção (gerado)
├── eslint.config.js       # Configuração do ESLint
├── vite.config.js         # Configuração do Vite
├── package.json           # Dependências e scripts
└── README.md              # Este arquivo
```

## 🎨 Funcionalidades Principais

### Dashboard
- Visualização em timeline dos medicamentos agendados para o dia
- Registro rápido de tomada de medicamentos
- Medições do dia atual com gráficos
- Atividades e sintomas recentes
- Acesso rápido às principais funcionalidades

### Gerenciamento de Medicamentos
- Adição de medicamentos com nome, dosagem, horário e estoque
- Agendamento flexível (diário, dias específicos da semana)
- Histórico completo de tomadas
- Alertas de estoque baixo
- Edição e remoção de medicamentos

### Medições de Saúde
- Registro de pressão arterial, glicemia, peso, temperatura
- Visualização histórica com gráficos de tendência
- Gráficos interativos para análise de evolução
- Múltiplos tipos de medições em um único registro

### Rastreamento
- **Sintomas**: Humor (5 níveis), dor, fadiga, ansiedade, qualidade do sono
- **Atividades**: Exercícios físicos, terapias e atividades diárias
- Visualização em cards e timeline
- Histórico completo com filtros

### Psicoterapia (TCC)
- **Frequência de Hábitos**: Registro diário de comportamentos e hábitos com análise de frequência
- **Registro de Pensamentos Disfuncionais (RPD)**: Identificação de pensamentos negativos, emoções e comportamentos associados
- **Registro ABC**: Análise estruturada de Antecedentes, Comportamentos e Consequências
- **Cartões de Enfrentamento**: Criação e gerenciamento de estratégias de enfrentamento para situações difíceis

### Acompanhamento de Progresso
- Gráficos avançados de adesão ao tratamento
- Estatísticas de medicamentos, medições e sintomas
- Visualização temporal de evolução
- Análise de tendências e padrões

### Suporte
- **Perfil do Usuário**: Dados pessoais, informações de saúde e endereço completo
- **Especialistas**: Cadastro de médicos, psicólogos e profissionais de saúde
- **Contatos de Emergência**: Acesso rápido em situações críticas com ligação direta
- **Cuidadores**: Gerenciamento de múltiplos perfis de pessoas sob cuidado
- **Gerenciamento de Dados**: Exportação e importação via Excel (XLSX)
- **Configurações**: Preferências, tema e notificações

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento com HMR |
| `npm run build` | Gera build otimizado para produção |
| `npm run preview` | Visualiza build de produção localmente |
| `npm run lint` | Executa análise estática do código |

## 🔒 Notas de Segurança

### SECURITY-NOTES

**Riscos Identificados e Controles Aplicados:**

1. **Armazenamento Local (localStorage)**
   - **Risco**: Dados sensíveis de saúde armazenados sem criptografia no navegador
   - **Impacto**: Acesso não autorizado a informações médicas em dispositivos compartilhados
   - **Controle Atual**: Aplicação cliente-side sem backend; dados permanecem no dispositivo
   - **Recomendação**: Para produção, implementar:
     - Criptografia de dados sensíveis antes do armazenamento
     - Autenticação e autorização (RBAC)
     - Backend seguro com validação de entrada
     - Logs estruturados sem PII

2. **Validação de Entrada**
   - **Risco**: Falta de validação robusta em formulários pode permitir injeção de dados maliciosos
   - **Controle Atual**: Validação básica no frontend
   - **Recomendação**: Implementar validação server-side e sanitização de dados

3. **Dependências**
   - **Status**: Versões fixas no `package.json` (sem auto-update)
   - **Ação**: Revisar periodicamente vulnerabilidades conhecidas (CVE) e atualizar via PR com testes

4. **Exportação/Importação Excel**
   - **Risco**: Arquivos Excel podem conter dados maliciosos ou scripts
   - **Controle Atual**: Processamento via biblioteca `xlsx`
   - **Recomendação**: Validar estrutura e conteúdo dos arquivos antes do processamento

5. **Notificações do Navegador**
   - **Status**: Solicita permissão do usuário antes de exibir notificações
   - **Controle**: Implementado conforme boas práticas

6. **PWA (Progressive Web App)**
   - **Status**: Configurado com manifest e service worker
   - **Recomendação**: Implementar HTTPS obrigatório em produção

### Checklist de Segurança para Deploy

- [ ] Implementar autenticação e autorização (RBAC)
- [ ] Criptografar dados sensíveis antes do armazenamento
- [ ] Configurar HTTPS obrigatório
- [ ] Implementar validação server-side
- [ ] Configurar Content Security Policy (CSP)
- [ ] Revisar e atualizar dependências vulneráveis
- [ ] Implementar logs estruturados sem PII
- [ ] Configurar ambiente de staging para testes
- [ ] Realizar varredura OWASP Top 10
- [ ] Documentar procedimentos de rollback

## 📚 Dependências

### Produção
- `react` ^19.2.0
- `react-dom` ^19.2.0
- `react-router-dom` ^7.10.1
- `date-fns` ^4.1.0
- `lucide-react` ^0.560.0
- `uuid` ^13.0.0
- `vite-plugin-pwa` ^1.2.0
- `xlsx` ^0.18.5

### Desenvolvimento
- `@vitejs/plugin-react` ^5.1.1
- `vite` (rolldown-vite) 7.2.5
- `eslint` ^9.39.1
- `@eslint/js` ^9.39.1
- `eslint-plugin-react-hooks` ^7.0.1
- `eslint-plugin-react-refresh` ^0.4.24
- `@types/react` ^19.2.5
- `@types/react-dom` ^19.2.3
- `globals` ^16.5.0

## 📝 Licença

Este projeto é privado e confidencial.

## 👥 Contribuindo

Para contribuições, abra uma issue ou pull request seguindo os padrões de segurança documentados.

---

**Versão**: 1.3.0  
**Última Atualização**: 13-12-2025

### Changelog

#### v1.3.0 (13-12-2025)
- ✨ Adicionado módulo completo de Psicoterapia (TCC)
- ✨ Novo: Registro ABC (Antecedente, Comportamento, Consequência)
- ✨ Novo: Cartões de Enfrentamento
- ✨ Melhorias no Dashboard com novos componentes visuais
- ✨ Gráficos avançados na página de Progresso
- 🔄 Renomeado "Médicos" para "Especialistas"
- 🎨 Novos componentes: ActivityItem, MeasurementChart, SymptomItem
- 🐛 Correções e melhorias de UX

#### v1.2.0 (12-12-2025)
- ✨ Adicionado módulo de Psicoterapia com Frequência de Hábitos e RPD
- ✨ Melhorias no rastreamento de sintomas (5 níveis de humor)
- 🎨 Interface aprimorada
