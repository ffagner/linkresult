# LinkResults — Contexto Completo do Projeto

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite 6 + TypeScript (strict gradual) |
| Estilização | Tailwind CSS v3 + shadcn/ui + Lucide React |
| Autenticação | Firebase Auth (email/senha) |
| Banco de dados | Firebase Firestore |
| Hospedagem | Firebase Hosting (plano Spark) |
| Encriptação | Web Crypto API (AES-GCM 256) |
| Ícones | Lucide React |
| SDKs removidos | Base44 (era o SDK original, substituído por Firebase) |

## Scripts (package.json)

```json
{
  "dev": "vite",
  "build": "vite build",
  "typecheck": "tsc --noEmit",
  "lint": "eslint . --quiet",
  "preview": "vite preview"
}
```

## Estrutura de Pastas

```
src/
├── api/                    # Camada de acesso ao Firestore
│   ├── municipios.ts       # CRUD municípios
│   ├── avaliacoes.ts       # CRUD avaliações
│   ├── series.ts           # CRUD séries
│   ├── relatorios.ts       # CRUD + lote + liberar + listarPorMunicipio
│   └── usuarios.ts         # CRUD usuários (com createUserWithEmailAndPassword)
├── components/
│   ├── ui/                 # shadcn/ui (48 componentes, auto-gerados)
│   ├── lr/                 # LinkResults específicos
│   │   ├── AppLayout.tsx   # Layout com sidebar + header (role-based)
│   │   ├── DataTable.tsx   # Tabela genérica com loading/empty
│   │   ├── FormModal.tsx   # Modal para formulários
│   │   ├── ConfirmDialog.tsx # Diálogo de confirmação
│   │   ├── StatusBadge.tsx # Badge de status (liberado/pendente/role)
│   │   ├── StatsCard.tsx   # Card de estatística
│   │   ├── PageHeader.tsx  # Cabeçalho de página com ações
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   └── Logo.tsx
│   ├── AuthLayout.tsx      # Layout para páginas de auth
│   ├── ProtectedRoute.tsx  # Guard de rota por role
│   └── ScrollToTop.tsx
├── hooks/
│   ├── use-toast.ts        # Re-export do shadcn toast
│   └── use-mobile.tsx
├── lib/
│   ├── firebase.ts         # Inicialização do Firebase
│   ├── AuthContext.tsx     # Contexto de autenticação (Firebase Auth + Firestore profile)
│   ├── crypto.ts           # AES-GCM encrypt/decrypt para links
│   ├── utils.ts            # Utilitário cn() do shadcn
│   ├── query-client.ts     # TanStack Query client
│   ├── mockData.ts         # Dados mock (não usado mais, manter apenas estadosBrasileiros)
│   └── app-params.ts       # Parâmetros de app
├── pages/
│   ├── Login.tsx           # Login com Firebase Auth
│   ├── Home.tsx            # Raiz "/" — redireciona por role
│   ├── RecuperarSenha.tsx  # Formulário de recuperação
│   ├── ForgotPassword.tsx  # Envio de email de reset
│   ├── ResetPassword.tsx   # Reset via token
│   ├── Register.tsx        # Auto-cadastro (role: municipio)
│   ├── MeuPerfil.tsx       # Perfil + alterar senha
│   ├── NotFound.tsx        # 404
│   ├── AcessoNegado.tsx    # 403
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminMunicipios.tsx
│   │   ├── AdminAvaliacoes.tsx
│   │   ├── AdminSeries.tsx
│   │   ├── AdminRelatorios.tsx
│   │   ├── AdminRelatoriosLote.tsx
│   │   ├── AdminUsuarios.tsx
│   │   └── AdminReportViewer.tsx
│   ├── pedagogico/
│   │   ├── PedagogicoDashboard.tsx
│   │   ├── PedagogicoRelatorios.tsx
│   │   └── PedagogicoReportViewer.tsx
│   └── municipio/
│       ├── MunicipioRelatorios.tsx
│       └── MunicipioReportViewer.tsx
├── App.tsx                 # Rotas com AuthProvider + ProtectedRoute
├── main.tsx                # Entry point
├── index.css               # Tailwind + CSS variables (shadcn theme)
├── vite-env.d.ts           # Tipos Vite
└── shadcn-types.d.ts       # Declarações de tipos para shadcn/ui
```

## Firebase

### Config (src/lib/firebase.ts)
Usa variáveis de ambiente `VITE_FIREBASE_*` do `.env`.

```ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// lê de import.meta.env.VITE_FIREBASE_...
```

### Coleções Firestore

**municipios/{id}**
```
nome: string, estado: string, createdAt: timestamp
```

**avaliacoes/{id}**
```
nome: string, ano: number, createdAt: timestamp
```

**series/{id}**
```
nome: string, ordem: number
```

**relatorios/{id}**
```
municipioId: string, municipioNome: string,
avaliacaoId: string, avaliacaoNome: string,
serieId: string, serieNome: string,
linkEncriptado: string (AES-GCM),
liberado: boolean, liberadoEm: timestamp | null, liberadoPor: string | null,
createdAt: timestamp, updatedAt: timestamp
```

**users/{uid}**
```
nome: string, email: string,
role: 'admin' | 'pedagogico' | 'municipio',
municipioId: string | null, municipioNome: string | null,
status: 'ativo' | 'inativo', createdAt: timestamp
```

