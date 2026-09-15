# LinkResults — Plano de Melhorias

> Plano aprovado em 2026-09-15. Escrito para ser executado por um agente de IA
> em sessão futura. Leia junto com `CLAUDE.md` (regras do projeto) e
> `CONTEXTO-COMPLETO.md` (estado do código).

---

## Sumário das melhorias

| # | Melhoria | Complexidade | Depende de |
|---|---|---|---|
| 1 | Tipos de `Relatorio` + formatação de datas BR | Baixa | — |
| 2 | **Data de entrega + histórico de liberações** | Alta | 1 |
| 3 | Code splitting (bundle 904 kB) | Baixa | — |
| 4 | Remover `any` do restante do projeto | Média | 1 |
| 5 | Paginação / escala das listagens | Alta | 1, 4 |

**Ordem recomendada:** 1 → 2 → 3 → 4 → 5.

O item 1 vem antes do 2 de propósito: a feature de entrega mexe exatamente nos
arquivos que a faxina de tipos tocaria (`api/relatorios.ts`,
`PedagogicoRelatorios.tsx`, `AdminRelatorios.tsx`). Fazer na ordem inversa
significa editar os mesmos trechos duas vezes. O item 4 é o resto da faxina
(municípios, avaliações, séries, usuários, AuthContext), que não bloqueia a
feature e pode esperar.

---

## Estado atual apurado (2026-09-15)

Verificado no código, não presumido:

- `liberadoEm` **já é gravado** com `serverTimestamp()` em
  [`src/api/relatorios.ts:112`](../src/api/relatorios.ts) na função `liberar()`.
- `liberadoEm` **nunca é lido em nenhuma página** — `grep` por `liberadoEm` em
  `src/pages/` só encontra escritas em updates otimistas.
- **Revogar apaga a data**: `liberadoEm: valor ? serverTimestamp() : null`.
  Hoje, revogar + reliberar perde a data original da entrega.
- `liberadoPor` guarda apenas o `uid`, sem nome — exibir "por quem" exigiria
  lookup em `users`.
- O mapeamento converte para string `'YYYY-MM-DD'`
  ([`relatorios.ts:49`](../src/api/relatorios.ts)), perdendo a hora e
  contrariando a convenção do `CLAUDE.md` (domínio usa `Date` nativo).
- Datas são exibidas cruas em formato ISO (`2025-03-15`) em
  [`AdminMunicipios.tsx:70`](../src/pages/admin/AdminMunicipios.tsx) e
  [`AdminAvaliacoes.tsx:82`](../src/pages/admin/AdminAvaliacoes.tsx).
- `date-fns` **já está instalado** (não precisa adicionar dependência).
- `App.tsx` não usa `React.lazy` — bundle único de 904 kB (237 kB gzip).
- `listar()` traz todos os relatórios sem `limit()`; todos os filtros são
  client-side.

---

## Decisões de produto tomadas

| Pergunta | Decisão |
|---|---|
| Origem da data de entrega | **Automática no clique + ajuste manual opcional** |
| Ao revogar | **Histórico completo** de liberações (quem, quando, o quê) |
| Onde exibir | Lista do pedagógico, lista/dashboard do admin, tela do município |
| Exportação CSV | **Fora do escopo** por ora |

---

## 1. Tipos de `Relatorio` + datas em formato BR

### Objetivo
Alinhar `relatorios` à convenção do `CLAUDE.md` (domínio usa `Date`, nunca
`Timestamp` nem string ISO) e exibir datas como `15/03/2025`.

### Passos

1. Criar `src/lib/date.ts`:
   ```ts
   import { format } from 'date-fns'
   import { ptBR } from 'date-fns/locale'

   export function formatarData(d: Date | null | undefined): string {
     if (!d) return '—'
     return format(d, 'dd/MM/yyyy', { locale: ptBR })
   }

   export function formatarDataHora(d: Date | null | undefined): string {
     if (!d) return '—'
     return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
   }
   ```

