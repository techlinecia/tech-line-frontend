import { BrowserRouter, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import AppRoutes from './routes/AppRoutes'
import './styles/global.css'

function AppLayout() {
  const location = useLocation()
  const usuario = localStorage.getItem('usuario_logado')
  const estaNoLogin = location.pathname === '/login'

  if (!usuario || estaNoLogin) {
    return <AppRoutes />
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main-area">
        <Header />
        <AppRoutes />
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App