### Security Rules (firestore.rules)
- Admin: write total em todas as coleções
- Pedagógico: read relatorios, update apenas `liberado/liberadoEm/liberadoPor`
- Município: read apenas relatorios onde `municipioId == seuId && liberado == true`
- Users: cada um lê o próprio, admin lê todos, admin escreve

### Índices
- `relatorios`: `municipioId ASC, liberado ASC` (composto)

## Autenticação (src/lib/AuthContext.tsx)

```ts
interface AuthContextValue {
  user: User | null           // Firebase User
  profile: Record<string, any> | null  // Documento users/{uid}
  loading: boolean
  logout: () => Promise<void>
}
```

- `onAuthStateChanged` escuta mudanças no Firebase Auth
- `onSnapshot` escuta o documento `users/{uid}` em tempo real
- `ProtectedRoute` verifica autenticação + role e redireciona

## Rotas e Perfis

| Rota | Perfil | Descrição |
|---|---|---|
| `/` | Público | Redireciona por role (Home.tsx) |
| `/login` | Público | Login |
| `/recuperar-senha` | Público | Recuperação |
| `/perfil` | Autenticados | Meu perfil |
| `/acesso-negado` | Autenticados | 403 |
| `/admin/*` | Admin | Dashboard, CRUDs |
| `/pedagogico/*` | Pedagógico | Dashboard, Relatórios, Liberação |
| `/municipio/*` | Município | Meus relatórios, Visualização |
| `*` | Todos | 404 |

## Regras de Toast (notificações)

- `variant: 'create'` → verde
- `variant: 'edit'` → azul
- `variant: 'delete'` → laranja
- `variant: 'destructive'` → vermelho (erro)
- `TOAST_REMOVE_DELAY = 4000` (4 segundos)
- ToastProvider → ToastViewport → Toast (children dentro do viewport)

## Encriptação de Links (src/lib/crypto.ts)

- Algoritmo: AES-GCM 256 bits
- Chave: `VITE_CRYPTO_KEY` no .env (base64 de 32 bytes)
- Fluxo: Admin cadastra → frontend encripta → salva `linkEncriptado` → Município acessa → descriptografa em memória → injeta no iframe
- Link descriptografado nunca vai para o DOM visível

## Layout (src/components/lr/AppLayout.tsx)

- Sidebar fixa 64px esquerda (role-based navigation)
- Header com nome do usuário + logout
- Main content com max-w-7xl
- Mobile: sidebar overlay + backdrop
- Logout faz `signOut(auth)` + navigate('/login')

## Componentes UI (shadcn/ui)

- 48 componentes auto-gerados em `src/components/ui/`
- `// @ts-nocheck` adicionado em cada um (são boilerplate)
- Tipos declarados em `src/shadcn-types.d.ts` para os mais usados (Button, Input, Select, etc.)
- Estilização via `tailwind.config.js` com CSS variables

## Usuários Criados no Firebase

| Perfil | Email | Senha |
|---|---|---|
| Admin | admin@linkresults.com | 123456 |
| Pedagógico | pedagogico@linkresults.com | 123456 |
| Município | municipio@linkresults.com | 123456 |

## Dados Iniciais Semeados

- 8 municípios (Fortaleza, Sobral, Juazeiro do Norte, Caucaia, Maracanaú, Crato, Iguatu, Quixadá — todos CE)
- 5 avaliações (CADERNO 1/2/3, SPAECE 2025, SAEB 2024)
- 10 séries (Educação Infantil ao 9º ano)
- Usuário município vinculado ao primeiro município

## URLs

- **Produção:** https://linkresult.web.app
- **Console Firebase:** https://console.firebase.google.com/project/linkresult/overview
- **Chave de serviço:** `AccountKey/linkresult-firebase-adminsdk-fbsvc-7b7b31f9d9.json`

## Commits Recentes

```
13f03f5 fix: toast auto-dismiss (4s) and add create/edit/delete color variants
b6792da fix: toast auto-dismiss now schedules remove queue, close button calls dismiss
9b47f3c fix: toast useToast dependency array, ToastProvider positioning, index.html cleanup
fa3a1db fix: toast rendering inside viewport with z-[9999]
05aefb7 feat: connect all pages to Firestore real data, replace mockCurrentUser with useAuth
2c56afb chore: seed initial data, add Firestore index, fix logout, deploy to Firebase Hosting
9f35d2a chore: remove all Base44 references, migrate Register and ForgotPassword to Firebase Auth
030b909 feat: integrate Firebase Auth, replace Base44 SDK, add ProtectedRoute and Home redirect
01f911a feat: migrate entire project from JS to TypeScript (99 files renamed)
<latest> feat: add TypeScript types to all components, hooks, API files — zero type errors
```

## Config do opencode (MCP)

```json
{
  "stitch": { "type": "remote", "url": "https://stitch.googleapis.com/mcp", "headers": { "X-Goog-Api-Key": "..." } },
  "firebase": { "type": "local", "command": ["npx", "-y", "@gannonh/firebase-mcp"], "env": { "SERVICE_ACCOUNT_KEY_PATH": "...", "FIREBASE_STORAGE_BUCKET": "linkresult.firebasestorage.app" } }
}
```
