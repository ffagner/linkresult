import { Suspense, lazy } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/lib/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import LoadingSpinner from '@/components/lr/LoadingSpinner'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import RecuperarSenha from '@/pages/RecuperarSenha'
import MeuPerfil from '@/pages/MeuPerfil'
import NotFound from '@/pages/NotFound'
import AcessoNegado from '@/pages/AcessoNegado'

// Carregadas sob demanda por perfil — cada município baixa hoje o código de
// admin e pedagógico sem nunca usar. Ver docs/PLANO-MELHORIAS.md item 3.
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminMunicipios = lazy(() => import('@/pages/admin/AdminMunicipios'))
const AdminAvaliacoes = lazy(() => import('@/pages/admin/AdminAvaliacoes'))
const AdminSeries = lazy(() => import('@/pages/admin/AdminSeries'))
const AdminRelatorios = lazy(() => import('@/pages/admin/AdminRelatorios'))
const AdminRelatoriosLote = lazy(() => import('@/pages/admin/AdminRelatoriosLote'))
const AdminUsuarios = lazy(() => import('@/pages/admin/AdminUsuarios'))
const AdminReportViewer = lazy(() => import('@/pages/admin/AdminReportViewer'))

const PedagogicoDashboard = lazy(() => import('@/pages/pedagogico/PedagogicoDashboard'))
const PedagogicoRelatorios = lazy(() => import('@/pages/pedagogico/PedagogicoRelatorios'))
const PedagogicoReportViewer = lazy(() => import('@/pages/pedagogico/PedagogicoReportViewer'))

const MunicipioRelatorios = lazy(() => import('@/pages/municipio/MunicipioRelatorios'))
const MunicipioReportViewer = lazy(() => import('@/pages/municipio/MunicipioReportViewer'))

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LoadingSpinner size="lg" text="Carregando..." />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <Router>
          <Suspense fallback={<PageFallback />}>
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
          </Suspense>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
