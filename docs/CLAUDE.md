# CLAUDE.md — LinkResults

> Documento de referência para agentes de IA que trabalham neste projeto.
> Leia este arquivo integralmente antes de qualquer ação.

---

## 1. Visão Geral

**LinkResults** é uma plataforma web desenvolvida pela **Tendência Consultoria Educacional** para centralizar e controlar o acesso a relatórios educacionais do Power BI por parte de municípios parceiros.

O sistema substitui o fluxo manual de geração de arquivos `.docx` e gerenciamento de Linktree, oferecendo uma experiência controlada, segura e escalável para três perfis de usuário distintos.

### Problema que resolve
- Eliminação da geração manual de ~1.620 arquivos .docx/ano
- Substituição do Linktree por ambiente próprio e controlado
- Controle de liberação de relatórios pelo pedagógico antes de disponibilizar ao município
- Ocultação dos links reais do Power BI dos usuários municipais

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript + Vite |
| Estilização | Tailwind CSS v4 (plugin oficial `@tailwindcss/vite`) |
| Autenticação | Firebase Auth |
| Banco de dados | Firebase Firestore |
| Hospedagem | Firebase Hosting (plano Spark — gratuito) |
| Visualização de relatórios | Iframe embutido (Opção C — página intermediária) |
| Encriptação dos links | Web Crypto API (nativa do browser) |

> ⚠️ O projeto utiliza exclusivamente o **plano Spark (gratuito)** do Firebase.
> **Não usar Cloud Functions** — nenhuma funcionalidade deve depender delas.

### Convenções de código
- Arquitetura: **Feature-Sliced Design (FSD)**
- Componentes: funcionais com hooks
- Tipagem: estrita (`strict: true` no tsconfig)
- Variáveis de ambiente: prefixo `VITE_`
- Sem `any` — sempre tipar explicitamente
- **Tailwind v4**: usar o plugin `@tailwindcss/vite` + `@import "tailwindcss";` no CSS. **NÃO** existe `tailwind.config.js` por padrão no v4, nem o comando `npx tailwindcss init` (fluxo v3, descontinuado). Customizações via CSS (`@theme`).
- **Datas**: os tipos do domínio usam `Date` nativo. A conversão `Timestamp → Date` (Firestore) acontece exclusivamente na camada de mapeamento (`api/`) de cada entidade — nunca espalhar `Timestamp` do Firebase pelo restante da aplicação.

---

## 3. Perfis de Usuário

### 3.1 Admin
- Representa a equipe da Tendência Consultoria Educacional
- **Pode:** cadastrar, editar, excluir e atualizar municípios, avaliações, séries e links
- **Pode:** gerenciar usuários de todos os perfis
- **Vê:** todos os dados do sistema, incluindo links descriptografados

### 3.2 Pedagógico
- Técnico responsável pela análise dos relatórios
- **Pode:** visualizar todos os relatórios cadastrados pelo Admin
- **Pode:** liberar ou revogar o acesso de um relatório para o município
- **Pode:** visualizar os relatórios via iframe
- **Não pode:** cadastrar, editar ou excluir dados

### 3.3 Município
- Secretaria ou gestor municipal
- **Pode:** visualizar apenas os relatórios **liberados** para o seu município
- **Vê:** botão "Ver Relatório" que abre página intermediária com iframe do Power BI
- **Não vê:** o link real do Power BI em nenhum momento
- Cada município possui login próprio e acesso isolado via Security Rules

---

## 4. Modelagem do Banco de Dados (Firestore)

### Estrutura de coleções (flat — sem subcoleções)

> **Nota sobre datas:** os campos `timestamp` abaixo são `Timestamp` do Firestore no banco, mas são convertidos para `Date` nativo na camada de mapeamento (`api/`) antes de chegarem ao domínio. Os tipos TypeScript (seção do prompt / `shared/types`) usam `Date`.

#### Coleção: `municipios`
```
municipios/{municipioId}
  nome:       string
  estado:     string
  createdAt:  timestamp
```

#### Coleção: `avaliacoes`
```
avaliacoes/{avaliacaoId}
  nome:       string   // Ex: "CADERNO 1", "SPAECE 2025", "SAEB"
  ano:        number
  createdAt:  timestamp
```

#### Coleção: `series`
```
series/{serieId}
  nome:       string   // Ex: "Educação Infantil", "1º ano", ..., "9º ano"
  ordem:      number   // Para ordenação na exibição
```

