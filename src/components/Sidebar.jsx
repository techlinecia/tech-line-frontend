import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings
} from 'lucide-react'

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>⚡ Tech Line</h2>

      <nav className="menu">
        <Link to="/">
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link to="/clientes">
          <Users size={18} />
          Clientes
        </Link>

        <Link to="/ordens-servico">
          <Wrench size={18} />
          Ordens de Serviço
        </Link>

        <Link to="/estoque">
          <Package size={18} />
          Estoque
        </Link>

        <Link to="/vendas">
          <ShoppingCart size={18} />
          Vendas
        </Link>

        <Link to="/financeiro">
          <DollarSign size={18} />
          Financeiro
        </Link>

        <Link to="/relatorios">
          <BarChart3 size={18} />
          Relatórios
        </Link>

        <Link to="/configuracoes">
          <Settings size={18} />
          Configurações
        </Link>
      </nav>
    </aside>
  )
}

export default Sidebar