import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings,
  Menu,
  X
} from 'lucide-react'

function Sidebar() {
  const [aberto, setAberto] = useState(false)

  return (
    <>
        <button
        className="mobile-menu-btn"
        onClick={() => setAberto(!aberto)}
        aria-label="Abrir menu"
        >
        <span className="mobile-menu-logo">TL</span>
        {aberto ? <X size={22} /> : <Menu size={22} />}
        </button>

      <aside className={`sidebar ${aberto ? 'open' : ''}`}>
        <h2>⚡ Tech Line</h2>

        <nav className="menu">
          <Link to="/" onClick={() => setAberto(false)}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link to="/clientes" onClick={() => setAberto(false)}>
            <Users size={18} />
            Clientes
          </Link>

          <Link to="/ordens-servico" onClick={() => setAberto(false)}>
            <Wrench size={18} />
            Ordens de Serviço
          </Link>

          <Link to="/estoque" onClick={() => setAberto(false)}>
            <Package size={18} />
            Estoque
          </Link>

          <Link to="/vendas" onClick={() => setAberto(false)}>
            <ShoppingCart size={18} />
            Vendas
          </Link>

          <Link to="/financeiro" onClick={() => setAberto(false)}>
            <DollarSign size={18} />
            Financeiro
          </Link>

          <Link to="/relatorios" onClick={() => setAberto(false)}>
            <BarChart3 size={18} />
            Relatórios
          </Link>

          <Link to="/configuracoes" onClick={() => setAberto(false)}>
            <Settings size={18} />
            Configurações
          </Link>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar