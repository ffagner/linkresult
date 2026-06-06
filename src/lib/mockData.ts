// Mock data for LinkResults UI demonstration

export const mockMunicipios = [
  { id: '1', nome: 'Fortaleza', estado: 'CE', createdAt: '2024-01-10' },
  { id: '2', nome: 'Sobral', estado: 'CE', createdAt: '2024-01-12' },
  { id: '3', nome: 'Juazeiro do Norte', estado: 'CE', createdAt: '2024-01-15' },
  { id: '4', nome: 'Caucaia', estado: 'CE', createdAt: '2024-02-01' },
  { id: '5', nome: 'Maracanaú', estado: 'CE', createdAt: '2024-02-05' },
  { id: '6', nome: 'Crato', estado: 'CE', createdAt: '2024-02-10' },
  { id: '7', nome: 'Iguatu', estado: 'CE', createdAt: '2024-02-15' },
  { id: '8', nome: 'Quixadá', estado: 'CE', createdAt: '2024-03-01' },
];

export const mockAvaliacoes = [
  { id: '1', nome: 'CADERNO 1', ano: 2025, createdAt: '2024-01-10' },
  { id: '2', nome: 'CADERNO 2', ano: 2025, createdAt: '2024-01-10' },
  { id: '3', nome: 'SPAECE 2025', ano: 2025, createdAt: '2024-01-15' },
  { id: '4', nome: 'SAEB 2024', ano: 2024, createdAt: '2024-02-01' },
  { id: '5', nome: 'CADERNO 3', ano: 2025, createdAt: '2024-02-10' },
];

export const mockSeries = [
  { id: '1', nome: 'Educação Infantil', ordem: 1 },
  { id: '2', nome: '1º ano', ordem: 2 },
  { id: '3', nome: '2º ano', ordem: 3 },
  { id: '4', nome: '3º ano', ordem: 4 },
  { id: '5', nome: '4º ano', ordem: 5 },
  { id: '6', nome: '5º ano', ordem: 6 },
  { id: '7', nome: '6º ano', ordem: 7 },
  { id: '8', nome: '7º ano', ordem: 8 },
  { id: '9', nome: '8º ano', ordem: 9 },
  { id: '10', nome: '9º ano', ordem: 10 },
];

export const mockRelatorios = [
  { id: '1', municipioId: '1', municipioNome: 'Fortaleza', avaliacaoId: '1', avaliacaoNome: 'CADERNO 1', serieId: '2', serieNome: '1º ano', liberado: true, liberadoEm: '2025-03-15', createdAt: '2025-03-01' },
  { id: '2', municipioId: '1', municipioNome: 'Fortaleza', avaliacaoId: '1', avaliacaoNome: 'CADERNO 1', serieId: '3', serieNome: '2º ano', liberado: true, liberadoEm: '2025-03-15', createdAt: '2025-03-01' },
  { id: '3', municipioId: '1', municipioNome: 'Fortaleza', avaliacaoId: '1', avaliacaoNome: 'CADERNO 1', serieId: '4', serieNome: '3º ano', liberado: false, liberadoEm: null, createdAt: '2025-03-01' },
  { id: '4', municipioId: '2', municipioNome: 'Sobral', avaliacaoId: '1', avaliacaoNome: 'CADERNO 1', serieId: '2', serieNome: '1º ano', liberado: true, liberadoEm: '2025-03-16', createdAt: '2025-03-02' },
  { id: '5', municipioId: '2', municipioNome: 'Sobral', avaliacaoId: '1', avaliacaoNome: 'CADERNO 1', serieId: '3', serieNome: '2º ano', liberado: false, liberadoEm: null, createdAt: '2025-03-02' },
  { id: '6', municipioId: '3', municipioNome: 'Juazeiro do Norte', avaliacaoId: '2', avaliacaoNome: 'CADERNO 2', serieId: '5', serieNome: '4º ano', liberado: true, liberadoEm: '2025-03-18', createdAt: '2025-03-05' },
  { id: '7', municipioId: '3', municipioNome: 'Juazeiro do Norte', avaliacaoId: '2', avaliacaoNome: 'CADERNO 2', serieId: '6', serieNome: '5º ano', liberado: false, liberadoEm: null, createdAt: '2025-03-05' },
  { id: '8', municipioId: '4', municipioNome: 'Caucaia', avaliacaoId: '3', avaliacaoNome: 'SPAECE 2025', serieId: '9', serieNome: '8º ano', liberado: true, liberadoEm: '2025-03-20', createdAt: '2025-03-10' },
  { id: '9', municipioId: '4', municipioNome: 'Caucaia', avaliacaoId: '3', avaliacaoNome: 'SPAECE 2025', serieId: '10', serieNome: '9º ano', liberado: true, liberadoEm: '2025-03-20', createdAt: '2025-03-10' },
  { id: '10', municipioId: '5', municipioNome: 'Maracanaú', avaliacaoId: '4', avaliacaoNome: 'SAEB 2024', serieId: '6', serieNome: '5º ano', liberado: false, liberadoEm: null, createdAt: '2025-03-12' },
];

export const mockUsuarios = [
  { id: 'u1', nome: 'Fagner Martins', email: 'admin@tendencia.edu.br', role: 'admin', municipioId: null, municipioNome: null, status: 'ativo', createdAt: '2024-01-01' },
  { id: 'u2', nome: 'Ana Pedagógica', email: 'ana@tendencia.edu.br', role: 'pedagogico', municipioId: null, municipioNome: null, status: 'ativo', createdAt: '2024-01-05' },
  { id: 'u3', nome: 'Carlos Pedagogo', email: 'carlos@tendencia.edu.br', role: 'pedagogico', municipioId: null, municipioNome: null, status: 'ativo', createdAt: '2024-01-08' },
  { id: 'u4', nome: 'Secretaria Fortaleza', email: 'secretaria@fortaleza.ce.gov.br', role: 'municipio', municipioId: '1', municipioNome: 'Fortaleza', status: 'ativo', createdAt: '2024-01-10' },
  { id: 'u5', nome: 'Gestão Sobral', email: 'gestao@sobral.ce.gov.br', role: 'municipio', municipioId: '2', municipioNome: 'Sobral', status: 'ativo', createdAt: '2024-01-12' },
  { id: 'u6', nome: 'Educação Juazeiro', email: 'educacao@juazeiro.ce.gov.br', role: 'municipio', municipioId: '3', municipioNome: 'Juazeiro do Norte', status: 'inativo', createdAt: '2024-01-15' },
  { id: 'u7', nome: 'SEMED Caucaia', email: 'semed@caucaia.ce.gov.br', role: 'municipio', municipioId: '4', municipioNome: 'Caucaia', status: 'ativo', createdAt: '2024-02-01' },
];

export const mockCurrentUser = {
  admin: { id: 'u1', nome: 'Fagner Martins', email: 'admin@tendencia.edu.br', role: 'admin' },
  pedagogico: { id: 'u2', nome: 'Ana Pedagógica', email: 'ana@tendencia.edu.br', role: 'pedagogico' },
  municipio: { id: 'u4', nome: 'Secretaria Fortaleza', email: 'secretaria@fortaleza.ce.gov.br', role: 'municipio', municipioId: '1', municipioNome: 'Fortaleza' },
};

export const estadosBrasileiros = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];