import { useEffect, useState } from 'react'
import axios from 'axios'

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [clienteEditando, setClienteEditando] = useState(null)

  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    cpf: '',
    endereco: ''
  })

  async function carregarClientes() {
    const resposta = await axios.get('https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/clientes')
    setClientes(resposta.data)
  }

  useEffect(() => {
    carregarClientes()
  }, [])

  function alterarCampo(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    })
  }

  async function salvarCliente(event) {
    event.preventDefault()

    if (!form.nome || !form.telefone) {
      alert('Preencha pelo menos nome e telefone')
      return
    }

    if (clienteEditando !== null) {
      await axios.put(`https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/clientes/${clienteEditando}`, form)
    } else {
      await axios.post('https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/clientes', form)
    }

    setForm({
      nome: '',
      telefone: '',
      cpf: '',
      endereco: ''
    })

    setClienteEditando(null)
    carregarClientes()
  }

  function editarCliente(index) {
    setForm({
      nome: clientes[index].nome || '',
      telefone: clientes[index].telefone || '',
      cpf: clientes[index].cpf || '',
      endereco: clientes[index].endereco || ''
    })

    setClienteEditando(clientes[index].id)
  }

  async function excluirCliente(id) {
    const confirmar = confirm('Tem certeza que deseja excluir este cliente?')

    if (!confirmar) {
      return
    }

    await axios.delete(`https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/clientes/${id}`)
    carregarClientes()
  }

  return (
    <main className="content">
      <div className="dashboard-header">
        <div>
          <h1>Clientes</h1>
          <p>Cadastro e histórico dos clientes</p>
        </div>
      </div>

      <div className="card">
        <h2>{clienteEditando !== null ? 'Editar Cliente' : 'Novo Cliente'}</h2>

        <form onSubmit={salvarCliente}>
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            value={form.nome}
            onChange={alterarCampo}
          />

          <input
            type="text"
            name="telefone"
            placeholder="Telefone"
            value={form.telefone}
            onChange={alterarCampo}
          />

          <input
            type="text"
            name="cpf"
            placeholder="CPF"
            value={form.cpf}
            onChange={alterarCampo}
          />

          <input
            type="text"
            name="endereco"
            placeholder="Endereço"
            value={form.endereco}
            onChange={alterarCampo}
          />

          <button className="btn-primary" type="submit">
            {clienteEditando !== null ? 'Atualizar Cliente' : 'Salvar Cliente'}
          </button>
        </form>
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h2>Clientes cadastrados</h2>
          <span>{clientes.length} cliente(s)</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>CPF</th>
              <th>Endereço</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {clientes.map((cliente, index) => (
              <tr key={cliente.id}>
                <td>{cliente.nome}</td>
                <td>{cliente.telefone}</td>
                <td>{cliente.cpf}</td>
                <td>{cliente.endereco}</td>
                <td>
                  <button
                    type="button"
                    className="btn-edit"
                    onClick={() => editarCliente(index)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => excluirCliente(cliente.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default Clientes