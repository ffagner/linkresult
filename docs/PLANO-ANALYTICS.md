# LinkResults — Plano: Analytics de uso dos relatórios

> Plano aprovado em 2026-09-15. Escrito para ser executado por um agente de IA
> em sessão futura. Leia junto com `CLAUDE.md` (regras do projeto) e
> `PLANO-MELHORIAS.md` (melhorias anteriores, já implementadas).

---

## Pergunta de negócio

> "Os usuários do município abrem os relatórios? Com que frequência?"

A consultoria precisa saber se a entrega está sendo consumida — hoje ela libera
o relatório e não tem nenhum sinal de retorno. A métrica mais acionável não é o
total de acessos: é **quem parou de acessar / nunca acessou**, porque é isso que
gera a ligação para o município.

---

## Decisões tomadas

| Pergunta | Decisão |
|---|---|
| O que registrar | **Só abertura de relatório** (não login, não tempo de leitura) |
| Onde aparece | Nova página no Admin (`/admin/analytics`) |
| Agregação | Client-side sobre janela de período; contadores ficam para v2 |

---

## Estado atual apurado (2026-09-15)

Verificado no código, não presumido:

- Não existe nenhuma coleta hoje. `src/lib/firebase.ts` inicializa apenas
  `getAuth` e `getFirestore` — **não há Firebase Analytics (GA4)** no projeto.
- O ponto de captura natural é
  [`MunicipioReportViewer.tsx:29`](../src/pages/municipio/MunicipioReportViewer.tsx),
  logo após `setRelatorio(data)` — ali a verificação de acesso
  (`municipioId` confere + `liberado == true`) já passou, então o acesso é
  legítimo por construção.
- O município hoje **só lê** `relatorios` nas Security Rules. Ele não tem
  nenhuma permissão de escrita em lugar nenhum — este plano cria a primeira.
- `entregueEm` (implementado no plano anterior) permite cruzar entrega × 1º
  acesso, que é a métrica mais rica que dá pra extrair.

### Por que não usar Firebase Analytics (GA4)

GA4 é gratuito mesmo no plano Spark, mas os dados ficam no console do Google.
Para alimentar um painel **dentro do app** seria preciso BigQuery export (exige
Blaze) ou a GA Data API (exige servidor — e o projeto não usa Cloud Functions).
Logo: coleta própria no Firestore. GA4 pode ser adicionado em paralelo depois,
se a consultoria quiser explorar dados no console do Google.

---

## Modelo de dados

### Coleção nova: `acessos`

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
  em:             timestamp  // serverTimestamp() — ver armadilha #3
```

**Por que denormalizar tudo:** mesmo padrão já usado em `relatorios`
(`municipioNome`, `avaliacaoNome`…). A tela de analytics não precisa cruzar com
outras coleções (o que custaria N leituras por linha), e o registro histórico
sobrevive à exclusão do relatório — o que é desejável: "o município abriu 40
vezes aquele relatório de 2025" continua verdade mesmo se o relatório for
apagado depois.

**Sem contadores agregados no v1.** Ver seção "v2" no final.

---

## Security Rules

Adicionar em [`firestore.rules`](../firestore.rules) (as funções `isAdmin()`,
`isMunicipio()`, `getMunicipioId()` já existem):

```javascript
match /acessos/{id} {
  // Admin e pedagógico leem tudo. (A navegação do v1 expõe só para o admin,
  // mas liberar leitura ao pedagógico deixa um futuro indicador na tela dele
  // como mudança só de UI.)
  allow read: if isAdmin() || isPedagogico();

  // Município só CRIA, e só registro dele mesmo, com o relógio do servidor.
  allow create: if isMunicipio()
    && request.resource.data.municipioId == getMunicipioId()
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.em == request.time;

  // Log de auditoria é imutável pelo app.
  allow update, delete: if false;
}
```

O que essa regra garante e o que **não** garante:

- ✅ Um município não consegue forjar acesso em nome de outro (`municipioId`
  travado no dele) nem em nome de outro usuário (`userId == request.auth.uid`).
- ✅ Não consegue antedatar/pós-datar (`em == request.time`, que só passa se o
  cliente escrever `serverTimestamp()`).
- ✅ Não consegue apagar nem editar o próprio rastro.
- ❌ **Não** valida que o `relatorioId` existe e está liberado para ele. Validar
  exigiria um `get()` na regra — uma leitura extra em **toda** escrita. Como o
  município já não consegue ler relatório não-liberado, o dado para forjar não
  está à mão; o resíduo é um município tecnicamente sofisticado inflar os
  próprios números. Mesmo patamar de risco já aceito no `CLAUDE.md` §5 (chave
  de cripto no bundle). Se um dia isso importar, adicionar o `get()`.
- ❌ **Não** impede subcontagem: quem bloquear a escrita no devtools/ficar
  offline simplesmente não é registrado.

> ⚠️ `allow delete: if false` significa que **nem o admin apaga pelo app**.
> Expurgo por retenção (ver armadilha #7) se faz pelo Console do Firebase ou
> por script com o Admin SDK (`AccountKey/`).

---

## Índices

Adicionar em [`firestore.indexes.json`](../firestore.indexes.json):

```json
{
  "collectionGroup": "acessos",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "municipioId", "order": "ASCENDING" },
    { "fieldPath": "em", "order": "DESCENDING" }
  ]
}
```

Cobre o drill-down por município (`where municipioId == x` + `orderBy em desc`).
As demais consultas não precisam de índice composto:

- `orderBy('em','desc') + limit()` → índice de campo único, automático.
- `where('em','>=', inicio) + orderBy('em','desc')` → range e ordenação no
  **mesmo** campo, não exige composto.

---

## Coleta

Criar `src/api/acessos.ts` seguindo o padrão das outras entidades
(`fromFirestore` convertendo `Timestamp → Date`, nunca vazando `Timestamp`):

```ts
export interface AcessoData {
  id: string
  relatorioId: string
  municipioId: string
  municipioNome: string
  avaliacaoId: string
  avaliacaoNome: string
  serieId: string
  serieNome: string
  userId: string
  userNome: string
  em: Date | null
}