#### Coleção: `relatorios`
```
relatorios/{relatorioId}
  municipioId:      string (ref → municipios)
  avaliacaoId:      string (ref → avaliacoes)
  serieId:          string (ref → series)
  linkEncriptado:   string  // Link do Power BI encriptado via Web Crypto API
  liberado:         boolean (default: false)
  liberadoEm:       timestamp | null
  liberadoPor:      string (uid do pedagógico) | null
  createdAt:        timestamp
  updatedAt:        timestamp
```

#### Coleção: `users`
```
users/{uid}
  nome:         string
  email:        string
  role:         'admin' | 'pedagogico' | 'municipio'
  municipioId:  string | null  // null para admin e pedagógico
  createdAt:    timestamp
```

---

## 5. Encriptação dos Links (Web Crypto API)

Os links do Power BI são encriptados antes de serem salvos no Firestore, usando a **Web Crypto API nativa** — sem bibliotecas externas.

### Algoritmo: AES-GCM (256 bits)

```typescript
// src/shared/lib/crypto.ts

const CRYPTO_KEY = import.meta.env.VITE_CRYPTO_KEY // base64 de 32 bytes

async function getKey(): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(CRYPTO_KEY), c => c.charCodeAt(0))
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function encryptLink(link: string): Promise<string> {
  const key = await getKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(link)
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  // Retorna iv + encrypted em base64
  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.byteLength)
  return btoa(String.fromCharCode(...combined))
}

export async function decryptLink(encryptedBase64: string): Promise<string> {
  const key = await getKey()
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const encrypted = combined.slice(12)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)
  return new TextDecoder().decode(decrypted)
}
```

### Fluxo de encriptação
1. **Admin cadastra o link** → frontend encripta → salva `linkEncriptado` no Firestore
2. **Município acessa** → frontend busca `linkEncriptado` → descriptografa em memória → injeta no `src` do iframe
3. O link descriptografado **nunca é exibido na tela** — vai direto para o iframe
4. Mesmo inspecionando o Firestore via DevTools, o usuário vê apenas o texto cifrado

### ⚠️ Limitação conhecida
A chave `VITE_CRYPTO_KEY` fica no bundle do frontend — um desenvolvedor experiente poderia localizá-la. Para o contexto de uso (usuários não técnicos, sistema educacional interno), essa proteção é considerada suficiente no MVP.

---

