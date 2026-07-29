Markdown
# 🐺 Winterforge / Cyber Wolf - Workout Platform

Plataforma web moderna e interativa para gerenciamento de fichas de treino, acompanhamento de rotinas de musculação e execução de exercícios em tempo real.

O sistema conta com autenticação de usuários, temporizador de descanso integrado, visualização de GIFs explicativos de exercícios e personalização de fichas.

---

## 🚀 Funcionalidades Principais

- 🔐 **Autenticação de Usuários:** Cadastro, Login, controle de sessão via JWT e rotas protegidas (`ProtectedRoute`).
- 🏋️‍♂️ **Gerenciamento de Fichas de Treino:** Criação, exclusão e acompanhamento de fichas com métricas de séries, repetições e grupos musculares.
- ✅ **Checklist de Treino Ativo:** Marcação dinâmica de exercícios concluídos em tempo real.
- ⏱️ **Temporizador de Descanso (`RestTimer`):** Widget flutuante com contagem regressiva, alertas sonoros e presets de tempo (30s, 60s, 90s).
- 🎬 **Modal de Exercícios (`ExercicioModal`):** Exibição dinâmica de detalhes e GIFs demonstrativos dos movimentos através da integração com API externa.
- 👤 **Gestão de Perfil:** Atualização de dados pessoais e personalização do atleta.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Roteamento:** [React Router](https://reactrouter.com/)
- **Estilização:** CSS3 (Variáveis customizadas e design responsivo)
- **Linter & Padronização:** ESLint

---

## 📁 Estrutura do Projeto

```text
src/
├── assets/          # Imagens, ícones e recursos estáticos
├── Components/      # Componentes reutilizáveis do sistema
│   ├── Cards/
│   ├── ExercicioModal/
│   ├── FichaTreino/
│   ├── Filtros/
│   ├── ProtectedRoute/
│   └── RestTimer/
├── Context/         # Contextos globais (ex: AuthContext)
├── Hooks/           # Custom Hooks (ex: useTreinos)
├── Pages/           # Páginas principais da aplicação
│   ├── Exercicios/
│   ├── Login/
│   ├── Perfil/
│   └── SingUp/
├── Services/        # Comunicação com APIs e consumo de dados
│   ├── authApi.ts
│   ├── authService.ts
│   ├── exercicioAdapter.ts
│   ├── exercicioService.ts
│   └── treinoService.ts
├── types/           # Definições de interfaces e tipos TypeScript
│   └── exercicio.ts
├── App.tsx          # Componente raiz e definição de rotas
└── main.tsx         # Ponto de entrada da aplicação React
⚙️ Como Executar o Projeto Localmente
Pré-requisitos
Node.js (versão 18 ou superior)

Gerenciador de pacotes npm ou yarn

Passo a Passo
Clone o repositório:

Bash
git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
cd seu-repositorio
Instale as dependências:

Bash
npm install
Configure as Variáveis de Ambiente:
Crie um arquivo .env na raiz do projeto baseado nas definições de endpoint da API:

Snippet de código
VITE_API_URL=http://localhost:5000/api
Inicie o servidor de desenvolvimento:

Bash
npm run dev
Acesse a aplicação:
Abra o seu navegador e acesse http://localhost:5173.

📜 Scripts Disponíveis
No diretório do projeto, você pode executar:

npm run dev: Inicia o servidor de desenvolvimento do Vite.

npm run build: Compila a aplicação para produção na pasta dist.

npm run lint: Executa a verificação do ESLint para encontrar erros no código.

npm run preview: Visualiza a versão de compilação de produção localmente.

👨‍💻 Desenvolvedor
Desenvolvido por José Mário 👋