import { Toaster } from '@/components/ui/toaster'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/lib/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import RecuperarSenha from '@/pages/RecuperarSenha'
import MeuPerfil from '@/pages/MeuPerfil'
import NotFound from '@/pages/NotFound'
import AcessoNegado from '@/pages/AcessoNegado'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminMunicipios from '@/pages/admin/AdminMunicipios'
import AdminAvaliacoes from '@/pages/admin/AdminAvaliacoes'
import AdminSeries from '@/pages/admin/AdminSeries'
import AdminRelatorios from '@/pages/admin/AdminRelatorios'
import AdminRelatoriosLote from '@/pages/admin/AdminRelatoriosLote'
import AdminUsuarios from '@/pages/admin/AdminUsuarios'
import AdminReportViewer from '@/pages/admin/AdminReportViewer'
import PedagogicoDashboard from '@/pages/pedagogico/PedagogicoDashboard'
import PedagogicoRelatorios from '@/pages/pedagogico/PedagogicoRelatorios'
import PedagogicoReportViewer from '@/pages/pedagogico/PedagogicoReportViewer'
import MunicipioRelatorios from '@/pages/municipio/MunicipioRelatorios'
import MunicipioReportViewer from '@/pages/municipio/MunicipioReportViewer'

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
            <Route path="/acesso-negado" element={<AcessoNegado />} />

            <Route path="/perfil" element={
              <ProtectedRoute allowedRoles={['admin', 'pedagogico', 'municipio']}>
                <MeuPerfil />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/municipios" element={<ProtectedRoute allowedRoles={['admin']}><AdminMunicipios /></ProtectedRoute>} />
            <Route path="/admin/avaliacoes" element={<ProtectedRoute allowedRoles={['admin']}><AdminAvaliacoes /></ProtectedRoute>} />
            <Route path="/admin/series" element={<ProtectedRoute allowedRoles={['admin']}><AdminSeries /></ProtectedRoute>} />
            <Route path="/admin/relatorios" element={<ProtectedRoute allowedRoles={['admin']}><AdminRelatorios /></ProtectedRoute>} />
            <Route path="/admin/relatorios/lote" element={<ProtectedRoute allowedRoles={['admin']}><AdminRelatoriosLote /></ProtectedRoute>} />
            <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsuarios /></ProtectedRoute>} />
            <Route path="/admin/relatorio/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminReportViewer /></ProtectedRoute>} />

            <Route path="/pedagogico" element={<ProtectedRoute allowedRoles={['pedagogico']}><PedagogicoDashboard /></ProtectedRoute>} />
            <Route path="/pedagogico/relatorios" element={<ProtectedRoute allowedRoles={['pedagogico']}><PedagogicoRelatorios /></ProtectedRoute>} />
            <Route path="/pedagogico/relatorio/:id" element={<ProtectedRoute allowedRoles={['pedagogico']}><PedagogicoReportViewer /></ProtectedRoute>} />

            <Route path="/municipio" element={<ProtectedRoute allowedRoles={['municipio']}><MunicipioRelatorios /></ProtectedRoute>} />
            <Route path="/municipio/relatorio/:id" element={<ProtectedRoute allowedRoles={['municipio']}><MunicipioReportViewer /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
