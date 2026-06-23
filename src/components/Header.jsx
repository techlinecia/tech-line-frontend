import { useState } from 'react'

function Header() {
  const [menuAberto, setMenuAberto] = useState(false)

  const usuario = JSON.parse(
    localStorage.getItem('usuario_logado')
  )

  function sair() {
    localStorage.removeItem('usuario_logado')
    window.location.href = '/login'
  }

  return (
    <header className="header">
      <div>
        <h2>Tech Line</h2>
        <p>Sistema de Assistência Técnica</p>
      </div>

      <div className="header-actions">
        <input
          type="text"
          placeholder="Buscar..."
        />

        <button className="notification-btn">
          🔔
        </button>

        <div
          style={{
            position: 'relative'
          }}
        >
          <div
            className="user-avatar"
            onClick={() =>
              setMenuAberto(!menuAberto)
            }
            style={{
              cursor: 'pointer'
            }}
          >
            {usuario?.nome
              ? usuario.nome
                  .substring(0, 2)
                  .toUpperCase()
              : 'TL'}
          </div>

          {menuAberto && (
            <div className="user-menu">
              {usuario ? (
                <>
                  <strong>
                    {usuario.nome}
                  </strong>

                  <p>
                    {usuario.email}
                  </p>

                  <button
                    className="btn-danger"
                    onClick={sair}
                  >
                    🚪 Sair
                  </button>
                </>
              ) : (
                <>
                  <strong>
                    Não conectado
                  </strong>

                  <button
                    className="btn-primary"
                    onClick={() =>
                      (window.location.href =
                        '/login')
                    }
                  >
                    🔐 Login
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header