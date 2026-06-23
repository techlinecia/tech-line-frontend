import { useEffect, useState } from 'react'
import axios from 'axios'

function Relatorios() {
  const [clientes, setClientes] = useState([])
  const [ordens, setOrdens] = useState([])
  const [estoque, setEstoque] = useState([])
  const [financeiro, setFinanceiro] = useState([])
  const [vendas, setVendas] = useState([])

  async function carregarDados() {
    const clientesRes = await axios.get('http://https://tech-line-backend.onrender.com/clientes')
    const ordensRes = await axios.get('http://https://tech-line-backend.onrender.com/ordens')
    const estoqueRes = await axios.get('http://https://tech-line-backend.onrender.com/estoque')
    const financeiroRes = await axios.get('http://https://tech-line-backend.onrender.com/financeiro')
    const vendasRes = await axios.get('http://https://tech-line-backend.onrender.com/vendas')

    setClientes(clientesRes.data)
    setOrdens(ordensRes.data)
    setEstoque(estoqueRes.data)
    setFinanceiro(financeiroRes.data)
    setVendas(vendasRes.data)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  function numero(valor) {
    return Number(valor || 0)
  }

  function imprimirRelatorio() {
    window.print()
  }

  const osAbertas = ordens.filter(
    ordem =>
      ordem.status !== 'Concluído' &&
      ordem.status !== 'Entregue' &&
      ordem.status !== 'Cancelado'
  ).length

  const estoqueBaixo = estoque.filter(
    item => numero(item.quantidade) <= numero(item.estoque_minimo)
  ).length

  const entradas = financeiro
    .filter(item => item.tipo === 'Entrada')
    .reduce((total, item) => total + numero(item.valor), 0)

  const saidas = financeiro
    .filter(item => item.tipo === 'Saída')
    .reduce((total, item) => total + numero(item.valor), 0)

  const saldo = entradas - saidas

  const totalVendido = vendas.reduce(
    (total, venda) => total + numero(venda.valor_total),
    0
  )

  return (
    <main className="content">
      <div className="dashboard-header no-print">
        <div>
          <h1>📊 Relatórios</h1>
          <p>Resumo automático do sistema</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={imprimirRelatorio}>
            🖨️ Imprimir
          </button>

          <button className="btn-primary" onClick={imprimirRelatorio}>
            📄 Salvar PDF
          </button>
        </div>
      </div>

      <section className="print-area">
        <div className="card">
          <h2>Relatório Geral</h2>
          <p>Resumo de clientes, OS, estoque, vendas e financeiro.</p>
        </div>

        <div className="cards stats-grid" style={{ marginTop: '28px' }}>
          <div className="card stat-card">
            <div>
              <span>Clientes</span>
              <strong>{clientes.length}</strong>
              <small>clientes cadastrados</small>
            </div>
            <div className="stat-icon blue">👥</div>
          </div>

          <div className="card stat-card">
            <div>
              <span>Ordens de Serviço</span>
              <strong>{ordens.length}</strong>
              <small>{osAbertas} em aberto</small>
            </div>
            <div className="stat-icon cyan">🛠️</div>
          </div>

          <div className="card stat-card">
            <div>
              <span>Produtos</span>
              <strong>{estoque.length}</strong>
              <small>{estoqueBaixo} com estoque baixo</small>
            </div>
            <div className="stat-icon yellow">📦</div>
          </div>

          <div className="card stat-card">
            <div>
              <span>Total Vendido</span>
              <strong>R$ {totalVendido.toFixed(2)}</strong>
              <small>{vendas.length} venda(s)</small>
            </div>
            <div className="stat-icon green">💰</div>
          </div>
        </div>

        <div className="cards stats-grid" style={{ marginTop: '22px' }}>
          <div className="card stat-card">
            <div>
              <span>Entradas</span>
              <strong>R$ {entradas.toFixed(2)}</strong>
              <small>receitas registradas</small>
            </div>
            <div className="stat-icon green">📈</div>
          </div>

          <div className="card stat-card">
            <div>
              <span>Saídas</span>
              <strong>R$ {saidas.toFixed(2)}</strong>
              <small>despesas registradas</small>
            </div>
            <div className="stat-icon yellow">📉</div>
          </div>

          <div className="card stat-card">
            <div>
              <span>Saldo</span>
              <strong>R$ {saldo.toFixed(2)}</strong>
              <small>resultado atual</small>
            </div>
            <div className="stat-icon blue">🏦</div>
          </div>

          <div className="card stat-card">
            <div>
              <span>Estoque Baixo</span>
              <strong>{estoqueBaixo}</strong>
              <small>produtos em atenção</small>
            </div>
            <div className="stat-icon yellow">⚠️</div>
          </div>
        </div>

        <div className="card table-card">
          <div className="table-header">
            <h2>Produtos com estoque baixo</h2>
            <span>{estoqueBaixo} item(ns)</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Mínimo</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {estoque
                .filter(item => numero(item.quantidade) <= numero(item.estoque_minimo))
                .map(item => (
                  <tr key={item.id}>
                    <td>{item.produto}</td>
                    <td>{item.quantidade}</td>
                    <td>{item.estoque_minimo}</td>
                    <td>
                      <span className="badge warning">Estoque baixo</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default Relatorios