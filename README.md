# 🔥 FireChain Backend

Backend seguro, assíncrono e em tempo real da **FireChain**, construído com **Firebase Realtime Database**, **Node.js** e proteção contra abusos de requisições (antiflood).

> ✅ Ideal para perfis descentralizados com foco em segurança, privacidade e resposta em tempo real.

---

## 🚀 Tecnologias Utilizadas

- **Node.js** (ESModules)
- **Firebase Admin SDK**
- **Realtime Database (RTDB)**
- **chalk** para logs estilizados
- **Proteção antiflood** embutida
- **Autenticação via Firebase**

---

## ⚙️ Como executar localmente

### 1. Clone o repositório:

git clone https://github.com/seunome/firechain-backend.git
cd firechain-backend

2. Instale as dependências:
npm install

3. Configure o Firebase Admin:
Coloque seu arquivo AccountService.json (baixado do Firebase) na raiz do projeto.

⚠️ Esse arquivo está no .gitignore por segurança. Nunca compartilhe ele publicamente.

4. Execute:
Modo normal:
npm start

Modo desenvolvimento (auto-restart com nodemon):
npm run dev

🔒 Segurança embutida
Cada usuário só pode acessar e ler seus próprios dados.

Escrita só é permitida no nó requests.

O backend processa requisições via child_added e envia respostas automáticas.

Respostas expiram em 15 segundos.

Proteção antiflood: limite de requisições por tempo com resposta única em caso de abuso.

📁 Estrutura do Projeto
firechain-backend/
│
├── backend.js           # Core do servidor em Node.js
├── package.json         # Dependências e scripts
├── .gitignore           # Protege arquivos sensíveis
├── AccountService.json  # 🔐 Credencial privada (NÃO subir no GitHub)
└── README.md            # Este arquivo :)

✨ Créditos
Desenvolvido por Guilherme Lima
Contato: em breve...

🛡️ Licença
Este projeto está licenciado sob a MIT License.