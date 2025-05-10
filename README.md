# 🔥 FireChain – Backend + Frontend Reativo, Seguro e Didático

Este repositório reúne **a nova arquitetura completa da FireChain**, combinando:

- 🔁 Backend reativo com escuta única e antiflood inteligente
- 💻 Frontend modular e funcional para criação e gerenciamento de perfis
- 🧠 Estrutura ideal para estudo, inspiração ou uso direto em sistemas reais

> 🧩 Serve como case real de projeto escalável, seguro e moderno com Firebase Realtime Database, Node.js e autenticação nativa.

---

## 🚀 Visão Geral

A arquitetura FireChain foi projetada para **segurança, performance e privacidade**. Tudo funciona **em tempo real**, com controle individual por usuário, sem depender de IPs públicos, servidores web ou sockets.

✔️ Backend escuta *uma única rota global* (`requests/{uid_reqId}`)  
✔️ Frontend envia ações com UID autenticado e recebe resposta em tempo real  
✔️ As respostas expiram após 15 segundos (cache zero, escalabilidade máxima)

---

## 📦 O que esse projeto entrega?

### Backend:
- 🔐 Autenticação via Firebase Admin SDK
- 🧠 Processamento de ações: criar, ver e atualizar perfil
- 🚫 Antiflood (5 requisições por 10s por UID)
- 🔄 Expiração automática de respostas
- 🧼 Limpeza inicial de requests/responses órfãos
- 📁 Estrutura totalmente modular

### Frontend:
- ⚙️ Interface de autenticação (email/senha)
- 👤 Gestão de perfil com nome e bio (opcional)
- 📲 Requisições seguras com UID embutido
- 🔔 Feedback em tempo real via toasts
- 🔍 Exibição de dados com datas formatadas
- 🔄 Compatível 100% com o backend v2

---

## 🧠 Casos de Uso Possíveis

- 📡 Dashboards reativos que buscam dados via RTDB
- 🤖 Bots que escutam comandos privados
- 🛰️ Microserviços atrás de NAT/firewall
- 💼 Gerenciamento de perfis ou identidades digitais
- 📚 Projetos de estudo para backend seguro em Firebase

---

## 🧱 Estrutura do Projeto

```
firechain-backend/
│
├── src/
│   ├── backend.js              # Ponto de entrada do backend
│   ├── handlers/               # Ações de perfil
│   ├── lib/                    # Antiflood, firebase init, sanitização
│   └── cleanup/                # Limpeza de dados antigos
│
├── rules/firebase.rules.json   # Segurança de RTDB
├── public/
│   ├── index.html              # Interface HTML principal
│   └── frontend.js             # Lógica JS compatível com o backend v2
├── package.json
└── README.md                   # Este arquivo
```

---

## ⚙️ Como Rodar

### 1. Clonar e instalar

```bash
git clone https://github.com/firechainmainnet/2.0.0_blockchain_firechain.git
cd 2.0.0_blockchain_firechain
npm install
```

### 2. Colocar o arquivo do Firebase

Adicione `AccountService.json` (credencial do Admin SDK) na raiz.

### 3. Iniciar o backend

```bash
npm start
```

### 4. Abrir o frontend

Abra o arquivo `public/index.html` no navegador.

---

## 🔒 Segurança Embutida

| Recurso                         | Descrição                                                      |
|----------------------------------|------------------------------------------------------------------|
| Escrita controlada em `requests/`| Apenas o próprio UID pode escrever requisições                  |
| Leitura limitada de `responses/`| Somente o dono pode ler a resposta                              |
| Antiflood por usuário           | Máx. 5 requisições por 10s, com apenas 1 resposta de erro       |
| Sanitização de entradas         | Nome e bio limpos de HTML, SQL ou scripts                       |
| Expiração automática            | Respostas são removidas após 15s                                |

---

## 🧠 Ações Suportadas

- `criar_perfil` — Cria perfil com nome
- `ver_perfil` — Retorna nome, bio, timestamps
- `atualizar_perfil` — Atualiza nome e bio (limitada a 200 caracteres)

---

## ✨ Por que esse projeto é especial?

- ✅ Escuta única, leve e escalável (ideal para muitos usuários)
- 📦 Modularizado por responsabilidade (clean code)
- 📊 Ideal como case de arquitetura em tempo real segura
- 🔌 Pode ser usado como base para bots, dashboards, DApps ou SaaS privados
- 💡 Perfeito para ensinar arquitetura Firebase + Node moderna

---

## 🛡️ Licença

MIT — Desenvolvido com por **Guilherme Lima**

---
