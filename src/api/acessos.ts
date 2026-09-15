import type { DocumentData, DocumentSnapshot, QueryConstraint } from 'firebase/firestore'
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { RelatorioData } from '@/api/relatorios'

const COLLECTION = 'acessos'

/**
 * Data em que a coleta de acessos entrou em produção. Sem dados retroativos:
 * qualquer relatório aberto antes disso não tem registro. Exibir essa data
 * na tela de analytics evita que "0 acessos" pareça abandono em vez de
 * ausência de dado. Ver docs/PLANO-ANALYTICS.md armadilha #6.
 */
export const COLETA_INICIO = new Date(2026, 8, 15)

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

function fromFirestore(snapshot: DocumentSnapshot<DocumentData>): AcessoData {
  const data = snapshot.data()!
  return {
    id: snapshot.id,
    relatorioId: data.relatorioId,
    municipioId: data.municipioId,
    municipioNome: data.municipioNome || '',
    avaliacaoId: data.avaliacaoId,
    avaliacaoNome: data.avaliacaoNome || '',
    serieId: data.serieId,
    serieNome: data.serieNome || '',
    userId: data.userId,
    userNome: data.userNome || '',
    em: data.em?.toDate() || null,
  }
}

/**
 * Registra a abertura de um relatório pelo município. Nunca lança — uma
 * falha de analytics (offline, regra negada, cota) não pode impedir o
 * relatório de abrir. Ver docs/PLANO-ANALYTICS.md armadilha #5.
 */
export async function registrarAcesso(relatorio: RelatorioData, userId: string, userNome: string): Promise<void> {
  try {
    await addDoc(collection(db, COLLECTION), {
      relatorioId: relatorio.id,
      municipioId: relatorio.municipioId,
      municipioNome: relatorio.municipioNome,
      avaliacaoId: relatorio.avaliacaoId,
      avaliacaoNome: relatorio.avaliacaoNome,
      serieId: relatorio.serieId,
      serieNome: relatorio.serieNome,
      userId,
      userNome,
      em: serverTimestamp(),
    })
  } catch (err) {
    console.error('Falha ao registrar acesso (não bloqueia a visualização):', err)
  }
}

/** Acessos a partir de uma data, mais recentes primeiro. Opcionalmente restrito a um município. */
export async function listarDesde(desde: Date, municipioId?: string): Promise<AcessoData[]> {
  const clauses: QueryConstraint[] = [where('em', '>=', Timestamp.fromDate(desde))]
  if (municipioId) clauses.push(where('municipioId', '==', municipioId))
  clauses.push(orderBy('em', 'desc'))
  const snapshot = await getDocs(query(collection(db, COLLECTION), ...clauses))
  return snapshot.docs.map(fromFirestore)
}
