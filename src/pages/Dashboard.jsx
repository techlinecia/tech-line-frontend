import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

function Dashboard() {
  const [clientes, setClientes] = useState([])
  const [ordens, setOrdens] = useState([])
  const [estoque, setEstoque] = useState([])
  const [financeiro, setFinanceiro] = useState([])
  const [vendas, setVendas] = useState([])
  const [contasFixas, setContasFixas] = useState([])

  async function carregarDados() {
    const clientesRes = await axios.get('http://localhost:3000/clientes')
    const ordensRes = await axios.get('http://localhost:3000/ordens')
    const estoqueRes = await axios.get('http://localhost:3000/estoque')
    const financeiroRes = await axios.get('http://localhost:3000/financeiro')
    const vendasRes = await axios.get('http://localhost:3000/vendas')
    const contasRes = await axios.get('http://localhost:3000/contas-fixas')

    setClientes(clientesRes.data)
    setOrdens(ordensRes.data)
    setEstoque(estoqueRes.data)
    setFinanceiro(financeiroRes.data)
    setVendas(vendasRes.data)
    setContasFixas(contasRes.data)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  function numero(valor) {
    return Number(valor || 0)
  }

  function formatarData(data) {
    if (!data) return '-'
    const partes = data.slice(0, 10).split('-')
    if (partes.length !== 3) return '-'
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  const osAbertas = ordens.filter(
    ordem =>
      ordem.status !== 'Concluído' &&
      ordem.status !== 'Entregue' &&
      ordem.status !== 'Cancelado'
  ).length

  const osConcluidas = ordens.filter(
    ordem => ordem.status === 'Concluído' || ordem.status === 'Entregue'
  ).length

  const osAguardandoPeca = ordens.filter(
    ordem => ordem.status === 'Aguardando peça'
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

  const totalContasFixas = contasFixas
    .filter(conta => Number(conta.ativo) === 1)
    .reduce((total, conta) => total + numero(conta.valor), 0)

  const ordensRecentes = ordens.slice(0, 5)

  const produtosBaixos = estoque
    .filter(item => numero(item.quantidade) <= numero(item.estoque_minimo))
    .slice(0, 5)

  const ultimasVendas = vendas.slice(0, 5)

  const graficoFinanceiro = [
    { nome: 'Entradas', valor: entradas },
    { nome: 'Saídas', valor: saidas },
    { nome: 'Contas Fixas', valor: totalContasFixas }
  ]

  const graficoOS = [
    { nome: 'Abertas', valor: osAbertas },
    { nome: 'Concluídas', valor: osConcluidas },
    { nome: 'Aguardando Peça', valor: osAguardandoPeca }
  ]

  const graficoEstoque = [
    { nome: 'Normal', valor: estoque.length - estoqueBaixo },
    { nome: 'Baixo', valor: estoqueBaixo }
  ]

  return (
    <main className="content">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral real da assistência técnica</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={() => (window.location.href = '/ordens-servico')}
          >
            + Nova OS
          </button>

          <button
            className="btn-primary"
            type="button"
            onClick={() => window.open('http://localhost:3000/backup', '_blank')}
          >
            💾 Backup
          </button>
          <button
  className="btn-primary"
  type="button"
  onClick={async () => {
    const input = document.createElement('input')

    input.type = 'file'
    input.accept = '.db'

    input.onchange = async e => {
      const arquivo = e.target.files[0]

      if (!arquivo) return

      const formData = new FormData()

      formData.append('backup', arquivo)

      try {
        const resposta = await axios.post(
          'http://localhost:3000/restaurar-backup',
          formData
        )

        alert(resposta.data.mensagem)
      } catch (erro) {
        alert('Erro ao restaurar backup')
      }
    }

    input.click()
  }}
>
  📂 Restaurar Backup
</button>
        </div>
      </div>

      <div className="cards stats-grid">
        <div className="card stat-card">
          <div>
            <span>Saldo Atual</span>
            <strong>R$ {saldo.toFixed(2)}</strong>
            <small>Entradas menos saídas</small>
          </div>
          <div className="stat-icon green">🏦</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>Total Vendido</span>
            <strong>R$ {totalVendido.toFixed(2)}</strong>
            <small>{vendas.length} venda(s)</small>
          </div>
          <div className="stat-icon blue">💰</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>OS Abertas</span>
            <strong>{osAbertas}</strong>
            <small>{ordens.length} ordem(ns) no total</small>
          </div>
          <div className="stat-icon yellow">🛠️</div>
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

      <div className="cards stats-grid" style={{ marginTop: '22px' }}>
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
            <span>Produtos</span>
            <strong>{estoque.length}</strong>
            <small>itens cadastrados</small>
          </div>
          <div className="stat-icon cyan">📦</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>OS Concluídas</span>
            <strong>{osConcluidas}</strong>
            <small>finalizadas ou entregues</small>
          </div>
          <div className="stat-icon green">✅</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>Aguardando Peça</span>
            <strong>{osAguardandoPeca}</strong>
            <small>serviços parados</small>
          </div>
          <div className="stat-icon yellow">⏳</div>
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
            <span>Contas Fixas</span>
            <strong>R$ {totalContasFixas.toFixed(2)}</strong>
            <small>despesas mensais ativas</small>
          </div>
          <div className="stat-icon blue">📅</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>Lucro Previsto</span>
            <strong>R$ {(entradas - saidas - totalContasFixas).toFixed(2)}</strong>
            <small>saldo menos contas fixas</small>
          </div>
          <div className="stat-icon green">💵</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card panel-card">
          <h2>📊 Financeiro</h2>

          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <BarChart data={graficoFinanceiro}>
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card panel-card">
          <h2>🛠️ OS por Status</h2>

          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={graficoOS}
                  dataKey="valor"
                  nameKey="nome"
                  outerRadius={65}
                  label
                >
                  {graficoOS.map((item, index) => (
                    <Cell key={index} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card panel-card">
          <h2>📦 Situação do Estoque</h2>

          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={graficoEstoque}
                  dataKey="valor"
                  nameKey="nome"
                  outerRadius={65}
                  label
                >
                  {graficoEstoque.map((item, index) => (
                    <Cell key={index} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card panel-card">
          <h2>💰 Últimas Vendas</h2>

          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <BarChart data={ultimasVendas}>
                <XAxis dataKey="item" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor_total" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card panel-card">
          <h2>Ordens Recentes</h2>

          <div className="activity-list">
            {ordensRecentes.length === 0 && (
              <div className="activity-item">
                <span>Nenhuma OS cadastrada</span>
                <strong>-</strong>
              </div>
            )}

            {ordensRecentes.map(ordem => (
              <div className="activity-item" key={ordem.id}>
                <span>
                  💻 {ordem.equipamento || ordem.cliente} - {ordem.cliente}
                </span>
                <strong>{ordem.status}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card panel-card">
          <h2>Alertas de Estoque</h2>

          <div className="activity-list">
            {produtosBaixos.length === 0 && (
              <div className="activity-item">
                <span>✅ Estoque saudável</span>
                <strong>OK</strong>
              </div>
            )}

            {produtosBaixos.map(item => (
              <div className="activity-item" key={item.id}>
                <span>📦 {item.produto}</span>
                <strong>
                  {item.quantidade}/{item.estoque_minimo}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card panel-card">
          <h2>Últimas Vendas</h2>

          <div className="activity-list">
            {ultimasVendas.length === 0 && (
              <div className="activity-item">
                <span>Nenhuma venda cadastrada</span>
                <strong>-</strong>
              </div>
            )}

            {ultimasVendas.map(venda => (
              <div className="activity-item" key={venda.id}>
                <span>🛒 {venda.item}</span>
                <strong>R$ {venda.valor_total}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card panel-card">
          <h2>Resumo Rápido</h2>

          <div className="activity-list">
            <div className="activity-item">
              <span>📅 Hoje</span>
              <strong>{formatarData(new Date().toISOString())}</strong>
            </div>

            <div className="activity-item">
              <span>🔧 Total de OS</span>
              <strong>{ordens.length}</strong>
            </div>

            <div className="activity-item">
              <span>💰 Total financeiro</span>
              <strong>R$ {saldo.toFixed(2)}</strong>
            </div>

            <div className="activity-item">
              <span>📦 Produtos cadastrados</span>
              <strong>{estoque.length}</strong>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Dashboard