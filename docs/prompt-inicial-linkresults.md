# Prompt Inicial — LinkResults

Leia o arquivo `CLAUDE.md` integralmente antes de qualquer ação.

## Tarefa: Setup completo do projeto (Fase 1)

Configure o projeto **LinkResults** do zero com a seguinte stack:
- React + TypeScript + Vite
- Tailwind CSS
- Firebase (Auth + Firestore + Hosting)
- Arquitetura Feature-Sliced Design (FSD)

---

### 1. Scaffold do projeto

```bash
npm create vite@latest linkresults -- --template react-ts
cd linkresults
npm install
```

### 2. Instalar dependências

```bash
npm install firebase react-router-dom
npm install -D tailwindcss @tailwindcss/vite
```

> ⚠️ **Tailwind v4** — NÃO rodar `npx tailwindcss init -p` (fluxo v3, descontinuado) e NÃO criar `tailwind.config.js`.

Configuração do Tailwind v4:

**`vite.config.ts`** — adicionar o plugin:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**`src/index.css`** — substituir todo o conteúdo por:
```css
@import "tailwindcss";
```

Customizações de tema (cores, fontes da identidade Tendência) são feitas via `@theme` no próprio CSS, sem arquivo de config.

### 3. Estrutura de pastas (FSD)

Crie a seguinte estrutura em `src/`:

```
src/
  app/
    router/         # Configuração de rotas e PrivateRoute
    providers/      # FirebaseProvider, AuthProvider
  pages/
    login/
    admin/
    pedagogico/
    municipio/
  features/
    auth/           # login, logout, redirecionamento por role
    relatorios/     # CRUD, liberação, visualização
    municipios/
    avaliacoes/
    series/
    usuarios/
  entities/
    relatorio/
    municipio/
    avaliacao/
    serie/
    user/
  shared/
    lib/
      firebase.ts   # inicialização do Firebase
      crypto.ts     # encriptação/descriptografia Web Crypto API
    ui/             # componentes reutilizáveis
    types/          # tipos globais
```

### 4. Tipos globais (`src/shared/types/index.ts`)

Crie os tipos TypeScript para todas as entidades do Firestore. **Os campos de data usam `Date` nativo** — a conversão de `Timestamp` (Firestore) para `Date` é responsabilidade da camada de mapeamento (`api/`) de cada entidade, nunca do domínio.

```typescript
export type Role = 'admin' | 'pedagogico' | 'municipio'

export interface UserProfile {
  uid: string
  nome: string
  email: string
  role: Role
  municipioId: string | null
  createdAt: Date
}

export interface Municipio {
  id: string
  nome: string
  estado: string
  createdAt: Date
}

export interface Avaliacao {
  id: string
  nome: string
  ano: number
  createdAt: Date
}

export interface Serie {
  id: string
  nome: string
  ordem: number
}

export interface Relatorio {
  id: string
  municipioId: string
  avaliacaoId: string
  serieId: string
  linkEncriptado: string
  liberado: boolean
  liberadoEm: Date | null
  liberadoPor: string | null
  createdAt: Date
  updatedAt: Date
}
```

### 5. Firebase (`src/shared/lib/firebase.ts`)

Inicialize o Firebase usando as variáveis de ambiente do `.env`:

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
```

### 6. Crypto (`src/shared/lib/crypto.ts`)

Implemente encriptação/descriptografia AES-GCM com Web Crypto API conforme documentado no CLAUDE.md.

### 7. AuthProvider (`src/app/providers/AuthProvider.tsx`)

Crie um contexto de autenticação que:
- Observe o estado do Firebase Auth (`onAuthStateChanged`)
- Busque o documento `users/{uid}` no Firestore para obter o `role` e `municipioId`
- Exponha: `user`, `profile`, `loading`

### 8. PrivateRoute (`src/app/router/PrivateRoute.tsx`)

Crie um componente que:
- Redireciona para `/login` se não autenticado
- Redireciona para a rota correta conforme o `role` se o usuário tentar acessar rota de outro perfil
- Aceita prop `allowedRoles: Role[]`

### 9. Roteamento (`src/app/router/index.tsx`)

Configure as rotas com React Router DOM (já instalado no passo 2):

```
/login
/admin/*
/pedagogico/*
/municipio/*
```

### 10. Tela de Login (`src/pages/login/`)

Crie a tela de login com:
- Email e senha via Firebase Auth (`signInWithEmailAndPassword`)
- Redirecionamento automático por role após autenticação
- Feedback de erro (credenciais inválidas)
- Design limpo e institucional com identidade visual da Tendência Consultoria

### 11. Arquivo `.env.example`

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_CRYPTO_KEY=
```

> ⚠️ Confirme que `.env` está no `.gitignore` (o Vite já inclui por padrão, mas verifique). A `VITE_CRYPTO_KEY` **não pode** ser commitada.

Para gerar uma chave AES-GCM de 32 bytes em base64:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 12. Arquivo `firebase.json`

Configure o Firebase Hosting apontando para `dist/` com rewrite SPA (essencial para o React Router funcionar em rotas profundas como `/admin/relatorios`):

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

Crie também o arquivo `firestore.rules` com as Security Rules definidas no CLAUDE.md (seção 6).

---

## Resultado esperado

Ao final da Fase 1, o projeto deve:
- Compilar sem erros (`npm run build`)
- Ter a estrutura FSD completa
- Ter autenticação funcionando com redirecionamento por role
- Ter a tela de login operacional
- Estar pronto para iniciar a Fase 2 (CRUD Admin)