2. Em `src/api/relatorios.ts`, trocar o tipo de `liberadoEm` e `createdAt` de
   `string | null` para `Date | null`, e o mapeamento de
   `.toISOString().split('T')[0]` para `?.toDate() ?? null`.

3. Corrigir os **updates otimistas** que hoje inventam string de data:
   - [`AdminRelatorios.tsx:114`](../src/pages/admin/AdminRelatorios.tsx) —
     `createdAt: new Date().toISOString().split('T')[0]` → `new Date()`
   - [`PedagogicoRelatorios.tsx:87`](../src/pages/pedagogico/PedagogicoRelatorios.tsx)
     — mesma coisa para `liberadoEm`

4. Aplicar `formatarData()` nas colunas "Cadastrado em" de `AdminMunicipios` e
   `AdminAvaliacoes` (esses dois ainda usam `string`; converter o mapeamento
   deles também, ou deixar para o item 4 — decidir na hora, mas não deixar
   metade em ISO e metade em BR).

### Critério de aceite
`npm run typecheck` limpo; nenhuma data aparece em formato ISO na UI.

### Armadilha
O projeto usa `date-fns@^3.6.0`, onde o locale é importado como
`import { ptBR } from 'date-fns/locale'` — **não** `date-fns/locale/pt-BR`
(sintaxe da v2, que quebra na v3).

---

## 2. Data de entrega + histórico de liberações

### Modelo de dados (coleção `relatorios`)

Campos **novos**:

```
entregueEm:        timestamp | null   // data da entrega — NUNCA apagada ao revogar
entreguePor:       string | null      // uid de quem entregou
entreguePorNome:   string | null      // denormalizado (padrão já usado em municipioNome)
historico:         array<HistoricoItem>
```

```ts
interface HistoricoItem {
  acao: 'liberado' | 'revogado' | 'data_ajustada'
  em: Timestamp          // ver armadilha #1 — timestamp de cliente
  por: string            // uid
  porNome: string
  dataAnterior?: Timestamp | null  // só em 'data_ajustada'
  dataNova?: Timestamp | null      // só em 'data_ajustada'
}
```

Os campos existentes `liberado`, `liberadoEm`, `liberadoPor` **continuam como
estão** (estado atual do acesso). `entregueEm` é a data histórica da entrega;
`liberadoEm` é "desde quando está liberado agora". São coisas diferentes e
devem coexistir.

### ⚠️ Armadilha #1 — `serverTimestamp()` NÃO funciona dentro de arrays

O Firestore rejeita `serverTimestamp()` dentro de elementos de array (inclusive
via `arrayUnion`), com erro *"FieldValue.serverTimestamp() cannot be used inside
of an array"*.

**Solução:** nas entradas de `historico`, usar `Timestamp.now()` (relógio do
cliente). Manter `entregueEm` e `liberadoEm` como `serverTimestamp()` — esses
são os campos autoritativos; o histórico é auditoria informativa. Documentar
essa diferença no `CLAUDE.md`.

### ⚠️ Armadilha #2 — timezone no ajuste manual de data

`new Date('2025-03-15')` é interpretado como **UTC**; no Brasil (UTC−3) vira
14/03 às 21h e a UI exibe o dia errado. Ao ler um `<input type="date">`:

```ts
const [ano, mes, dia] = valor.split('-').map(Number)
const data = new Date(ano, mes - 1, dia)  // construtor local, sem off-by-one
```

### ⚠️ Armadilha #3 — Security Rules bloqueiam campos novos

A regra atual em [`firestore.rules`](../firestore.rules) limita o pedagógico a
`['liberado','liberadoEm','liberadoPor','updatedAt']`. **Qualquer campo novo
escrito pelo pedagógico é negado até a regra ser atualizada e deployada.**

Nova regra:

```javascript
allow update: if isPedagogico()
  && request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly([
        'liberado', 'liberadoEm', 'liberadoPor', 'updatedAt',
        'entregueEm', 'entreguePor', 'entreguePorNome', 'historico'
      ])
  // histórico só cresce, nunca encolhe
  && request.resource.data.historico.size() >= resource.data.historico.size();
```

**Limitação conhecida (documentar):** sem Cloud Functions (plano Spark), as
rules garantem que o array não encolhe, mas **não** impedem que o pedagógico
reescreva o conteúdo de entradas antigas. Mesmo raciocínio já aceito para a
chave de cripto no bundle (`CLAUDE.md` §5): proteção suficiente para usuários
não técnicos de sistema interno.

Lembrar de rodar `npx firebase deploy --only firestore:rules` — o deploy das
rules é passo separado do deploy do app.

### ⚠️ Armadilha #4 — limite de 1 MiB por documento

`historico` como array cresce sem limite. Com ~150 bytes por entrada, milhares
cabem, mas vale truncar nas últimas ~100 entradas ou aceitar e monitorar.
Subcoleção resolveria, mas o `CLAUDE.md` define modelagem flat — manter array.

### Retrocompatibilidade

Relatórios já liberados hoje têm `liberadoEm` mas não têm `entregueEm`.
**Não é preciso script de migração:** usar fallback no mapeamento.

```ts
entregueEm: (data.entregueEm ?? data.liberadoEm)?.toDate() ?? null
```

Documentos antigos também não têm `historico` — mapear para `[]` quando
ausente, e nas rules considerar que `resource.data.historico` pode não existir
(usar `resource.data.get('historico', [])`).

### Alterações na API (`src/api/relatorios.ts`)

- `liberar(id, uid, nome, valor)` — ganha o nome do responsável; passa a:
  - gravar `entregueEm`/`entreguePor`/`entreguePorNome` **apenas se ainda não
    existirem** (primeira entrega);
  - **nunca** apagar `entregueEm` ao revogar;
  - anexar entrada ao `historico` via `arrayUnion`.
- Nova `ajustarDataEntrega(id, novaData, uid, nome)` — atualiza `entregueEm` e
  anexa entrada `'data_ajustada'` com `dataAnterior`/`dataNova`.

### Alterações de UI

| Tela | Mudança |
|---|---|
| `PedagogicoRelatorios.tsx` | Coluna "Entregue em" (data BR + nome do responsável); ação "Ajustar data" abrindo `FormModal` com `<input type="date">` |
| `AdminRelatorios.tsx` | Coluna "Entregue em" (leitura) |
| `AdminDashboard.tsx` | No painel "Liberação por município", exibir a data da entrega mais recente |
| `MunicipioRelatorios.tsx` | No card: "Disponível desde 15/03/2025" |
| `PedagogicoReportViewer.tsx` | Exibir data da entrega no cabeçalho (opcional) |

O `DataTable` já renderiza cards no mobile — colunas novas aparecem
automaticamente lá, sem trabalho extra.

O município **não precisa de mudança nas rules** para ler `entregueEm`: ele já
lê o documento inteiro dos relatórios liberados para si.

### Critério de aceite

1. Liberar um relatório grava `entregueEm`, `entreguePor`, `entreguePorNome` e
   uma entrada `'liberado'` no histórico.
2. Revogar **mantém** `entregueEm` e anexa entrada `'revogado'`.
3. Reliberar **não** sobrescreve a `entregueEm` original.
4. Ajustar a data manualmente altera `entregueEm` e registra o valor anterior.
5. A data aparece corretamente (sem off-by-one) nas três telas.
6. Rules deployadas; pedagógico consegue salvar sem `permission-denied`.

---

## 3. Code splitting

### Objetivo
Reduzir os 904 kB do bundle inicial — relevante porque o município (maior
volume de acessos) baixa hoje todo o código de admin e pedagógico sem usar.

### Passos

1. Em `src/App.tsx`, trocar os imports estáticos das páginas por `React.lazy`,
   agrupando por perfil, e envolver as rotas em `<Suspense>` com o
   `LoadingSpinner` já existente.
