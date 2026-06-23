import { Routes, Route, Navigate } from 'react-router-dom'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Clientes from '../pages/Clientes'
import OrdensServico from '../pages/OrdensServico'
import Estoque from '../pages/Estoque'
import Vendas from '../pages/Vendas'
import Financeiro from '../pages/Financeiro'
import Relatorios from '../pages/Relatorios'
import Configuracoes from '../pages/Configuracoes'

function RotaProtegida({ children }) {
  const usuario = localStorage.getItem('usuario_logado')

  if (!usuario) {
    return <Navigate to="/login" />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <RotaProtegida>
            <Dashboard />
          </RotaProtegida>
        }
      />

      <Route
        path="/clientes"
        element={
          <RotaProtegida>
            <Clientes />
          </RotaProtegida>
        }
      />

      <Route
        path="/ordens-servico"
        element={
          <RotaProtegida>
            <OrdensServico />
          </RotaProtegida>
        }
      />

      <Route
        path="/estoque"
        element={
          <RotaProtegida>
            <Estoque />
          </RotaProtegida>
        }
      />

      <Route
        path="/vendas"
        element={
          <RotaProtegida>
            <Vendas />
          </RotaProtegida>
        }
      />

      <Route
        path="/financeiro"
        element={
          <RotaProtegida>
            <Financeiro />
          </RotaProtegida>
        }
      />

      <Route
        path="/relatorios"
        element={
          <RotaProtegida>
            <Relatorios />
          </RotaProtegida>
        }
      />

      <Route
        path="/configuracoes"
        element={
          <RotaProtegida>
            <Configuracoes />
          </RotaProtegida>
        }
      />
    </Routes>
  )
}

export default AppRoutes