/** Registra a abertura de um relatório. Nunca lança — ver armadilha #5. */
export async function registrarAcesso(
  relatorio: RelatorioData,
  userId: string,
  userNome: string,
): Promise<void>

/** Acessos a partir de uma data, mais recentes primeiro. */
export async function listarDesde(desde: Date, municipioId?: string): Promise<AcessoData[]>
```

O gancho vai em
[`MunicipioReportViewer.tsx`](../src/pages/municipio/MunicipioReportViewer.tsx),
dentro do `load()`, **depois** de `setRelatorio(data)` e protegido pela guarda de
deduplicação (armadilhas #1 e #2).

---

## Tela: `/admin/analytics`

Rota protegida por `ProtectedRoute allowedRoles={['admin']}`, item novo em
`adminNav` no [`AppLayout.tsx`](../src/components/lr/AppLayout.tsx) — usar um
ícone ainda não ocupado (`Activity` ou `TrendingUp`; `BarChart3` já é do
município). Lembrar do `React.lazy` no `App.tsx`, como as demais.

Componentes já existentes que devem ser reaproveitados: `StatsCard`,
`DataTable` (já responsivo com cards no mobile), `FilterBar`, `PageHeader`,
`formatarData`.

**Conteúdo:**

1. **Cards de topo** — acessos no período, municípios ativos (≥1 acesso),
   municípios sem nenhum acesso no período, tempo médio entre `entregueEm` e a
   1ª abertura.
2. **Tabela por município** — acessos no período, último acesso, nº de
   relatórios liberados, nº nunca abertos. **Ordenar com o mais preocupante em
   cima** (sem acesso primeiro), mesma lógica do painel "Liberação por
   município" do dashboard.
3. **Top relatórios** — os mais e os menos acessados (avaliação + série).
4. **Filtros** — período (30 / 90 / 365 dias, padrão 90) e município.

O cruzamento "relatórios liberados que ninguém abriu" é feito no cliente: a
página já carrega os relatórios (o admin lê todos) e os acessos da janela.

---

## Armadilhas

### #1 — O efeito registra duas vezes (não é polimento, é correção)

O efeito de carga do viewer tem `profile` no array de dependências:

```tsx
}, [id, profile]);
```

e o `AuthContext` **recria o objeto `profile` a cada emissão do `onSnapshot`**
do documento do usuário. Ou seja: qualquer re-emissão do snapshot re-dispara o
efeito e registraria um acesso novo. Guardar com um `useRef` do `relatorioId` já
registrado nesta montagem, além do dedup da armadilha #2.

### #2 — Refresh inflando a frequência

Sem trava, F5 dez vezes = dez acessos, e a métrica de frequência perde sentido.
Deduplicar na escrita com `sessionStorage`: chave por `relatorioId`, janela de
~30 min. É uma trava suave (some ao fechar a aba, é por aba) — suficiente para o
propósito e sem custo.

### #3 — `em == request.time` exige `serverTimestamp()`

A regra só passa se o cliente gravar `serverTimestamp()`. Trocar por
`Timestamp.now()` (relógio do cliente) quebra a escrita com `permission-denied`.
Vale a mesma nota do histórico de liberação: aqui **não** há o impedimento de
array do `CLAUDE.md` §4, porque `em` é campo de topo.

### #4 — Mede abertura, não leitura

O relatório roda em iframe do Power BI (cross-origin): não há como saber o que
acontece lá dentro. Rotular a métrica na UI como "aberturas", nunca como
"leituras" — a consultoria vai tomar decisão com esse número.

### #5 — Falha de registro não pode quebrar a visualização

Se a escrita falhar (offline, regra negada, cota), **o relatório tem que abrir
do mesmo jeito**. `registrarAcesso` engole o erro (log no console, no máximo) e
nunca propaga para o `load()` do viewer. Um erro de analytics derrubando a
entrega do produto seria inaceitável.

### #6 — O dia 1 mostra "ninguém acessou"

Não há dados retroativos: no lançamento, toda a tela mostra zero acesso e todos
os municípios como "sem acesso", o que **é falso e mina a confiança na
ferramenta**. Exibir um aviso fixo na página: "coleta iniciada em DD/MM/AAAA;
acessos anteriores a essa data não foram registrados". Guardar essa data como
constante no código no dia do deploy.

### #7 — LGPD: é dado pessoal de servidor identificado

O registro guarda quem abriu, o quê e quando, de um servidor público
identificado. Uso legítimo (medir consumo da entrega contratada), mas:
- deve estar declarado no contrato / termo de uso da plataforma;
- definir retenção (sugestão: 24 meses) e executar o expurgo via Console ou
  Admin SDK, já que as rules bloqueiam `delete`;
- não expor o nome do usuário do município para **outros** municípios (as rules
  já garantem: só admin e pedagógico leem).

---

## Critério de aceite

1. Abrir um relatório como município cria exatamente **um** documento em
   `acessos`, com `em` vindo do servidor.
2. Recarregar a mesma página dentro de 30 min **não** cria registro novo.
3. Município não consegue ler `acessos` nem criar registro com `municipioId` de
   outro (testar com o Emulator antes do deploy — `CLAUDE.md` §11).
4. Falha de escrita não impede o relatório de abrir.
5. `/admin/analytics` mostra, para cada município, acessos no período, último
   acesso e relatórios nunca abertos, com o aviso da data de início de coleta.
6. Rules e índices deployados (`--only firestore:rules,firestore:indexes`).

---

## v2 — contadores agregados (não implementar agora)

O painel do v1 lê os acessos da janela e agrega no cliente. Com ~500 acessos/mês
e janela de 90 dias são ~1.500 leituras por carregamento da página — tranquilo
contra a cota de 50 mil/dia do Spark, mas cresce.

**Gatilho para revisar:** quando a janela padrão de 90 dias passar de ~2.000
documentos.

**Desenho quando chegar lá:** coleção `acessosResumo/{relatorioId}` com
`{ municipioId, total, ultimoEm, ultimoPor }`, mantida pelo próprio cliente com
`increment(1)`. As rules conseguem travar bem isso — dá para exigir
`request.resource.data.total == resource.data.total + 1`, ou seja, incremento de
exatamente 1 por escrita, e `ultimoEm == request.time`. Precisa de transação no
cliente (create no 1º acesso, update nos demais) e custa +1 leitura +1 escrita
por acesso.

Não fazer isso agora: dobra a superfície de escrita e a complexidade das regras
para resolver um custo que ainda não existe.

> ⚠️ Deliberadamente **não** foi considerado guardar os contadores dentro do
> próprio documento de `relatorios`. Seria mais barato de ler, mas exigiria dar
> permissão de `update` ao município na coleção que guarda `linkEncriptado` e
> `liberado` — nunca abrir escrita na coleção que guarda o segredo, mesmo
> limitada por `hasOnly()`.

---

## Checklist de encerramento

- [ ] `npm run typecheck` limpo
- [ ] `npm run lint` limpo
- [ ] `npm run build` sem erro
- [ ] `npx firebase deploy --only firestore:rules,firestore:indexes`
- [ ] `npx firebase deploy --only hosting`
- [ ] `CLAUDE.md` atualizado: nova coleção `acessos` na seção 4 e a nova
      permissão de escrita do município na seção 6
- [ ] Data de início de coleta anotada no código (armadilha #6)
