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

### Fluxo de Uso da Aplicação

Ciclo de vida de um relatório, do cadastro ao acompanhamento — os três
perfis entram em pontos diferentes desse mesmo fluxo, nunca de forma isolada:

1. **Setup de base (Admin)** — antes de existir qualquer relatório, precisam
   existir pelo menos um `município` (`/admin/municipios`), uma `avaliação`
   (`/admin/avaliacoes`, ex.: "CADERNO 1") e uma `série` (`/admin/series`,
   ex.: "5º ano"). São os três selects que compõem todo relatório.
2. **Cadastro do relatório (Admin)** — em `/admin/relatorios` (um de cada
   vez) ou `/admin/relatorios/lote` (mesmo município + avaliação + ano, várias
   séries de uma vez — o caso comum de "chegou o resultado do CADERNO 1 de
   todas as séries deste município"). O admin informa o **ano** de referência
   (permite reusar "CADERNO 1" ano após ano sem recadastrar a avaliação) e
   cola o link do Power BI, que é **encriptado no navegador antes de sair
   para o Firestore** (`encryptLink`, seção 5). Nesse momento o relatório
   existe mas `liberado: false` — ninguém do município o vê ainda.
3. **Análise e liberação (Pedagógico)** — em `/pedagogico/relatorios`, o
   pedagógico vê todos os relatórios cadastrados (liberados ou não), confere
   o conteúdo via iframe (`/pedagogico/relatorio/:id`) e decide **Liberar**.
   Isso grava `liberado: true` + `liberadoEm`/`liberadoPor` e — só na
   **primeira** liberação daquele relatório — também `entregueEm` (a data
   "oficial" de entrega, que **nunca** é apagada por uma revogação futura).
   Cada ação (liberar/revogar/ajustar data) fica registrada em `historico`.
   Se a entrega de fato aconteceu antes do clique (ex.: em reunião), o
   pedagógico pode corrigir a data manualmente pelo botão de ajuste.
4. **Consumo (Município)** — o usuário do município só enxerga relatórios
   com `liberado: true` do seu próprio `municipioId` (garantido nas Security
   Rules, não só no frontend). Em `/municipio`, eles aparecem agrupados por
   avaliação + ano num accordion (só uma seção aberta por vez, a mais
   recente por padrão). Ao clicar em "Ver Relatório", o link é descriptografado
   em memória e injetado num iframe em tela cheia — o usuário nunca vê o link
   real — e a abertura é registrada silenciosamente em `acessos` (não
   bloqueia a visualização se essa escrita falhar).
5. **Revogação, se necessário (Pedagógico)** — o mesmo botão de
   liberar/revogar tira o relatório de circulação para o município a
   qualquer momento (`liberado: false`), sem apagar `entregueEm` nem o
   histórico — o registro de que a entrega aconteceu permanece.
6. **Acompanhamento (Admin)** — o dashboard (`/admin`) mostra o status de
   liberação por município e a data da última entrega; `/admin/analytics`
   cruza isso com os acessos reais — quais municípios abrem o que foi
   liberado, com que frequência, e quais relatórios liberados **nunca**
   foram abertos (o sinal mais acionável para a consultoria entrar em
   contato com o município).
7. **Gestão de usuários (Admin)** — em paralelo a tudo isso, o admin cria as
   contas de cada perfil em `/admin/usuarios` (o usuário `municipio` é
   vinculado a um `municipioId` no cadastro) e pode desativar uma conta a
   qualquer momento — o efeito é imediato, inclusive para quem já está
   logado (a sessão cai sozinha, seção 4/6).

### Como o projeto foi concebido (histórico)

Vale registrar porque explica divergências que, de outra forma, pareceriam
erro de documentação:

1. **Plano original** (`docs/prompt-inicial-linkresults.md`): app do zero em
   React + TS + Vite, **Tailwind v4** (`@tailwindcss/vite`, sem
   `tailwind.config.js`) e arquitetura **Feature-Sliced Design**
   (`features/`, `entities/`, `shared/`). Os primeiros commits seguiram esse
   plano à risca — scaffold em Tailwind v4, camada `shared/` com tipos e
   infraestrutura FSD.
2. **Essa primeira tentativa foi abandonada.** Um commit posterior
   (`f4945ea chore: remove all frontend code, keep only Firebase config and
   docs`) apagou todo o frontend construído, mantendo só a config do Firebase
   e a documentação.
3. **A UI real veio de outro caminho**: um export de app gerado pelo
   **Base44** (ferramenta no-code/IA) foi importado inteiro no lugar —
   estrutura **flat** (`api/`, `components/`, `pages/`, `lib/`, não FSD),
   `src/api/base44Client.js` como SDK próprio, ainda em JSX, seguindo um
   sistema de design chamado internamente "Stitch". Commits seguintes
   removeram as referências ao Base44 e plugaram Firebase Auth/Firestore
   diretamente nessa UI já existente, em vez de reescrevê-la.
4. Depois disso: migração completa de JS para TypeScript (99 arquivos
   renomeados), tipagem explícita adicionada a componentes/hooks/API, e daí
   em diante o desenvolvimento seguiu por sessões de agente de IA — as fases
   do MVP (seção 10) e, depois de pronto, as melhorias e features descritas
   em `docs/PLANO-MELHORIAS.md` e `docs/PLANO-ANALYTICS.md`.

**Consequência prática:** a stack e a arquitetura *reais* (seção 2) são as
do export Base44 migrado, não as do plano original — **Tailwind v3**, estrutura
flat, tsconfig não-estrito. Não "corrigir" o projeto de volta para FSD/v4 achando
que está desviado do plano; o plano é que ficou obsoleto.

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite 6 |
| Estilização | Tailwind CSS **v3** + shadcn/ui (Radix) + Lucide React |
| Tema | `next-themes` — claro/escuro com toggle persistente (`ThemeToggle`) |
| Autenticação | Firebase Auth |
| Banco de dados | Firebase Firestore |
| Hospedagem | Firebase Hosting (plano Spark — gratuito) |
| Visualização de relatórios | Iframe embutido (Opção C — página intermediária) |
| Encriptação dos links | Web Crypto API (nativa do browser) |
| Datas | `date-fns` (locale `ptBR`) — ver `src/lib/date.ts` |

> ⚠️ O projeto utiliza exclusivamente o **plano Spark (gratuito)** do Firebase.
> **Não usar Cloud Functions** — nenhuma funcionalidade deve depender delas.

> ⚠️ **É Tailwind v3, não v4** (`tailwind.config.js` na raiz, `darkMode:
> ["class"]`, tema em CSS vars). Versões anteriores deste documento afirmavam
> v4 — informação errada, nunca foi verdade neste projeto. Não rode `npx
> tailwindcss init` (recriaria a config e apagaria os tokens de tema
> existentes) nem tente migrar para `@tailwindcss/vite`.

### Convenções de código
- **Arquitetura: flat, não FSD.** `src/api/` (camada Firestore, uma função `fromFirestore` por entidade), `src/pages/{admin,pedagogico,municipio}/`, `src/components/{ui,lr}/` (`ui/` = shadcn boilerplate `@ts-nocheck`, `lr/` = componentes próprios do LinkResults), `src/lib/` (contextos, utilitários, `crypto.ts`, `date.ts`, `firebase.ts`). Não criar `src/features/`, `src/entities/` ou `src/shared/` — versões anteriores deste documento descreviam FSD; nunca foi isso que se construiu.
- Componentes: funcionais com hooks
- **Tipagem: `strict: false` e `noImplicitAny: false` no tsconfig — não é estrita.** Parâmetros de função (ex.: `render: (r) => ...` em colunas de tabela) costumam ficar com tipo implícito; isso é aceito e usado deliberadamente em várias telas. Ainda assim, **entidades de domínio são sempre tipadas explicitamente** (`RelatorioData`, `MunicipioData`, `UserProfile`, etc., exportadas de `src/api/*.ts`) — a leniência do tsconfig não é licença para `any` explícito fora de `components/ui/`.
- Variáveis de ambiente: prefixo `VITE_`
- Sem `any` explícito fora de `src/components/ui/` (shadcn, `@ts-nocheck`) — ver `docs/PLANO-MELHORIAS.md` item 4
- **Datas**: os tipos do domínio usam `Date` nativo. A conversão `Timestamp → Date` (Firestore) acontece exclusivamente na camada de mapeamento (`api/`) de cada entidade — nunca espalhar `Timestamp` do Firebase pelo restante da aplicação. Formatação para exibição via `formatarData`/`formatarDataHora` de `src/lib/date.ts` (nunca `toLocaleDateString` solto nem string ISO crua na tela).
- Scripts: `npm run dev|build|lint|typecheck|preview` (sem `test` configurado)

---

## 3. Perfis de Usuário

### 3.1 Admin
- Representa a equipe da Tendência Consultoria Educacional
- **Pode:** cadastrar, editar, excluir municípios, avaliações, séries e relatórios (individualmente ou em lote — `/admin/relatorios/lote`)
- **Pode:** gerenciar usuários de todos os perfis, inclusive **desativar** (`status: 'inativo'` — derruba a sessão em tempo real, mesmo com token válido; ver seção 4/6)
- **Vê:** todos os dados do sistema, incluindo links descriptografados
- **Vê:** `/admin/analytics` — quais municípios abrem os relatórios liberados e com que frequência (ver seção 4, coleção `acessos`)
- **Vê:** painel de liberação por município e de última entrega no dashboard (`/admin`)

### 3.2 Pedagógico
- Técnico responsável pela análise dos relatórios
- **Pode:** visualizar todos os relatórios cadastrados pelo Admin
- **Pode:** liberar ou revogar o acesso de um relatório para o município
- **Pode:** ajustar manualmente a data de entrega de um relatório já liberado (ex.: entrega feita em ofício antes do clique no sistema)
- **Pode:** visualizar os relatórios via iframe
- **Não pode:** cadastrar, editar ou excluir dados

### 3.3 Município
- Secretaria ou gestor municipal
- **Pode:** visualizar apenas os relatórios **liberados** para o seu município, agrupados por avaliação + ano (accordion, uma seção aberta por vez)
- **Pode:** criar (nunca ler) registros em `acessos` — é a única escrita que este perfil tem no sistema, disparada automaticamente ao abrir um relatório
- **Vê:** botão "Ver Relatório" que abre página intermediária com iframe do Power BI
- **Não vê:** o link real do Power BI em nenhum momento
- Cada município possui login próprio e acesso isolado via Security Rules

---

## 4. Modelagem do Banco de Dados (Firestore)

### Estrutura de coleções (flat — sem subcoleções)

> **Nota sobre datas:** os campos `timestamp` abaixo são `Timestamp` do Firestore no banco, mas são convertidos para `Date` nativo na camada de mapeamento (`api/`) antes de chegarem ao domínio. Os tipos TypeScript (interfaces `*Data` exportadas de `src/api/*.ts`) usam `Date`.

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
  ano:              number  // ano de referência do relatório — independente do `ano` da avaliação; permite reusar a mesma avaliação (ex.: "CADERNO 1") ano após ano
  linkEncriptado:   string  // Link do Power BI encriptado via Web Crypto API
  liberado:         boolean (default: false)
  liberadoEm:       timestamp | null   // desde quando está liberado AGORA (revogar apaga)
  liberadoPor:      string (uid do pedagógico) | null
  entregueEm:       timestamp | null   // data da 1ª entrega — NUNCA apagada ao revogar
  entreguePor:      string (uid) | null
  entreguePorNome:  string | null      // denormalizado, mesmo padrão de municipioNome
  historico:        array<HistoricoItem>  // auditoria de liberado/revogado/data_ajustada
  createdAt:        timestamp
  updatedAt:        timestamp
```

`HistoricoItem`: `{ acao: 'liberado'|'revogado'|'data_ajustada', em: timestamp, por: string, porNome: string, dataAnterior?: timestamp|null, dataNova?: timestamp|null }`.

> ⚠️ `serverTimestamp()` não é aceito dentro de arrays pelo Firestore — as
> entradas de `historico` usam `Timestamp.now()` (relógio do cliente). Os
> campos autoritativos (`entregueEm`, `liberadoEm`) continuam usando
> `serverTimestamp()`. Ver `src/api/relatorios.ts` (`liberar`,
> `ajustarDataEntrega`) e `docs/PLANO-MELHORIAS.md` item 2.

#### Coleção: `users`
```
users/{uid}
  nome:          string
  email:         string
  role:          'admin' | 'pedagogico' | 'municipio'
  municipioId:   string | null  // null para admin e pedagógico
  municipioNome: string | null  // denormalizado, só para role='municipio'
  status:        'ativo' | 'inativo'  // ausente = tratado como 'ativo'
  createdAt:     timestamp
```

> ⚠️ `status: 'inativo'` derruba a sessão em tempo real (AuthContext escuta o
> doc via `onSnapshot`) e é reforçado nas Security Rules (`isAtivo()`) — ver
> seção 6.

#### Coleção: `acessos`
```
acessos/{acessoId}
  relatorioId:    string
  municipioId:    string
  municipioNome:  string   // denormalizado
  avaliacaoId:    string
  avaliacaoNome:  string   // denormalizado
  serieId:        string
  serieNome:      string   // denormalizado
  userId:         string   // uid de quem abriu
  userNome:       string   // denormalizado
  em:             timestamp
```

Log de analytics: registra a abertura de um relatório pelo município
(`src/pages/municipio/MunicipioReportViewer.tsx`, via
`registrarAcesso()` em `src/api/acessos.ts`). É a **primeira e única**
permissão de escrita que o perfil `municipio` tem no sistema — ver seção 6.
Imutável pelo app (`allow update, delete: if false`); expurgo por retenção só
via Console/Admin SDK. Alimenta `/admin/analytics`. Detalhes e armadilhas em
`docs/PLANO-ANALYTICS.md`.

---

## 5. Encriptação dos Links (Web Crypto API)

Os links do Power BI são encriptados antes de serem salvos no Firestore, usando a **Web Crypto API nativa** — sem bibliotecas externas.

### Algoritmo: AES-GCM (256 bits)

```typescript
// src/lib/crypto.ts

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

> ⚠️ **Fonte da verdade: [`firestore.rules`](../firestore.rules) na raiz do
> projeto.** Este documento não reproduz as regras em código — copiá-las aqui
> já causou divergência entre o que está escrito e o que está deployado.
> Antes de alterar regras, leia o arquivo real; depois de alterar, rode
> `npx firebase deploy --only firestore:rules` (o deploy é um passo separado
> de salvar o arquivo).

Invariantes que vale ter em mente ao mexer nas regras:

- **Múltiplas `allow` do mesmo método se SOMAM (lógica OR)** dentro do mesmo
  `match` — o admin tem `read, write` totais; pedagógico e município somam
  `read`/`update` mais restritos que coexistem com a do admin.
- `isAdmin()` / `isPedagogico()` / `isMunicipio()` exigem `role` **e**
  `isAtivo()` — um usuário com `status: 'inativo'` perde acesso mesmo com um
  ID token Firebase Auth ainda válido.
- O pedagógico só pode escrever um conjunto fechado de campos em
  `relatorios` (`hasOnly([...])`) — qualquer campo novo que uma feature
  precise gravar por essa role tem que entrar nessa lista, senão o
  `updateDoc` volta `permission-denied`.
- `historico` (array de auditoria de liberação — seção 4) só pode crescer,
  nunca encolher, verificado via `.size()`. Sem Cloud Functions não dá pra
  impedir reescrita de uma entrada antiga — limitação aceita, mesmo
  raciocínio da chave de cripto no bundle (seção 5).
- `municipios`/`avaliacoes`/`series` são de leitura livre para qualquer
  usuário autenticado (não checam `isAtivo()`) — só `relatorios` (dado
  sensível) é gated por role+status.
- `acessos` (seção 4) é a única coleção onde `municipio` tem `create` — trava
  `municipioId`/`userId` no próprio usuário e exige `em == request.time`
  (só passa gravando `serverTimestamp()`, nunca `Timestamp.now()`). Admin e
  pedagógico leem; ninguém edita ou apaga pelo app.

---

## 7. Fluxo de Navegação

Rotas reais em `src/App.tsx` (única fonte da verdade — abaixo é um espelho, se
divergir confie no arquivo):

```
/                          → Home: redireciona por role
/login                     → Login (todos os perfis)
/recuperar-senha           → Recuperação de senha
/acesso-negado             → 403
/perfil                    → Meu Perfil (todos os perfis autenticados)

/admin                     → Dashboard (stats, liberação por município, última entrega)
  /admin/municipios        → CRUD de municípios
  /admin/avaliacoes        → CRUD de avaliações
  /admin/series            → CRUD de séries
  /admin/relatorios        → CRUD de relatórios (cadastro de links)
  /admin/relatorios/lote   → Cadastro em lote (1 município + avaliação + ano → N séries)
  /admin/relatorio/:id     → Visualização do relatório (iframe)
  /admin/analytics         → Uso dos relatórios pelos municípios (coleção acessos)
  /admin/usuarios          → Gerenciamento de usuários (criar/editar/desativar)

/pedagogico                → Dashboard
  /pedagogico/relatorios      → Lista com "Liberar/Revogar" e "Ajustar data de entrega"
  /pedagogico/relatorio/:id   → Visualização do relatório (iframe)

/municipio                  → Lista de relatórios liberados (accordion por avaliação+ano)
  /municipio/relatorio/:id  → Página intermediária com iframe do Power BI

*                          → 404
```

Todas as rotas (exceto `/`, `/login`, `/recuperar-senha`, `/acesso-negado`) são
carregadas via `React.lazy` — cada perfil só baixa o código das suas próprias
telas (ver `docs/PLANO-MELHORIAS.md` item 3).

### Redirecionamento por role
- Após login, o sistema lê o `role` do documento `users/{uid}` e redireciona para a rota correta
- Rotas protegidas por `ProtectedRoute` (`src/components/ProtectedRoute.tsx`), que verifica autenticação + role + `status !== 'inativo'`

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

> Todos os itens abaixo estão implementados. Checklist mantida como mapa de
> features, não como plano — para o que veio depois do MVP, com raciocínio e
> armadilhas de cada decisão, ver `docs/PLANO-MELHORIAS.md` e
> `docs/PLANO-ANALYTICS.md`.

### Admin
- [x] Login / logout
- [x] CRUD de Municípios (nome, estado)
- [x] CRUD de Avaliações (nome, ano)
- [x] CRUD de Séries (nome, ordem)
- [x] CRUD de Relatórios (município + avaliação + série + **ano** + link)
- [x] Cadastro em lote (mesmo município + avaliação + ano, múltiplas séries)
- [x] Gerenciamento de usuários (criar, editar, desativar — bloqueio reforçado nas rules)
- [x] Painel de status de liberação por município + última entrega (dashboard)
- [x] Analytics de uso dos relatórios pelos municípios (`/admin/analytics`)
- [x] Filtro por município executado server-side (não traz a coleção inteira)

### Pedagógico
- [x] Login / logout
- [x] Listagem de relatórios com filtros (município, avaliação, série, ano, status)
- [x] Visualização do relatório via iframe
- [x] Liberar relatório para o município
- [x] Revogar acesso ao relatório
- [x] Data de entrega registrada automaticamente na 1ª liberação (nunca apagada ao revogar) + ajuste manual
- [x] Histórico auditável de liberações/revogações/ajustes por relatório

### Município
- [x] Login / logout
- [x] Listagem de relatórios liberados (filtros por avaliação, série e ano; agrupados em accordion)
- [x] Visualização via página intermediária com iframe
- [x] Sem acesso ao link real em nenhum momento
- [x] Registro (silencioso) de abertura de relatório para analytics do Admin

### Transversal
- [x] Tema claro/escuro com toggle persistente (`next-themes`)
- [x] Responsividade mobile em todas as telas (tabelas viram cards)

---

## 10. Prioridades de Desenvolvimento (MVP) — histórico

> Todas as 5 fases abaixo estão concluídas. Mantidas como registro da ordem em
> que o projeto foi construído. O trabalho pós-MVP está em
> `docs/PLANO-MELHORIAS.md` (datas em BR, data de entrega + histórico, code
> splitting, remoção de `any`, filtro server-side) e `docs/PLANO-ANALYTICS.md`
> (coleção `acessos`); tema dark, campo Ano em relatórios e o accordion do
> Município foram feitos fora desses planos, direto em conversa.

**Fase 1 — Base**
1. Setup do projeto (Vite + React + TS + Tailwind + Firebase)
2. Configuração do Firebase Auth + Firestore + Hosting
3. Coleção `users` com roles e redirecionamento por perfil
4. Utilitário de encriptação/descriptografia (`src/lib/crypto.ts`)

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
- **Nunca** usar `any` explícito fora de `src/components/ui/`
- **Sempre** criar tipos explícitos para entidades (`MunicipioData`, `AvaliacaoData`, `SerieData`, `RelatorioData`, `UsuarioData`, `AcessoData`, `UserProfile` — todas exportadas de `src/api/*.ts` ou `src/lib/AuthContext.tsx`)
- **Sempre** converter `Timestamp → Date` na camada `api/` de cada entidade (função de mapeamento `fromFirestore`); o domínio nunca recebe `Timestamp`. Exceção documentada: entradas de `historico` em `relatorios` usam `Timestamp.now()` no cliente, não `serverTimestamp()`, porque o Firestore rejeita `serverTimestamp()` dentro de arrays — ver seção 4
- **É Tailwind v3**, não v4 — `tailwind.config.js` existe e é o lugar certo para customizar tema; não rodar `npx tailwindcss init` (reescreveria a config) nem migrar para `@tailwindcss/vite`
- **A arquitetura é flat, não FSD** — não criar `src/features/`, `src/entities/` ou `src/shared/`. Seguir o que já existe: `src/api/` (Firestore), `src/pages/{admin,pedagogico,municipio}/`, `src/components/lr/` (componentes próprios), `src/components/ui/` (shadcn, não editar levianamente — é `@ts-nocheck`), `src/lib/` (contextos, utilitários, `crypto.ts`, `date.ts`)
- Datas na tela sempre via `formatarData`/`formatarDataHora` de `src/lib/date.ts`
- Ao criar Security Rules, sempre testar com o Firebase Emulator antes de deployar; deploy é `npx firebase deploy --only firestore:rules` (e `firestore:indexes` se mexer em índice) — passo manual, separado de salvar o arquivo
- Antes de propor uma mudança estrutural grande (nova coleção, nova rota, novo padrão de dados), ler `docs/PLANO-MELHORIAS.md` e `docs/PLANO-ANALYTICS.md` — é provável que a decisão e o porquê dela já estejam registrados ali

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
