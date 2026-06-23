import { useEffect, useState } from 'react'
import axios from 'axios'

function Configuracoes() {
  const [configId, setConfigId] = useState(null)
  const [usuarios, setUsuarios] = useState([])

  const [config, setConfig] = useState({
    nome_empresa: '',
    cpf: '',
    telefone: '',
    whatsapp: '',
    email: '',
    endereco: '',
    mensagem_os: 'Obrigado pela preferência.',
    mensagem_recibo: 'Volte sempre!',
    impressora: 'Epson (configurar modelo depois)'
  })

  const [usuarioForm, setUsuarioForm] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil: 'Administrador'
  })

  async function carregarConfiguracoes() {
    const resposta = await axios.get('https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/configuracoes')

    if (resposta.data && resposta.data.id) {
      setConfigId(resposta.data.id)

      setConfig({
        nome_empresa: resposta.data.nome_empresa || '',
        cpf: resposta.data.cpf || '',
        telefone: resposta.data.telefone || '',
        whatsapp: resposta.data.whatsapp || '',
        email: resposta.data.email || '',
        endereco: resposta.data.endereco || '',
        mensagem_os: resposta.data.mensagem_os || 'Obrigado pela preferência.',
        mensagem_recibo: resposta.data.mensagem_recibo || 'Volte sempre!',
        impressora: resposta.data.impressora || 'Epson (configurar modelo depois)'
      })
    }
  }

  async function carregarUsuarios() {
    const resposta = await axios.get('https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/usuarios')
    setUsuarios(resposta.data)
  }

  useEffect(() => {
    carregarConfiguracoes()
    carregarUsuarios()
  }, [])

  function alterarCampo(event) {
    setConfig({
      ...config,
      [event.target.name]: event.target.value
    })
  }

  function alterarUsuario(event) {
    setUsuarioForm({
      ...usuarioForm,
      [event.target.name]: event.target.value
    })
  }

  async function salvarConfiguracoes(event) {
    event.preventDefault()

    if (configId) {
      await axios.put(`https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/configuracoes/${configId}`, config)
    } else {
      const resposta = await axios.post('https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/configuracoes', config)
      setConfigId(resposta.data.id)
    }

    alert('Configurações salvas no banco com sucesso!')
    carregarConfiguracoes()
  }

  async function salvarUsuario(event) {
    event.preventDefault()

    if (!usuarioForm.nome || !usuarioForm.email || !usuarioForm.senha) {
      alert('Preencha nome, e-mail e senha')
      return
    }

    try {
      await axios.post('https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/usuarios', usuarioForm)

      setUsuarioForm({
        nome: '',
        email: '',
        senha: '',
        perfil: 'Administrador'
      })

      alert('Usuário criado com sucesso!')
      carregarUsuarios()
    } catch (error) {
      alert('Erro ao criar usuário. Talvez esse e-mail já esteja cadastrado.')
    }
  }

  async function excluirUsuario(id) {
    if (!confirm('Deseja excluir este usuário?')) return

    await axios.delete(`https://tech-line-backend.onrender.comhttps://tech-line-backend.onrender.com/usuarios/${id}`)
    carregarUsuarios()
  }

  return (
    <main className="content">
      <div className="dashboard-header">
        <div>
          <h1>⚙️ Configurações</h1>
          <p>Dados da assistência, impressão e usuários do sistema</p>
        </div>
      </div>

      <div className="card">
        <h2>Dados da Assistência</h2>

        <form onSubmit={salvarConfiguracoes}>
          <input
            type="text"
            name="nome_empresa"
            placeholder="Nome da Assistência"
            value={config.nome_empresa}
            onChange={alterarCampo}
          />

          <input
            type="text"
            name="cpf"
            placeholder="CPF"
            value={config.cpf}
            onChange={alterarCampo}
          />

          <input
            type="text"
            name="telefone"
            placeholder="Telefone"
            value={config.telefone}
            onChange={alterarCampo}
          />

          <input
            type="text"
            name="whatsapp"
            placeholder="WhatsApp"
            value={config.whatsapp}
            onChange={alterarCampo}
          />

          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={config.email}
            onChange={alterarCampo}
          />

          <input
            type="text"
            name="endereco"
            placeholder="Endereço"
            value={config.endereco}
            onChange={alterarCampo}
          />

          <textarea
            name="mensagem_os"
            placeholder="Mensagem da Ordem de Serviço"
            value={config.mensagem_os}
            onChange={alterarCampo}
          />

          <textarea
            name="mensagem_recibo"
            placeholder="Mensagem do Recibo"
            value={config.mensagem_recibo}
            onChange={alterarCampo}
          />

          <input
            type="text"
            name="impressora"
            placeholder="Modelo da Impressora"
            value={config.impressora}
            onChange={alterarCampo}
          />

          <button className="btn-primary" type="submit">
            {configId ? 'Atualizar Configurações' : 'Salvar Configurações'}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h2>👤 Usuários do Sistema</h2>

        <form onSubmit={salvarUsuario}>
          <input
            type="text"
            name="nome"
            placeholder="Nome do usuário"
            value={usuarioForm.nome}
            onChange={alterarUsuario}
          />

          <input
            type="email"
            name="email"
            placeholder="E-mail de login"
            value={usuarioForm.email}
            onChange={alterarUsuario}
          />

          <input
            type="password"
            name="senha"
            placeholder="Senha"
            value={usuarioForm.senha}
            onChange={alterarUsuario}
          />

          <select
            name="perfil"
            value={usuarioForm.perfil}
            onChange={alterarUsuario}
          >
            <option>Administrador</option>
            <option>Funcionário</option>
          </select>

          <button className="btn-primary" type="submit">
            Criar Usuário
          </button>
        </form>
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h2>Usuários cadastrados</h2>
          <span>{usuarios.length} usuário(s)</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td>{usuario.perfil}</td>
                <td>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => excluirUsuario(usuario.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h2>🖨️ Impressão</h2>

        <p>Esses dados serão usados futuramente em:</p>

        <br />

        <ul>
          <li>Impressão de OS</li>
          <li>Recibo de Entrada</li>
          <li>Comprovante de Retirada</li>
          <li>Etiquetas</li>
        </ul>
      </div>
    </main>
  )
}

export default Configuracoes