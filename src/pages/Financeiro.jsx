import { useEffect, useState } from 'react'
import axios from 'axios'

function Financeiro() {
  const hoje = new Date().toISOString().split('T')[0]

  const [movimentos, setMovimentos] = useState([])
  const [contasFixas, setContasFixas] = useState([])
  const [editando, setEditando] = useState(null)
  const [contaEditando, setContaEditando] = useState(null)
  const [abaSelecionada, setAbaSelecionada] = useState(null)

  const [form, setForm] = useState({
    tipo: 'Entrada',
    descricao: '',
    categoria: '',
    valor: '',
    forma_pagamento: 'PIX',
    status: 'Pago',
    parcelas_total: '',
    parcelas_pagas: 0,
    data_movimento: hoje
  })

  const [formConta, setFormConta] = useState({
    descricao: '',
    categoria: '',
    valor: '',
    vencimento: '',
    status: 'Pendente',
    ativo: 1
  })

  async function carregarMovimentos() {
    const resposta = await axios.get('https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/financeiro')
    setMovimentos(resposta.data)
  }

  async function carregarContasFixas() {
    const resposta = await axios.get('https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/contas-fixas')
    setContasFixas(resposta.data)
  }

  useEffect(() => {
    carregarMovimentos()
    carregarContasFixas()
  }, [])

  function alterarCampo(event) {
    const { name, value } = event.target

    const novoForm = {
      ...form,
      [name]: value
    }

    if (name === 'parcelas_total') {
      const total = Number(value || 0)
      const pagas = Number(novoForm.parcelas_pagas || 0)

      if (pagas > total && total > 0) {
        novoForm.parcelas_pagas = total
      }

      if (total > 0 && pagas < total) {
        novoForm.status = 'Pendente'
      }

      if (total > 0 && pagas >= total) {
        novoForm.status = 'Pago'
      }
    }

    if (name === 'parcelas_pagas') {
      const total = Number(novoForm.parcelas_total || 0)
      const pagas = Number(value || 0)

      if (total > 0 && pagas >= total) {
        novoForm.status = 'Pago'
      }

      if (total > 0 && pagas < total) {
        novoForm.status = 'Pendente'
      }
    }

    setForm(novoForm)
  }

  function alterarConta(event) {
    setFormConta({
      ...formConta,
      [event.target.name]: event.target.value
    })
  }

  function formatarMoeda(valor) {
    const numero = Number(String(valor || 0).replace(',', '.'))

    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  function formatarData(data) {
    if (!data) return '-'

    const partes = String(data).slice(0, 10).split('-')

    if (partes.length !== 3) return data

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  function formatarVencimento(vencimento) {
    if (!vencimento) return '-'

    const texto = String(vencimento)

    if (texto.includes('-')) {
      const partes = texto.slice(0, 10).split('-')
      return `${partes[2]}/${partes[1]}`
    }

    return `Dia ${texto}`
  }

  function statusConta(conta) {
    return conta.status || (Number(conta.pago) === 1 ? 'Pago' : 'Pendente')
  }

  function parcelasInfo(item) {
    const total = Number(item.parcelas_total || 0)
    const pagas = Number(item.parcelas_pagas || 0)
    const faltam = Math.max(total - pagas, 0)

    return { total, pagas, faltam }
  }

  function classeStatus(status) {
    return status === 'Pago' ? 'badge success' : 'badge warning'
  }

  async function salvarMovimento(event) {
    event.preventDefault()

    if (!form.descricao || !form.valor || !form.data_movimento) {
      alert('Preencha descrição, valor e data')
      return
    }

    const totalParcelas = Number(form.parcelas_total || 0)
    const parcelasPagas = Number(form.parcelas_pagas || 0)

    if (totalParcelas > 0 && parcelasPagas > totalParcelas) {
      alert('Parcelas pagas não pode ser maior que o total de parcelas')
      return
    }

    const dados = {
      ...form,
      valor: String(form.valor).replace(',', '.'),
      status:
        totalParcelas > 0
          ? parcelasPagas >= totalParcelas
            ? 'Pago'
            : 'Pendente'
          : form.status
    }

    if (editando !== null) {
      await axios.put(`https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/financeiro/${editando}`, dados)
    } else {
      await axios.post('https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/financeiro', dados)
    }

    setForm({
      tipo: 'Entrada',
      descricao: '',
      categoria: '',
      valor: '',
      forma_pagamento: 'PIX',
      status: 'Pago',
      parcelas_total: '',
      parcelas_pagas: 0,
      data_movimento: hoje
    })

    setEditando(null)
    carregarMovimentos()
  }

  async function salvarContaFixa(event) {
    event.preventDefault()

    if (!formConta.descricao || !formConta.valor || !formConta.vencimento) {
      alert('Preencha descrição, valor e vencimento')
      return
    }

    const dados = {
      ...formConta,
      valor: String(formConta.valor).replace(',', '.')
    }

    if (contaEditando !== null) {
      await axios.put(`https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/contas-fixas/${contaEditando}`, dados)
    } else {
      await axios.post('https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/contas-fixas', dados)
    }

    setFormConta({
      descricao: '',
      categoria: '',
      valor: '',
      vencimento: '',
      status: 'Pendente',
      ativo: 1
    })

    setContaEditando(null)
    carregarContasFixas()
  }

  function editarMovimento(item) {
    setForm({
      tipo: item.tipo || 'Entrada',
      descricao: item.descricao || '',
      categoria: item.categoria || '',
      valor: item.valor || '',
      forma_pagamento: item.forma_pagamento || 'PIX',
      status: item.status || 'Pago',
      parcelas_total: item.parcelas_total || '',
      parcelas_pagas: item.parcelas_pagas || 0,
      data_movimento: item.data_movimento ? item.data_movimento.slice(0, 10) : hoje
    })

    setEditando(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function editarContaFixa(conta) {
    setFormConta({
      descricao: conta.descricao || '',
      categoria: conta.categoria || '',
      valor: conta.valor || '',
      vencimento: conta.vencimento || '',
      status: statusConta(conta),
      ativo: conta.ativo ?? 1
    })

    setContaEditando(conta.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function excluirMovimento(id) {
    if (!confirm('Deseja excluir este lançamento?')) return

    await axios.delete(`https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/financeiro/${id}`)
    carregarMovimentos()
  }

  async function excluirContaFixa(id) {
    if (!confirm('Deseja excluir esta conta fixa?')) return

    await axios.delete(`https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/contas-fixas/${id}`)
    carregarContasFixas()
  }

  async function marcarContaComoPago(conta) {
    const novoStatus = statusConta(conta) === 'Pago' ? 'Pendente' : 'Pago'

    await axios.put(`https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/contas-fixas/${conta.id}`, {
      ...conta,
      status: novoStatus
    })

    carregarContasFixas()
  }

  async function marcarMovimentoComoPago(item) {
    await axios.put(`https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/financeiro/${item.id}`, {
      ...item,
      status: 'Pago'
    })

    carregarMovimentos()
  }

  async function lancarContaNoFinanceiro(conta) {
    await axios.post('https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/financeiro', {
      tipo: 'Saída',
      descricao: `Conta fixa - ${conta.descricao}`,
      categoria: conta.categoria || 'Conta fixa',
      valor: conta.valor,
      forma_pagamento: 'PIX',
      status: 'Pago',
      parcelas_total: '',
      parcelas_pagas: 0,
      data_movimento: hoje
    })

    await axios.put(`https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/contas-fixas/${conta.id}`, {
      ...conta,
      status: 'Pago'
    })

    alert('Conta lançada no financeiro e marcada como paga!')
    carregarMovimentos()
    carregarContasFixas()
  }

  async function receberProximaParcela(item) {
    const { total, pagas } = parcelasInfo(item)

    if (!total) {
      alert('Esse lançamento não possui parcelamento')
      return
    }

    if (pagas >= total) {
      alert('Todas as parcelas já foram pagas')
      return
    }

    const novasPagas = pagas + 1

    await axios.put(`https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/financeiro/${item.id}`, {
      ...item,
      parcelas_pagas: novasPagas,
      status: novasPagas >= total ? 'Pago' : 'Pendente'
    })

    carregarMovimentos()
  }

  function renderizarCardsDivisao() {
    const entradasLista = movimentos.filter((item) => item.tipo === 'Entrada')
    const saidasLista = movimentos.filter((item) => item.tipo === 'Saída')
    const contasPagas = contasFixas.filter((conta) => statusConta(conta) === 'Pago')
    const contasPendentes = contasFixas.filter((conta) => statusConta(conta) !== 'Pago')
    const lancamentosPendentes = movimentos.filter((item) => item.status === 'Pendente')
    const parcelados = movimentos.filter((item) => Number(item.parcelas_total || 0) > 0)

    const divisoes = [
      {
        chave: 'Entradas',
        titulo: '🟢 Entradas',
        quantidade: entradasLista.length,
        total: entradasLista.reduce((t, item) => t + Number(item.valor || 0), 0)
      },
      {
        chave: 'Saídas',
        titulo: '🔴 Saídas',
        quantidade: saidasLista.length,
        total: saidasLista.reduce((t, item) => t + Number(item.valor || 0), 0)
      },
      {
        chave: 'Lançamentos',
        titulo: '📒 Lançamentos',
        quantidade: movimentos.length,
        total: movimentos.reduce((t, item) => t + Number(item.valor || 0), 0)
      },
      {
        chave: 'Parcelados',
        titulo: '💳 Parcelados',
        quantidade: parcelados.length,
        total: parcelados.reduce((t, item) => t + Number(item.valor || 0), 0)
      },
      {
        chave: 'Contas Fixas',
        titulo: '📅 Contas Fixas',
        quantidade: contasFixas.length,
        total: contasFixas.reduce((t, conta) => t + Number(conta.valor || 0), 0)
      },
      {
        chave: 'Pagas',
        titulo: '✅ Contas Pagas',
        quantidade: contasPagas.length,
        total: contasPagas.reduce((t, conta) => t + Number(conta.valor || 0), 0)
      },
      {
        chave: 'Pendentes',
        titulo: '⚠️ Pendentes',
        quantidade: contasPendentes.length + lancamentosPendentes.length,
        total:
          contasPendentes.reduce((t, conta) => t + Number(conta.valor || 0), 0) +
          lancamentosPendentes.reduce((t, item) => t + Number(item.valor || 0), 0)
      }
    ]

    return (
      <div className="card" style={{ marginTop: '28px' }}>
        <div className="table-header">
          <div>
            <h2>📂 Organização financeira</h2>
            <p>Clique em uma divisão para visualizar os dados separados.</p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '14px',
            marginTop: '18px'
          }}
        >
          {divisoes.map((divisao) => {
            const ativo = abaSelecionada === divisao.chave

            return (
              <button
                key={divisao.chave}
                type="button"
                onClick={() => setAbaSelecionada(ativo ? null : divisao.chave)}
                className="card"
                style={{
                  margin: 0,
                  padding: '18px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: ativo ? '2px solid #22c55e' : undefined
                }}
              >
                <h3 style={{ marginTop: 0 }}>{divisao.titulo}</h3>

                <p style={{ margin: '6px 0' }}>
                  Registros: <strong>{divisao.quantidade}</strong>
                </p>

                <p style={{ margin: '6px 0' }}>
                  Total: <strong>{formatarMoeda(divisao.total)}</strong>
                </p>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  function renderizarTabelaMovimentos(lista, titulo, vazioTexto) {
    return (
      <div className="card table-card" style={{ marginTop: '18px' }}>
        <div className="table-header">
          <h2>{titulo}</h2>
          <span>{lista.length} registro(s)</span>
        </div>

        {lista.length === 0 ? (
          <p style={{ padding: '18px 0' }}>{vazioTexto}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Pagamento</th>
                <th>Status</th>
                <th>Parcelamento</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {lista.map(item => {
                const { total, pagas, faltam } = parcelasInfo(item)
                const pago = item.status === 'Pago'

                return (
                  <tr key={item.id}>
                    <td>{formatarData(item.data_movimento)}</td>
                    <td>{item.tipo}</td>
                    <td>{item.descricao}</td>
                    <td>{item.categoria}</td>
                    <td>{formatarMoeda(item.valor)}</td>
                    <td>{item.forma_pagamento}</td>
                    <td>
                      <span className={classeStatus(item.status)}>
                        {pago ? '✅ Pago' : '⚠️ Pendente'}
                      </span>
                    </td>
                    <td>
                      {total > 0 ? (
                        <div>
                          <strong>{pagas}/{total}</strong>
                          <br />
                          <small>
                            Pagas: {pagas} | Faltam: {faltam}
                          </small>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {total > 0 && pagas < total && (
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() => receberProximaParcela(item)}
                        >
                          Receber parcela
                        </button>
                      )}

                      {!pago && total === 0 && (
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() => marcarMovimentoComoPago(item)}
                        >
                          Pago
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-edit"
                        onClick={() => editarMovimento(item)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => excluirMovimento(item.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    )
  }

  function renderizarTabelaContas(lista, titulo, vazioTexto) {
    return (
      <div className="card table-card" style={{ marginTop: '18px' }}>
        <div className="table-header">
          <h2>{titulo}</h2>
          <span>{lista.length} conta(s)</span>
        </div>

        {lista.length === 0 ? (
          <p style={{ padding: '18px 0' }}>{vazioTexto}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Ativo</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {lista.map(conta => {
                const pago = statusConta(conta) === 'Pago'

                return (
                  <tr
                    key={conta.id}
                    style={{
                      background: pago ? 'rgba(34, 197, 94, 0.12)' : undefined
                    }}
                  >
                    <td>{conta.descricao}</td>
                    <td>{conta.categoria}</td>
                    <td>{formatarMoeda(conta.valor)}</td>
                    <td>{formatarVencimento(conta.vencimento)}</td>
                    <td>
                      <span className={pago ? 'badge success' : 'badge warning'}>
                        {pago ? '✅ Pago' : '⚠️ Pendente'}
                      </span>
                    </td>
                    <td>
                      <span className={Number(conta.ativo) === 1 ? 'badge success' : 'badge warning'}>
                        {Number(conta.ativo) === 1 ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={pago ? 'btn-danger' : 'btn-edit'}
                        onClick={() => marcarContaComoPago(conta)}
                      >
                        {pago ? 'Voltar pendente' : 'Pago'}
                      </button>

                      <button
                        type="button"
                        className="btn-edit"
                        onClick={() => lancarContaNoFinanceiro(conta)}
                      >
                        Lançar
                      </button>

                      <button
                        type="button"
                        className="btn-edit"
                        onClick={() => editarContaFixa(conta)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => excluirContaFixa(conta.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    )
  }

  const entradasLista = movimentos.filter(item => item.tipo === 'Entrada')
  const saidasLista = movimentos.filter(item => item.tipo === 'Saída')
  const contasPagas = contasFixas.filter(conta => statusConta(conta) === 'Pago')
  const contasPendentes = contasFixas.filter(conta => statusConta(conta) !== 'Pago')
  const lancamentosPendentes = movimentos.filter(item => item.status === 'Pendente')
  const parcelados = movimentos.filter(item => Number(item.parcelas_total || 0) > 0)

  const entradas = entradasLista.reduce((total, item) => total + Number(item.valor || 0), 0)
  const saidas = saidasLista.reduce((total, item) => total + Number(item.valor || 0), 0)
  const saldo = entradas - saidas

  const totalContasFixas = contasFixas
    .filter(conta => Number(conta.ativo) === 1)
    .reduce((total, conta) => total + Number(conta.valor || 0), 0)

  const totalPendentes =
    contasPendentes.reduce((total, conta) => total + Number(conta.valor || 0), 0) +
    lancamentosPendentes.reduce((total, item) => total + Number(item.valor || 0), 0)

  return (
    <main className="content">
      <div className="dashboard-header">
        <div>
          <h1>💵 Financeiro</h1>
          <p>Controle de entradas, saídas, lançamentos, parcelas e contas fixas</p>
        </div>
      </div>

      <div className="cards stats-grid">
        <div className="card stat-card">
          <div>
            <span>Entradas</span>
            <strong>{formatarMoeda(entradas)}</strong>
          </div>
          <div className="stat-icon green">💰</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>Saídas</span>
            <strong>{formatarMoeda(saidas)}</strong>
          </div>
          <div className="stat-icon yellow">📉</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>Saldo</span>
            <strong>{formatarMoeda(saldo)}</strong>
          </div>
          <div className="stat-icon blue">🏦</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>Contas Fixas</span>
            <strong>{formatarMoeda(totalContasFixas)}</strong>
          </div>
          <div className="stat-icon yellow">📅</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>Pendentes</span>
            <strong>{formatarMoeda(totalPendentes)}</strong>
          </div>
          <div className="stat-icon red">⚠️</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '28px' }}>
        <h2>{editando ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>

        <form onSubmit={salvarMovimento}>
          <select name="tipo" value={form.tipo} onChange={alterarCampo}>
            <option>Entrada</option>
            <option>Saída</option>
          </select>

          <input
            type="date"
            name="data_movimento"
            value={form.data_movimento}
            onChange={alterarCampo}
          />

          <input
            type="text"
            name="descricao"
            placeholder="Descrição"
            value={form.descricao}
            onChange={alterarCampo}
          />

          <input
            type="text"
            name="categoria"
            placeholder="Categoria"
            value={form.categoria}
            onChange={alterarCampo}
          />

          <input
            type="number"
            step="0.01"
            name="valor"
            placeholder="Valor"
            value={form.valor}
            onChange={alterarCampo}
          />

          <select
            name="forma_pagamento"
            value={form.forma_pagamento}
            onChange={alterarCampo}
          >
            <option>PIX</option>
            <option>Dinheiro</option>
            <option>Cartão Débito</option>
            <option>Cartão Crédito</option>
            <option>Cartão Crédito Parcelado</option>
            <option>Parcelado</option>
          </select>

          <select name="status" value={form.status} onChange={alterarCampo}>
            <option>Pago</option>
            <option>Pendente</option>
          </select>

          <input
            type="number"
            name="parcelas_total"
            placeholder="Total de parcelas. Ex: 10"
            value={form.parcelas_total}
            onChange={alterarCampo}
          />

          <input
            type="number"
            name="parcelas_pagas"
            placeholder="Parcelas pagas. Ex: 2"
            value={form.parcelas_pagas}
            onChange={alterarCampo}
          />

          {Number(form.parcelas_total || 0) > 0 && (
            <div
              className="card"
              style={{
                margin: 0,
                padding: '14px',
                gridColumn: '1 / -1'
              }}
            >
              <strong>Controle de parcelas:</strong>{' '}
              {form.parcelas_pagas || 0}/{form.parcelas_total || 0} pagas — faltam{' '}
              {Math.max(Number(form.parcelas_total || 0) - Number(form.parcelas_pagas || 0), 0)}
            </div>
          )}

          <button className="btn-primary" type="submit">
            {editando ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '28px' }}>
        <h2>{contaEditando ? 'Editar Conta Fixa' : 'Nova Conta Fixa'}</h2>

        <form onSubmit={salvarContaFixa}>
          <input
            type="text"
            name="descricao"
            placeholder="Descrição: Internet, Aluguel, Energia..."
            value={formConta.descricao}
            onChange={alterarConta}
          />

          <input
            type="text"
            name="categoria"
            placeholder="Categoria"
            value={formConta.categoria}
            onChange={alterarConta}
          />

          <input
            type="number"
            step="0.01"
            name="valor"
            placeholder="Valor mensal"
            value={formConta.valor}
            onChange={alterarConta}
          />

          <input
            type="date"
            name="vencimento"
            value={formConta.vencimento}
            onChange={alterarConta}
          />

          <select name="status" value={formConta.status} onChange={alterarConta}>
            <option>Pendente</option>
            <option>Pago</option>
          </select>

          <select name="ativo" value={formConta.ativo} onChange={alterarConta}>
            <option value={1}>Ativa</option>
            <option value={0}>Inativa</option>
          </select>

          <button className="btn-primary" type="submit">
            {contaEditando ? 'Atualizar Conta' : 'Salvar Conta Fixa'}
          </button>
        </form>
      </div>

      {renderizarCardsDivisao()}

      {abaSelecionada === 'Entradas' &&
        renderizarTabelaMovimentos(
          entradasLista,
          '🟢 Entradas',
          'Nenhuma entrada cadastrada.'
        )}

      {abaSelecionada === 'Saídas' &&
        renderizarTabelaMovimentos(
          saidasLista,
          '🔴 Saídas',
          'Nenhuma saída cadastrada.'
        )}

      {abaSelecionada === 'Lançamentos' &&
        renderizarTabelaMovimentos(
          movimentos,
          '📒 Todos os lançamentos',
          'Nenhum lançamento cadastrado.'
        )}

      {abaSelecionada === 'Parcelados' &&
        renderizarTabelaMovimentos(
          parcelados,
          '💳 Lançamentos parcelados',
          'Nenhum lançamento parcelado cadastrado.'
        )}

      {abaSelecionada === 'Contas Fixas' &&
        renderizarTabelaContas(
          contasFixas,
          '📅 Contas Fixas',
          'Nenhuma conta fixa cadastrada.'
        )}

      {abaSelecionada === 'Pagas' &&
        renderizarTabelaContas(
          contasPagas,
          '✅ Contas Pagas',
          'Nenhuma conta paga cadastrada.'
        )}

      {abaSelecionada === 'Pendentes' && (
        <>
          {renderizarTabelaContas(
            contasPendentes,
            '⚠️ Contas Fixas Pendentes',
            'Nenhuma conta fixa pendente.'
          )}

          {renderizarTabelaMovimentos(
            lancamentosPendentes,
            '⚠️ Lançamentos Pendentes',
            'Nenhum lançamento pendente.'
          )}
        </>
      )}
    </main>
  )
}

export default Financeiro
