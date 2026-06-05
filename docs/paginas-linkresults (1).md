# Inventário de Páginas — LinkResults

> Mapa completo de todas as páginas do sistema, organizadas por perfil de usuário.
> Cada página inclui: rota, objetivo, componentes, estados e ações.
> Use junto com o `CLAUDE.md`.

---

## Sumário

- [Páginas Públicas / Sistema](#1-páginas-públicas--sistema)
- [Área Admin](#2-área-admin)
- [Área Pedagógico](#3-área-pedagógico)
- [Área Município](#4-área-município)
- [Componentes Compartilhados](#5-componentes-compartilhados)
- [Resumo de Rotas](#6-resumo-de-rotas)

---

## 1. Páginas Públicas / Sistema

Acessíveis sem autenticação ou comuns a todos os perfis.

### 1.1 Login
- **Rota:** `/login`
- **Perfil:** Público
- **Objetivo:** Autenticar o usuário e redirecioná-lo para a área correta conforme o `role`.
- **Componentes:**
  - Logo do LinkResults
  - Campo de email
  - Campo de senha (com toggle de visibilidade)
  - Botão "Entrar"
  - Link "Esqueci minha senha"
- **Estados:**
  - `idle` — formulário pronto
  - `loading` — autenticando
  - `error` — credenciais inválidas / usuário desativado
- **Ações:**
  - `signInWithEmailAndPassword` → lê `role` em `users/{uid}` → redireciona
  - Navegar para `/recuperar-senha`

### 1.2 Recuperar Senha
- **Rota:** `/recuperar-senha`
- **Perfil:** Público
- **Objetivo:** Enviar email de redefinição de senha.
- **Componentes:**
  - Campo de email
  - Botão "Enviar link de recuperação"
  - Link "Voltar ao login"
- **Estados:**
  - `idle`, `loading`, `success` (email enviado), `error`
- **Ações:**
  - `sendPasswordResetEmail`
  - Navegar de volta para `/login`

### 1.3 Meu Perfil
- **Rota:** `/perfil`
- **Perfil:** Todos (Admin, Pedagógico, Município)
- **Objetivo:** Visualizar dados da conta e alterar a senha.
- **Componentes:**
  - Nome, email, perfil (role), município vinculado (se houver)
  - Formulário de alteração de senha
- **Estados:**
  - `idle`, `loading`, `success`, `error`
- **Ações:**
  - `updatePassword` (reautenticação se necessário)
  - Logout

### 1.4 Página Não Encontrada (404)
- **Rota:** `*` (catch-all)
- **Perfil:** Todos
- **Objetivo:** Informar que a rota não existe e oferecer retorno.
- **Componentes:**
  - Ilustração / código 404
  - Mensagem amigável
  - Botão "Voltar ao início" (redireciona conforme o role)
- **Estados:** Estático
- **Ações:** Navegar para a home do perfil atual

### 1.5 Acesso Negado (403)
- **Rota:** `/acesso-negado`
- **Perfil:** Todos (autenticados)
- **Objetivo:** Informar que o usuário tentou acessar uma área sem permissão.
- **Componentes:**
  - Mensagem de acesso restrito
  - Botão "Voltar para minha área"
- **Estados:** Estático
- **Ações:** Redirecionar para a home do role

---

## 2. Área Admin

Prefixo de rota: `/admin`. Layout com sidebar de navegação.

### 2.1 Dashboard Admin
- **Rota:** `/admin`
- **Objetivo:** Visão geral do sistema com indicadores rápidos.
- **Componentes:**
  - Cards de totais: nº de municípios, avaliações, relatórios cadastrados, relatórios liberados
  - Atalhos para cadastros
  - Lista dos últimos relatórios cadastrados
- **Estados:**
  - `loading`, `loaded`, `empty` (sem dados ainda)
- **Ações:**
  - Navegar para cada seção de cadastro

### 2.2 Municípios — Listagem
- **Rota:** `/admin/municipios`
- **Objetivo:** Listar, buscar e gerenciar municípios.
- **Componentes:**
  - Tabela (nome, estado, data de criação, ações)
  - Busca por nome
  - Botão "Novo Município"
  - Ações por linha: editar, excluir
- **Estados:**
  - `loading`, `loaded`, `empty`, `error`
- **Ações:**
  - Abrir modal de criação/edição
  - Excluir (com confirmação)

### 2.3 Município — Formulário (Criar / Editar)
- **Rota:** `/admin/municipios/novo` e `/admin/municipios/:id/editar` (ou modal)
- **Objetivo:** Cadastrar ou editar um município.
- **Componentes:**
  - Campo nome
  - Campo estado (select com UFs)
  - Botões "Salvar" / "Cancelar"
- **Estados:**
  - `idle`, `saving`, `success`, `error` (ex: nome duplicado)
- **Ações:**
  - `addDoc` / `updateDoc` na coleção `municipios`

### 2.4 Avaliações — Listagem
- **Rota:** `/admin/avaliacoes`
- **Objetivo:** Gerenciar avaliações (ex: CADERNO 1, SPAECE 2025).
- **Componentes:**
  - Tabela (nome, ano, ações)
  - Filtro por ano
  - Botão "Nova Avaliação"
- **Estados:**
  - `loading`, `loaded`, `empty`, `error`
- **Ações:**
  - Criar, editar, excluir

### 2.5 Avaliação — Formulário (Criar / Editar)
- **Rota:** `/admin/avaliacoes/novo` e `/admin/avaliacoes/:id/editar` (ou modal)
- **Objetivo:** Cadastrar ou editar uma avaliação.
- **Componentes:**
  - Campo nome
  - Campo ano
  - Botões "Salvar" / "Cancelar"
- **Estados:**
  - `idle`, `saving`, `success`, `error`
- **Ações:**
  - `addDoc` / `updateDoc` na coleção `avaliacoes`

### 2.6 Séries — Listagem
- **Rota:** `/admin/series`
- **Objetivo:** Gerenciar as séries/etapas (Educação Infantil até 9º ano e além).
- **Componentes:**
  - Tabela ordenada por `ordem` (nome, ordem, ações)
  - Botão "Nova Série"
- **Estados:**
  - `loading`, `loaded`, `empty`, `error`
- **Ações:**
  - Criar, editar, excluir, reordenar
- **Nota:** Séries provavelmente são cadastradas uma única vez no setup inicial.

### 2.7 Série — Formulário (Criar / Editar)
- **Rota:** `/admin/series/novo` e `/admin/series/:id/editar` (ou modal)
- **Objetivo:** Cadastrar ou editar uma série.
- **Componentes:**
  - Campo nome
  - Campo ordem (número)
  - Botões "Salvar" / "Cancelar"
- **Estados:**
  - `idle`, `saving`, `success`, `error`
- **Ações:**
  - `addDoc` / `updateDoc` na coleção `series`

### 2.8 Relatórios — Listagem
- **Rota:** `/admin/relatorios`
- **Objetivo:** Visão completa de todos os relatórios cadastrados e seu status.
- **Componentes:**
  - Tabela (município, avaliação, série, status de liberação, ações)
  - Filtros: município, avaliação, série, status
  - Busca
  - Botão "Novo Relatório"
  - Botão "Cadastro em Lote"
- **Estados:**
  - `loading`, `loaded`, `empty`, `error`
- **Ações:**
  - Criar individual, criar em lote, editar, excluir
  - Visualizar (abre iframe — o admin vê o link descriptografado)

### 2.9 Relatório — Formulário Individual (Criar / Editar)
- **Rota:** `/admin/relatorios/novo` e `/admin/relatorios/:id/editar`
- **Objetivo:** Cadastrar/editar um relatório único.
- **Componentes:**
  - Select de município
  - Select de avaliação
  - Select de série
  - Campo do link do Power BI (será encriptado ao salvar)
  - Botões "Salvar" / "Cancelar"
- **Estados:**
  - `idle`, `saving`, `success`, `error` (ex: combinação município+avaliação+série já existe)
- **Ações:**
  - Encriptar link → `addDoc` / `updateDoc` na coleção `relatorios`

### 2.10 Relatório — Cadastro em Lote
- **Rota:** `/admin/relatorios/lote`
- **Objetivo:** Cadastrar vários relatórios de uma vez (mesmo município + avaliação, várias séries). **Esta é a tela que resolve o problema original do .docx.**
- **Componentes:**
  - Select de município (1)
  - Select de avaliação (1)
  - Lista dinâmica: para cada série, um campo de link do Power BI
  - Botão "Adicionar série" / remover
  - Botão "Salvar todos"
- **Estados:**
  - `idle`, `saving` (com progresso), `partial` (alguns salvos, outros com erro), `success`, `error`
- **Ações:**
  - Encriptar cada link → gravação em lote (`writeBatch`) na coleção `relatorios`

### 2.11 Usuários — Listagem
- **Rota:** `/admin/usuarios`
- **Objetivo:** Gerenciar os usuários dos três perfis.
- **Componentes:**
  - Tabela (nome, email, perfil, município vinculado, status, ações)
  - Filtro por perfil
  - Botão "Novo Usuário"
- **Estados:**
  - `loading`, `loaded`, `empty`, `error`
- **Ações:**
  - Criar, editar, desativar/reativar

### 2.12 Usuário — Formulário (Criar / Editar)
- **Rota:** `/admin/usuarios/novo` e `/admin/usuarios/:id/editar`
- **Objetivo:** Cadastrar ou editar um usuário e definir seu perfil.
- **Componentes:**
  - Campo nome
  - Campo email
  - Campo senha (apenas na criação)
  - Select de perfil (admin / pedagógico / município)
  - Select de município (visível apenas se perfil = município)
  - Botões "Salvar" / "Cancelar"
- **Estados:**
  - `idle`, `saving`, `success`, `error` (ex: email já cadastrado)
- **Ações:**
  - `createUserWithEmailAndPassword` (na criação) + criar doc em `users`
  - `updateDoc` (na edição)
- **Nota:** No plano Spark, a criação de usuário pelo admin via SDK no cliente desloga o admin atual. Avaliar uso de uma instância secundária do Firebase App (`initializeApp` com nome diferente) para contornar — documentar como ponto de atenção técnica.

### 2.13 Visualizar Relatório (Admin)
- **Rota:** `/admin/relatorio/:id`
- **Objetivo:** Pré-visualizar o relatório do Power BI (admin vê o link).
- **Componentes:**
  - Cabeçalho (município, avaliação, série, botão voltar)
  - Iframe em tela cheia
- **Estados:**
  - `loading`, `loaded`, `error` (link inválido)
- **Ações:**
  - Descriptografar link → injetar no iframe

---

## 3. Área Pedagógico

Prefixo de rota: `/pedagogico`. Layout com sidebar simplificada (sem cadastros).

### 3.1 Dashboard Pedagógico
- **Rota:** `/pedagogico`
- **Objetivo:** Visão geral do trabalho de análise e liberação.
- **Componentes:**
  - Cards: total de relatórios, liberados, pendentes de liberação
  - Lista de relatórios recém-cadastrados aguardando análise
- **Estados:**
  - `loading`, `loaded`, `empty`
- **Ações:**
  - Navegar para a listagem

### 3.2 Relatórios — Listagem
- **Rota:** `/pedagogico/relatorios`
- **Objetivo:** Analisar relatórios e controlar a liberação para os municípios.
- **Componentes:**
  - Tabela (município, avaliação, série, status, ações)
  - Filtros: município, avaliação, série, status (liberado/pendente)
  - Toggle ou botão "Liberar / Revogar" por linha
  - Botão "Visualizar" por linha
- **Estados:**
  - `loading`, `loaded`, `empty`, `error`
  - Por linha: `updating` (durante liberação/revogação)
- **Ações:**
  - `updateDoc` apenas em `liberado`, `liberadoEm`, `liberadoPor`
  - Abrir visualização do relatório

### 3.3 Visualizar Relatório (Pedagógico)
- **Rota:** `/pedagogico/relatorio/:id`
- **Objetivo:** Analisar o relatório do Power BI antes de liberar.
- **Componentes:**
  - Cabeçalho (município, avaliação, série, botão voltar)
  - Iframe em tela cheia
  - Botão de ação "Liberar / Revogar" no cabeçalho
- **Estados:**
  - `loading`, `loaded`, `error`
- **Ações:**
  - Descriptografar link → iframe
  - Liberar / revogar direto da tela

---

## 4. Área Município

Prefixo de rota: `/municipio`. Layout simplificado, foco em consumo.

### 4.1 Dashboard / Meus Relatórios
- **Rota:** `/municipio`
- **Objetivo:** Listar todos os relatórios **liberados** para o município logado.
- **Componentes:**
  - Cards ou lista agrupada por avaliação
  - Cada item: avaliação + série + botão "Ver Relatório"
  - Filtros: avaliação, série
  - Estado vazio amigável ("Nenhum relatório disponível ainda")
- **Estados:**
  - `loading`, `loaded`, `empty`, `error`
- **Ações:**
  - Navegar para a visualização do relatório
- **Segurança:** Query traz apenas `municipioId == meu` e `liberado == true`. O link nunca é exibido.

### 4.2 Visualizar Relatório (Município)
- **Rota:** `/municipio/relatorio/:id`
- **Objetivo:** Exibir o relatório do Power BI sem revelar o link (Opção C).
- **Componentes:**
  - Cabeçalho com logo, nome do município, avaliação + série, botão "← Voltar"
  - Iframe em tela cheia
- **Estados:**
  - `loading`, `loaded`, `error` (relatório não liberado ou inexistente)
- **Ações:**
  - Buscar doc → validar liberação → descriptografar link em memória → injetar no `src` do iframe
- **Segurança:** O link descriptografado **nunca** vai para o DOM visível, apenas para o atributo `src` do iframe.

---

## 5. Componentes Compartilhados

Componentes reutilizáveis que aparecem em várias páginas (`src/shared/ui/`).

- **AppLayout** — estrutura base com sidebar + header + área de conteúdo (variações por perfil)
- **Sidebar** — navegação lateral, itens conforme o `role`
- **Header** — nome do usuário, atalho para `/perfil`, botão de logout
- **DataTable** — tabela genérica com ordenação e estados de loading/empty
- **Modal** — diálogo para formulários e confirmações
- **ConfirmDialog** — confirmação de exclusão / revogação
- **FormField** — input padronizado com label e mensagem de erro
- **SelectField** — select padronizado (municípios, avaliações, séries, UFs)
- **Button** — botão com variantes (primário, secundário, perigo) e estado de loading
- **ReportViewer** — wrapper do iframe + cabeçalho (usado por Admin, Pedagógico e Município)
- **StatusBadge** — selo de status (liberado / pendente)
- **EmptyState** — estado vazio amigável
- **Toast / Notification** — feedback de sucesso/erro
- **PrivateRoute** — guarda de rota por autenticação + role
- **Spinner / LoadingScreen** — indicadores de carregamento

---

## 6. Resumo de Rotas

| Rota | Perfil | Página |
|---|---|---|
| `/login` | Público | Login |
| `/recuperar-senha` | Público | Recuperar Senha |
| `/perfil` | Todos | Meu Perfil |
| `/acesso-negado` | Autenticados | Acesso Negado (403) |
| `*` | Todos | Não Encontrado (404) |
| `/admin` | Admin | Dashboard |
| `/admin/municipios` | Admin | Municípios — Listagem |
| `/admin/municipios/novo` | Admin | Município — Criar |
| `/admin/municipios/:id/editar` | Admin | Município — Editar |
| `/admin/avaliacoes` | Admin | Avaliações — Listagem |
| `/admin/avaliacoes/novo` | Admin | Avaliação — Criar |
| `/admin/avaliacoes/:id/editar` | Admin | Avaliação — Editar |
| `/admin/series` | Admin | Séries — Listagem |
| `/admin/series/novo` | Admin | Série — Criar |
| `/admin/series/:id/editar` | Admin | Série — Editar |
| `/admin/relatorios` | Admin | Relatórios — Listagem |
| `/admin/relatorios/novo` | Admin | Relatório — Criar |
| `/admin/relatorios/:id/editar` | Admin | Relatório — Editar |
| `/admin/relatorios/lote` | Admin | Relatório — Cadastro em Lote |
| `/admin/usuarios` | Admin | Usuários — Listagem |
| `/admin/usuarios/novo` | Admin | Usuário — Criar |
| `/admin/usuarios/:id/editar` | Admin | Usuário — Editar |
| `/admin/relatorio/:id` | Admin | Visualizar Relatório |
| `/pedagogico` | Pedagógico | Dashboard |
| `/pedagogico/relatorios` | Pedagógico | Relatórios — Listagem |
| `/pedagogico/relatorio/:id` | Pedagógico | Visualizar Relatório |
| `/municipio` | Município | Meus Relatórios |
| `/municipio/relatorio/:id` | Município | Visualizar Relatório |

---

## Contagem total

- **Páginas de sistema:** 5
- **Páginas Admin:** 13
- **Páginas Pedagógico:** 3
- **Páginas Município:** 2
- **Total:** 23 páginas

> Observação: formulários de criação/edição podem ser implementados como **modais** sobre a listagem em vez de páginas dedicadas, reduzindo o número de rotas. A decisão fica a critério da implementação — ambas as abordagens estão refletidas nas rotas acima.