2. Em `vite.config.js`, adicionar `build.rollupOptions.output.manualChunks`
   separando `firebase` e `react` em chunks próprios.

### Observação honesta
O SDK do Firebase é a maior fatia e é carregado por todos os perfis — o lazy das
rotas sozinho não resolve tudo. O ganho real vem da combinação das duas coisas.
Medir com `npm run build` antes e depois e registrar os números.

### Critério de aceite
Bundle inicial menor que hoje (medir), app funcionando em todas as rotas, sem
tela branca durante a transição (Suspense com fallback).

---

## 4. Remover `any` do restante do projeto

O `CLAUDE.md` §11 proíbe `any`, mas o código usa `useState<any[]>` em
`AdminRelatorios`, `AdminSeries`, `AdminDashboard`, `AdminUsuarios`,
`AdminMunicipios`, `AdminAvaliacoes`, e `profile: Record<string, any>` em
`AuthContext`.

### Passos
1. Criar `src/types/index.ts` com `Municipio`, `Avaliacao`, `Serie`,
   `Relatorio`, `UserProfile` (ou reusar as interfaces já exportadas de `api/`).
2. Tipar `AuthContext.profile` como `UserProfile | null` — isso vai expor vários
   acessos hoje silenciosos (`profile.municipioId`, `profile.uid`).
3. Converter `createdAt` de string para `Date` nas demais entidades, aplicando
   `formatarData()` do item 1.

### Armadilha
Tipar `profile` quebra `profile?.nome || 'Admin'` em vários lugares se o tipo
não permitir campos opcionais. Preferir campos opcionais a `any`.

### Critério de aceite
`grep -rn ": any\|<any" src/ --include=*.tsx --include=*.ts` sem resultados fora
de `components/ui/` (shadcn, marcado com `@ts-nocheck`).

---

## 5. Paginação / escala

### Problema
`listar()` busca **todos** os relatórios a cada carregamento de página. O
`CLAUDE.md` projeta ~1.620 relatórios/ano. O plano Spark tem cota de 50 mil
leituras/dia — com alguns admins recarregando listas de milhares de documentos,
a cota vira risco real em 2–3 anos de uso.

### Abordagem recomendada (em duas camadas)

1. **Filtro server-side no campo mais seletivo.** Quando `filterMunicipio` está
   ativo, mandar o `where('municipioId','==',id)` para o Firestore em vez de
   filtrar no cliente. Idem para avaliação.
2. **Paginação por cursor** (`limit()` + `startAfter()`) com página de 25–50,
   mantendo busca textual client-side dentro da página carregada.

### Armadilhas
- Cada combinação de `where` + `orderBy` exige **índice composto** em
  `firestore.indexes.json` — hoje só existe `municipioId + liberado`. Mapear as
  combinações realmente usadas antes de implementar, e deployar os índices.
- Busca textual no Firestore não existe nativamente. Manter client-side e deixar
  claro na UI que a busca atua sobre o conjunto carregado — ou aceitar o
  comportamento atual enquanto o volume for pequeno.
- Interage diretamente com o `FilterBar` e a contagem "X de Y" criados na Fase 5:
  com paginação, "Y" deixa de ser o total real carregado. Ajustar o texto.

### Critério de aceite
Lista funcional com navegação entre páginas; filtros de município/avaliação
executados no servidor; índices deployados; contagem coerente com o que é
mostrado.

---

## Checklist de encerramento (qualquer item)

- [ ] `npm run typecheck` limpo
- [ ] `npm run lint` limpo
- [ ] `npm run build` sem erro
- [ ] Se mexeu em `firestore.rules`: `npx firebase deploy --only firestore:rules`
- [ ] Se mexeu em `firestore.indexes.json`: `npx firebase deploy --only firestore:indexes`
- [ ] `CLAUDE.md` / `CONTEXTO-COMPLETO.md` atualizados se o modelo de dados mudou
- [ ] Commit com mensagem descritiva