## 6. Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isPedagogico() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'pedagogico';
    }

    function isMunicipio() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'municipio';
    }

    function getMunicipioId() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.municipioId;
    }

    // Municípios, avaliações e séries: admin escreve, todos leem
    match /municipios/{id} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    match /avaliacoes/{id} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    match /series/{id} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Relatórios
    // IMPORTANTE: regras com o mesmo método (read/write) se SOMAM (lógica OR).
    // O admin tem read+write totais; pedagógico e município adicionam permissões
    // de read/update mais restritas que coexistem com a do admin.
    match /relatorios/{id} {
      // Admin: acesso total
      allow read, write: if isAdmin();

      // Pedagógico: lê tudo, atualiza apenas liberado/liberadoEm/liberadoPor
      allow read: if isPedagogico();
      allow update: if isPedagogico()
        && request.resource.data.diff(resource.data).affectedKeys()
            .hasOnly(['liberado', 'liberadoEm', 'liberadoPor']);

      // Município: lê apenas os seus relatórios liberados
      allow read: if isMunicipio()
        && resource.data.municipioId == getMunicipioId()
        && resource.data.liberado == true;
    }

    // Users: admin gerencia todos, cada um lê o próprio
    match /users/{uid} {
      allow read: if request.auth.uid == uid || isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

---

## 7. Fluxo de Navegação

```
/login                        → Tela de login (todos os perfis)

/admin
  /admin/municipios           → CRUD de municípios
  /admin/avaliacoes           → CRUD de avaliações
  /admin/series               → CRUD de séries
  /admin/relatorios           → CRUD de relatórios (cadastro de links)
  /admin/usuarios             → Gerenciamento de usuários

/pedagogico
  /pedagogico/relatorios      → Lista de relatórios com botão "Liberar / Revogar"
  /pedagogico/relatorio/:id   → Visualização do relatório (iframe)

/municipio
  /municipio/relatorios       → Lista de relatórios liberados para o município
  /municipio/relatorio/:id    → Página intermediária com iframe do Power BI
```

### Redirecionamento por role
- Após login, o sistema lê o `role` do documento `users/{uid}` e redireciona para a rota correta
- Rotas protegidas por `PrivateRoute` que verifica autenticação + role

---

## 8. Exibição dos Relatórios (Opção C — Página Intermediária)

Quando o usuário clica em "Ver Relatório":

1. É redirecionado para `/[perfil]/relatorio/:id`
2. O frontend busca o documento `relatorios/{id}` no Firestore
3. O campo `linkEncriptado` é descriptografado em memória via Web Crypto API
4. A página exibe um **iframe em tela cheia** com o link descriptografado no `src`
5. O link nunca aparece visível na interface

### Cabeçalho da página intermediária
- Logo do LinkResults
- Nome do município
- Nome da avaliação + série
- Botão "← Voltar"

---

## 9. Funcionalidades por Perfil

### Admin
- [ ] Login / logout
- [ ] CRUD de Municípios (nome, estado)
- [ ] CRUD de Avaliações (nome, ano)
- [ ] CRUD de Séries (nome, ordem)
- [ ] CRUD de Relatórios (associar município + avaliação + série + link)
- [ ] Cadastro em lote (mesmo município + avaliação, múltiplas séries)
- [ ] Gerenciamento de usuários (criar, editar, desativar)
- [ ] Painel de status de liberação por município

### Pedagógico
- [ ] Login / logout
- [ ] Listagem de relatórios com filtros (município, avaliação, série, status)
- [ ] Visualização do relatório via iframe
- [ ] Liberar relatório para o município
- [ ] Revogar acesso ao relatório

### Município
- [ ] Login / logout
- [ ] Listagem de relatórios liberados (filtrados por avaliação e série)
- [ ] Visualização via página intermediária com iframe
- [ ] Sem acesso ao link real em nenhum momento

---

## 10. Prioridades de Desenvolvimento (MVP)

**Fase 1 — Base**
1. Setup do projeto (Vite + React + TS + Tailwind + Firebase)
2. Configuração do Firebase Auth + Firestore + Hosting
3. Coleção `users` com roles e redirecionamento por perfil
4. Utilitário de encriptação/descriptografia (`src/shared/lib/crypto.ts`)

**Fase 2 — Admin**
5. CRUD de Municípios
6. CRUD de Avaliações e Séries
7. CRUD de Relatórios com encriptação do link
8. Cadastro em lote de relatórios
9. Gerenciamento de usuários

**Fase 3 — Pedagógico**
10. Listagem de relatórios com filtros
11. Visualização via iframe
12. Ação de liberar / revogar

**Fase 4 — Município**
13. Listagem de relatórios liberados
14. Página intermediária com iframe protegido

**Fase 5 — Polimento**
15. Responsividade mobile
16. Loading states e feedback visual
17. Filtros avançados e busca

---

## 11. Diretrizes para Agentes de IA

- **Nunca** exibir o valor de `linkEncriptado` descriptografado na interface para o perfil `municipio` — apenas injetar no `src` do iframe
- **Sempre** verificar o `role` antes de renderizar rotas e componentes
- **Sempre** usar Firebase Security Rules como primeira linha de defesa — nunca confiar apenas no frontend
- **Nunca** usar Cloud Functions — o projeto usa o plano Spark (gratuito)
- **Nunca** usar `any` no TypeScript
- **Sempre** criar tipos explícitos para entidades (`Municipio`, `Avaliacao`, `Serie`, `Relatorio`, `UserProfile`)
- **Sempre** converter `Timestamp → Date` na camada `api/` de cada entidade (função de mapeamento `fromFirestore`); o domínio nunca recebe `Timestamp`
- **Tailwind v4**: nunca rodar `npx tailwindcss init` nem criar `tailwind.config.js` — usar o plugin `@tailwindcss/vite` e `@import "tailwindcss";` no CSS
- Seguir a estrutura FSD: `src/features/`, `src/entities/`, `src/shared/`, `src/pages/`
- Componentes de UI reutilizáveis ficam em `src/shared/ui/`
- Cada feature tem sua própria pasta com `api/`, `model/`, `ui/`
- O utilitário de crypto fica em `src/shared/lib/crypto.ts`
- Ao criar Security Rules, sempre testar com o Firebase Emulator

---

## 12. Variáveis de Ambiente

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_CRYPTO_KEY=   # chave AES-GCM em base64 (32 bytes)
```

---

## 13. Contexto do Projeto

- Desenvolvido por **Fagner Martins Farias** (Desenvolvedor Front-end & Analista de Dados)
- Produto da **Tendência Consultoria Educacional**
- Atende municípios parceiros da consultoria (múltiplos estados)
- Substitui fluxo manual de .docx + Linktree
- Projeto irmão: **EduPresença** (`edupresenca-app` — React + Vite + TS + Supabase)
