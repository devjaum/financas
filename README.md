#  DevJaum Finanças

> Um dashboard de controle financeiro pessoal simples, performático e totalmente responsivo.

![Badge Status](https://img.shields.io/badge/STATUS-CONCLUÍDO-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Demonstração

<div style="display: flex; gap: 16px;">
  <img width="450"  alt="Inicio" src="https://github.com/user-attachments/assets/4f56cec9-3ee0-4ecd-8756-475f1406f791" />
  <img width="450" alt="Add/Remover" src="https://github.com/user-attachments/assets/121f115b-3c44-496c-9e49-cbda0f284b64" />
</div>

> Acesse [Devjaum Financas](https://devjaum.github.io/financas/)

##  Sobre o Projeto

Este projeto foi desenvolvido com o objetivo de criar uma ferramenta prática para gestão financeira pessoal, focando na experiência do usuário e na persistência de dados local (**LocalStorage**), sem necessidade de backend.

O foco principal do desenvolvimento foi a aplicação de **Clean Code**, arquitetura de componentes e uso avançado de **React Hooks** e **Context API**.

##  Funcionalidades

- **Dashboard Interativo**: Visão geral de saldo, entradas e saídas.
- **Tema Claro/Escuro**: Alternância de temas via Context API e CSS Variables.
- **Gráficos Dinâmicos**: Visualização de gastos mensais com Chart.js.
- **Gestão de Transações**:
  - Adicionar, Editar e Excluir movimentações.
  - Filtros por **Mês** e **Tipo** (Receita/Despesa).
  - Categorização automática.
- **Relatório Anual**: Projeção de saúde financeira baseada na média real de gastos e ganhos.
- **Persistência**: Todos os dados são salvos automaticamente no navegador do usuário.

##  Tecnologias Utilizadas

- **React.js**: Biblioteca principal de UI.
- **TypeScript**: Para tipagem estática e segurança do código.
- **Chart.js**: Para renderização de gráficos.
- **Context API**: Gerenciamento de estado global (Temas).
- **CSS Modules/Variables**: Estilização nativa e performática (sem bibliotecas pesadas).
- **LocalStorage**: "Banco de dados" no front-end.

##  Como Rodar o Projeto

Pré-requisitos: Node.js instalado.

```bash
# 1. Clone o repositório
git clone https://github.com/devjaum/financas

# 2. Entre na pasta do projeto
cd devjaum-financas

# 3. Instale as dependências
npm install

# 4. Rode o servidor de desenvolvimento
npm start
```
> O projeto abrirá automaticamente em http://localhost:3000.

##  Aprendizados e Destaques Técnicos

Principais desafios técnicos e decisões de arquitetura que adotei:

* **Arquitetura:** Separação de regras de negócio (`src/utils/finance.ts`) da camada de visualização (Componentes), facilitando testes e manutenção.
* **Custom Hooks & Context:** Implementação de um `ThemeProvider` para gerenciar o estado global de aparência da aplicação de forma limpa.
* **Lógica Financeira:** Algoritmos para projeção anual baseados na média ponderada das transações reais, e não apenas em valores fixos.
* **UX/UI:** Feedback visual imediato para o usuário (cores semânticas para erro/sucesso) e design responsivo.

##  Estrutura de Pastas
```text
src/
├── components/    # Componentes reutilizáveis (Dashboard, Modal, etc)
├── contexts/      # Gerenciamento de estado global (ThemeContext)
├── styles/        # Estilos CSS modularizados e globais
├── utils/         # Funções puras e regras de negócio (Cálculos Financeiros)
└── App.tsx        # Ponto de entrada da aplicação
```
