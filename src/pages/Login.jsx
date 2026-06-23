import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    senha: ''
  })

  function alterarCampo(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    })
  }

  async function entrar(event) {
    event.preventDefault()

    try {
      const resposta = await axios.post(
        'http://https://tech-line-backend.onrender.com/login',
        form
      )

      localStorage.setItem(
        'usuario_logado',
        JSON.stringify(resposta.data)
      )

      navigate('/')
    } catch (error) {
      alert('E-mail ou senha inválidos')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">TL</div>

        <h1>Tech Line</h1>

        <p>Sistema de Assistência Técnica</p>

        <form
          onSubmit={entrar}
          autoComplete="off"
        >
          <input
            type="email"
            name="email"
            placeholder="Digite seu e-mail"
            value={form.email}
            onChange={alterarCampo}
            autoComplete="off"
            spellCheck="false"
          />

          <input
            type="password"
            name="senha"
            placeholder="Digite sua senha"
            value={form.senha}
            onChange={alterarCampo}
            autoComplete="new-password"
            spellCheck="false"
          />

          <button type="submit">
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login