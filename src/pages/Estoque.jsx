import { useEffect, useState } from 'react'
import axios from 'axios'

function Estoque() {
  const [produtos, setProdutos] = useState([])
  const [produtoEditando, setProdutoEditando] = useState(null)
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)

  const [form, setForm] = useState({
    codigo: '',
    produto: '',
    categoria: '',
    fornecedor: '',
    quantidade: '',
    custo: '',
    venda: '',
    estoque_minimo: ''
  })

  const categoriasDivisorias = [
    'Cooler',
    'Placa mãe',
    'Fans',
    'Gabinete',
    'Fonte',
    'Placa de vídeo',
    'Periférico em geral'
  ]

  async function carregarProdutos() {
    const resposta = await axios.get('https://tech-line-backend.onrender.com/estoque')
    setProdutos(resposta.data)
  }

  useEffect(() => {
    carregarProdutos()
  }, [])

  function alterarCampo(event) {
    setForm({
      ...form,
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

  function normalizarTexto(texto) {
    return String(texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }

  function produtoPertenceCategoria(item, categoria) {
    const textoProduto = normalizarTexto(`${item.categoria || ''} ${item.produto || ''}`)
    const categoriaNormalizada = normalizarTexto(categoria)

    if (categoriaNormalizada === 'periferico em geral') {
      return (
        textoProduto.includes('periferico') ||
        textoProduto.includes('mouse') ||
        textoProduto.includes('teclado') ||
        textoProduto.includes('headset') ||
        textoProduto.includes('mousepad') ||
        textoProduto.includes('monitor') ||
        textoProduto.includes('webcam') ||
        textoProduto.includes('fone')
      )
    }

    return textoProduto.includes(categoriaNormalizada)
  }

  function produtosPorCategoria(categoria) {
    return produtos.filter((item) => produtoPertenceCategoria(item, categoria))
  }

  async function salvarProduto(event) {
    event.preventDefault()

    if (!form.produto) {
      alert('Preencha o nome do produto')
      return
    }

    const dadosProduto = {
      ...form,
      custo: String(form.custo).replace(',', '.'),
      venda: String(form.venda).replace(',', '.')
    }

    if (produtoEditando !== null) {
      await axios.put(`http://https://tech-line-backend.onrender.com/estoque/${produtoEditando}`, dadosProduto)
    } else {
      await axios.post('http://https://tech-line-backend.onrender.com/estoque', dadosProduto)
    }

    setForm({
      codigo: '',
      produto: '',
      categoria: '',
      fornecedor: '',
      quantidade: '',
      custo: '',
      venda: '',
      estoque_minimo: ''
    })

    setProdutoEditando(null)
    carregarProdutos()
  }

  function editarProduto(produto) {
    setForm({
      codigo: produto.codigo || '',
      produto: produto.produto || '',
      categoria: produto.categoria || '',
      fornecedor: produto.fornecedor || '',
      quantidade: produto.quantidade || '',
      custo: produto.custo || '',
      venda: produto.venda || '',
      estoque_minimo: produto.estoque_minimo || ''
    })

    setProdutoEditando(produto.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function excluirProduto(id) {
    const confirmar = confirm('Tem certeza que deseja excluir este produto?')

    if (!confirmar) return

    await axios.delete(`http://https://tech-line-backend.onrender.com/estoque/${id}`)
    carregarProdutos()
  }

  function renderizarTabela(lista, titulo, vazioTexto) {
    return (
      <div className="card table-card" style={{ marginTop: '18px' }}>
        <div className="table-header">
          <h2>{titulo}</h2>
          <span>{lista.length} produto(s)</span>
        </div>

        {lista.length === 0 ? (
          <p style={{ padding: '18px 0' }}>{vazioTexto}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Código</th>
                <th>Categoria</th>
                <th>Fornecedor</th>
                <th>Qtd</th>
                <th>Custo un.</th>
                <th>Venda un.</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {lista.map((item) => {
                const quantidade = Number(item.quantidade || 0)
                const estoqueMinimo = Number(item.estoque_minimo || 0)
                const semEstoque = quantidade <= 0
                const baixo = quantidade > 0 && quantidade <= estoqueMinimo

                return (
                  <tr key={item.id}>
                    <td>{item.produto}</td>
                    <td>{item.codigo || '-'}</td>
                    <td>{item.categoria || '-'}</td>
                    <td>{item.fornecedor || '-'}</td>
                    <td>{item.quantidade}</td>
                    <td>{formatarMoeda(item.custo)}</td>
                    <td>{formatarMoeda(item.venda)}</td>
                    <td>
                      {semEstoque ? (
                        <span className="badge danger">Sem estoque</span>
                      ) : baixo ? (
                        <span className="badge warning">Estoque baixo</span>
                      ) : (
                        <span className="badge success">Disponível</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-edit"
                        onClick={() => editarProduto(item)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => excluirProduto(item.id)}
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

  function renderizarCategorias() {
    return (
      <div className="card" style={{ marginTop: '28px' }}>
        <div className="table-header">
          <div>
            <h2>📂 Estoque por categoria</h2>
            <p>Clique em uma categoria para ver os produtos disponíveis e os sem estoque.</p>
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
          {categoriasDivisorias.map((categoria) => {
            const lista = produtosPorCategoria(categoria)
            const disponiveis = lista.filter((item) => Number(item.quantidade || 0) > 0).length
            const semEstoque = lista.filter((item) => Number(item.quantidade || 0) <= 0).length
            const ativa = categoriaSelecionada === categoria

            return (
              <button
                key={categoria}
                type="button"
                onClick={() =>
                  setCategoriaSelecionada(ativa ? null : categoria)
                }
                className="card"
                style={{
                  margin: 0,
                  padding: '18px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: ativa ? '2px solid #22c55e' : undefined
                }}
              >
                <h3 style={{ marginTop: 0 }}>{categoria}</h3>

                <p style={{ margin: '6px 0' }}>
                  📦 Total: <strong>{lista.length}</strong>
                </p>

                <p style={{ margin: '6px 0' }}>
                  ✅ Disponível: <strong>{disponiveis}</strong>
                </p>

                <p style={{ margin: '6px 0' }}>
                  ❌ Sem estoque: <strong>{semEstoque}</strong>
                </p>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const produtosDisponiveis = produtos.filter(
    (item) => Number(item.quantidade || 0) > 0
  )

  const produtosSemEstoque = produtos.filter(
    (item) => Number(item.quantidade || 0) <= 0
  )

  const produtosDaCategoriaSelecionada = categoriaSelecionada
    ? produtosPorCategoria(categoriaSelecionada)
    : []

  const disponiveisDaCategoria = produtosDaCategoriaSelecionada.filter(
    (item) => Number(item.quantidade || 0) > 0
  )

  const semEstoqueDaCategoria = produtosDaCategoriaSelecionada.filter(
    (item) => Number(item.quantidade || 0) <= 0
  )

  const totalProdutos = produtos.length

  const estoqueBaixo = produtos.filter(
    (item) =>
      Number(item.quantidade || 0) > 0 &&
      Number(item.quantidade || 0) <= Number(item.estoque_minimo || 0)
  ).length

  const valorTotalCusto = produtos.reduce(
    (total, item) =>
      total + Number(String(item.custo || 0).replace(',', '.')) * Number(item.quantidade || 0),
    0
  )

  return (
    <main className="content">
      <div className="dashboard-header">
        <div>
          <h1>📦 Estoque</h1>
          <p>Controle de peças e produtos de informática</p>
        </div>
      </div>

      <div className="cards stats-grid">
        <div className="card stat-card">
          <div>
            <span>Total de Produtos</span>
            <strong>{totalProdutos}</strong>
            <small>itens cadastrados</small>
          </div>
          <div className="stat-icon cyan">📦</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>Disponíveis</span>
            <strong>{produtosDisponiveis.length}</strong>
            <small>com estoque</small>
          </div>
          <div className="stat-icon green">✅</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>Sem Estoque</span>
            <strong>{produtosSemEstoque.length}</strong>
            <small>indisponíveis</small>
          </div>
          <div className="stat-icon red">❌</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>Estoque Baixo</span>
            <strong>{estoqueBaixo}</strong>
            <small>precisam de reposição</small>
          </div>
          <div className="stat-icon yellow">⚠️</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>Custo em Estoque</span>
            <strong>{formatarMoeda(valorTotalCusto)}</strong>
            <small>valor investido</small>
          </div>
          <div className="stat-icon blue">💰</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '28px' }}>
        <h2>{produtoEditando !== null ? 'Editar Produto' : 'Novo Produto'}</h2>

        <form onSubmit={salvarProduto}>
          <input
            type="text"
            name="codigo"
            placeholder="Código do produto"
            value={form.codigo}
            onChange={alterarCampo}
          />

          <input
            type="text"
            name="produto"
            placeholder="Produto: Mousepad, SSD 240GB, Memória RAM 8GB..."
            value={form.produto}
            onChange={alterarCampo}
          />

          <select
            name="categoria"
            value={form.categoria}
            onChange={alterarCampo}
          >
            <option value="">Selecione a categoria</option>
            <option>Cooler</option>
            <option>Placa mãe</option>
            <option>Fans</option>
            <option>Gabinete</option>
            <option>Fonte</option>
            <option>Placa de vídeo</option>
            <option>Periférico em geral</option>
            <option>Outros</option>
          </select>

          <input
            type="text"
            name="fornecedor"
            placeholder="Fornecedor"
            value={form.fornecedor}
            onChange={alterarCampo}
          />

          <input
            type="number"
            name="quantidade"
            placeholder="Quantidade disponível"
            value={form.quantidade}
            onChange={alterarCampo}
          />

          <input
            type="text"
            name="custo"
            placeholder="Preço de custo unitário. Ex: 16,20"
            value={form.custo}
            onChange={alterarCampo}
          />

          <input
            type="text"
            name="venda"
            placeholder="Preço de venda unitário"
            value={form.venda}
            onChange={alterarCampo}
          />

          <input
            type="number"
            name="estoque_minimo"
            placeholder="Estoque mínimo"
            value={form.estoque_minimo}
            onChange={alterarCampo}
          />

          <button className="btn-primary" type="submit">
            {produtoEditando !== null ? 'Atualizar Produto' : 'Salvar Produto'}
          </button>
        </form>
      </div>

      {renderizarCategorias()}

      {categoriaSelecionada && (
        <>
          <div style={{ marginTop: '28px' }}>
            <h2>Categoria selecionada: {categoriaSelecionada}</h2>
          </div>

          {renderizarTabela(
            disponiveisDaCategoria,
            '✅ Produtos disponíveis',
            'Nenhum produto disponível nessa categoria.'
          )}

          {renderizarTabela(
            semEstoqueDaCategoria,
            '❌ Produtos sem estoque',
            'Nenhum produto sem estoque nessa categoria.'
          )}
        </>
      )}
    </main>
  )
}

export default Estoque
