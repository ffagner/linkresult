import { Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { LoginPage } from '@/pages/login'
import { RecuperarSenhaPage } from '@/pages/RecuperarSenha'
import { PerfilPage } from '@/pages/Perfil'
import { NotFoundPage } from '@/pages/NotFound'
import { AcessoNegadoPage } from '@/pages/AcessoNegado'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { MunicipiosListagem } from '@/pages/admin/municipios/Listagem'
import { AvaliacoesListagem } from '@/pages/admin/avaliacoes/Listagem'
import { SeriesListagem } from '@/pages/admin/series/Listagem'
import { RelatoriosListagem } from '@/pages/admin/relatorios/Listagem'
import { RelatorioVisualizacao } from '@/pages/admin/relatorio/Visualizacao'
import { UsuariosListagem } from '@/pages/admin/usuarios/Listagem'
import { PedagogicoLayout } from '@/pages/pedagogico/PedagogicoLayout'
import { PedagogicoDashboard } from '@/pages/pedagogico/Dashboard'
import { PedagogicoRelatoriosListagem } from '@/pages/pedagogico/relatorios/Listagem'
import { PedagogicoRelatorioVisualizacao } from '@/pages/pedagogico/relatorio/Visualizacao'
import { MunicipioLayout } from '@/pages/municipio/MunicipioLayout'
import { MunicipioDashboard } from '@/pages/municipio/Dashboard'
import { MunicipioRelatorioVisualizacao } from '@/pages/municipio/relatorio/Visualizacao'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
      <Route path="/acesso-negado" element={<AcessoNegadoPage />} />

      <Route path="/perfil" element={<PrivateRoute allowedRoles={['admin', 'pedagogico', 'municipio']}><PerfilPage /></PrivateRoute>} />

      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="municipios" element={<MunicipiosListagem />} />
        <Route path="avaliacoes" element={<AvaliacoesListagem />} />
        <Route path="series" element={<SeriesListagem />} />
        <Route path="relatorios" element={<RelatoriosListagem />} />
        <Route path="relatorio/:id" element={<RelatorioVisualizacao />} />
        <Route path="usuarios" element={<UsuariosListagem />} />
      </Route>

      <Route
        path="/pedagogico"
        element={
          <PrivateRoute allowedRoles={['pedagogico']}>
            <PedagogicoLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<PedagogicoDashboard />} />
        <Route path="relatorios" element={<PedagogicoRelatoriosListagem />} />
        <Route path="relatorio/:id" element={<PedagogicoRelatorioVisualizacao />} />
      </Route>

      <Route
        path="/municipio"
        element={
          <PrivateRoute allowedRoles={['municipio']}>
            <MunicipioLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<MunicipioDashboard />} />
        <Route path="relatorio/:id" element={<MunicipioRelatorioVisualizacao />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
