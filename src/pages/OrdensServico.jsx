import { useEffect, useState } from 'react'
import axios from 'axios'

function OrdensServico() {
  const hoje = new Date().toISOString().split('T')[0]

  const [ordens, setOrdens] = useState([])
  const [clientes, setClientes] = useState([])
  const [configuracao, setConfiguracao] = useState({})
  const [ordemEditando, setOrdemEditando] = useState(null)

  const [form, setForm] = useState({
    numero: '',
    data_abertura: hoje,
    data_prevista: '',
    data_conclusao: '',
    cliente: '',
    telefone: '',
    cpf: '',
    endereco: '',
    equipamento: '',
    marca: '',
    modelo: '',
    defeito: '',
    servico: '',
    acessorios: '',
    valor: '',
    status: 'Recebido'
  })

  async function carregarOrdens() {
    const resposta = await axios.get('http://https://tech-line-backend.onrender.com/ordens')
    setOrdens(resposta.data)
  }

  async function carregarClientes() {
    const resposta = await axios.get('http://https://tech-line-backend.onrender.com/clientes')
    setClientes(resposta.data)
  }

  async function carregarConfiguracao() {
    const resposta = await axios.get('http://https://tech-line-backend.onrender.com/configuracoes')
    setConfiguracao(resposta.data || {})
  }

  useEffect(() => {
    carregarOrdens()
    carregarClientes()
    carregarConfiguracao()
  }, [])

  function alterarCampo(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    })
  }

  function selecionarCliente(event) {
    const clienteSelecionado = clientes.find(
      cliente => cliente.nome === event.target.value
    )

    if (!clienteSelecionado) {
      setForm({
        ...form,
        cliente: '',
        telefone: '',
        cpf: '',
        endereco: ''
      })
      return
    }

    setForm({
      ...form,
      cliente: clienteSelecionado.nome,
      telefone: clienteSelecionado.telefone || '',
      cpf: clienteSelecionado.cpf || '',
      endereco: clienteSelecionado.endereco || ''
    })
  }

  function buscarDadosCliente(nomeCliente) {
    return clientes.find(cliente => cliente.nome === nomeCliente) || {}
  }

  async function salvarOS(event) {
    event.preventDefault()

    if (!form.cliente || !form.equipamento || !form.defeito) {
      alert('Preencha cliente, equipamento e defeito relatado')
      return
    }

    const numeroOS = form.numero || `OS-${String(Date.now()).slice(-6)}`

    const dadosParaSalvar = {
  numero: numeroOS,
  data_abertura: form.data_abertura,
  data_prevista: form.data_prevista,
  data_conclusao: form.data_conclusao,
  cliente: form.cliente,
  equipamento: form.equipamento,
  marca: form.marca,
  modelo: form.modelo,
  defeito: form.defeito,
  servico: form.servico,
  acessorios: form.acessorios,
  valor: form.valor,
  status: form.status
    }

    if (ordemEditando !== null) {
      await axios.put(`http://https://tech-line-backend.onrender.com/ordens/${ordemEditando}`, dadosParaSalvar)
    } else {
      await axios.post('http://https://tech-line-backend.onrender.com/ordens', dadosParaSalvar)
    }

    setForm({
      numero: '',
      data_abertura: hoje,
      data_prevista: '',
      data_conclusao: '',
      cliente: '',
      telefone: '',
      cpf: '',
      endereco: '',
      equipamento: '',
      marca: '',
      modelo: '',
      defeito: '',
      servico: '',
      acessorios: '',
      valor: '',
      status: 'Recebido'
    })

    setOrdemEditando(null)
    carregarOrdens()
  }

  function editarOS(index) {
    const ordem = ordens[index]
    const clienteEncontrado = buscarDadosCliente(ordem.cliente)

    setForm({
      numero: ordem.numero || '',
      data_abertura: ordem.data_abertura ? ordem.data_abertura.slice(0, 10) : hoje,
      data_prevista: ordem.data_prevista ? ordem.data_prevista.slice(0, 10) : '',
      data_conclusao: ordem.data_conclusao ? ordem.data_conclusao.slice(0, 10) : '',
      cliente: ordem.cliente || '',
      telefone: clienteEncontrado.telefone || '',
      cpf: clienteEncontrado.cpf || '',
      endereco: clienteEncontrado.endereco || '',
      equipamento: ordem.equipamento || '',
      marca: ordem.marca || '',
      modelo: ordem.modelo || '',
      defeito: ordem.defeito || '',
      servico: ordem.servico || '',
      acessorios: ordem.acessorios || '',
      valor: ordem.valor || '',
      status: ordem.status || 'Recebido'
    })

    setOrdemEditando(ordem.id)
  }

  async function excluirOS(id) {
    if (!confirm('Tem certeza que deseja excluir esta OS?')) return

    await axios.delete(`http://https://tech-line-backend.onrender.com/ordens/${id}`)
    carregarOrdens()
  }

  function formatarData(data) {
    if (!data) return '-'

    const partes = data.slice(0, 10).split('-')
    if (partes.length !== 3) return '-'

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  function limparTelefone(telefone) {
    return String(telefone || '').replace(/\D/g, '')
  }

  function imprimirOS(ordem) {
    const clienteDados = buscarDadosCliente(ordem.cliente)
    const janela = window.open('', '_blank')

    janela.document.write(`
      <html>
        <head>
          <title>OS ${ordem.numero || ordem.id}</title>

          <style>
            @page {
              size: A4;
              margin: 8mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 0;
              color: #111;
              background: #fff;
            }

            .print-btn {
              margin: 10px;
              padding: 10px 16px;
              border: none;
              border-radius: 8px;
              background: #0057ff;
              color: white;
              font-weight: bold;
              cursor: pointer;
            }

            .pagina {
              width: 100%;
              max-width: 980px;
              margin: 0 auto;
              border: 2px solid #07111f;
              background: white;
              overflow: hidden;
            }

            .topo {
              display: grid;
              grid-template-columns: 190px 1fr 230px;
              gap: 22px;
              padding: 26px 34px 18px;
              align-items: center;
            }

            .logo-box {
              border-right: 3px solid #0057ff;
              padding-right: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .logo {
              width: 145px;
              height: 145px;
              object-fit: contain;
              border-radius: 50%;
            }

            .empresa h1 {
              margin: 0;
              font-size: 42px;
              line-height: 1;
              letter-spacing: 1px;
              color: #07111f;
            }

            .empresa h1 span {
              color: #0057ff;
            }

            .empresa .sub {
              margin-top: 10px;
              font-size: 20px;
              letter-spacing: 9px;
              font-weight: bold;
            }

            .empresa .desc {
              margin: 9px 0 14px;
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
            }

            .empresa p {
              margin: 6px 0;
              font-size: 14px;
            }

            .os-box {
              border: 1px solid #333;
              border-radius: 10px;
              overflow: hidden;
              align-self: stretch;
            }

            .os-box .titulo-os {
              background: linear-gradient(90deg, #0057ff, #003bb5);
              color: #fff;
              text-align: center;
              padding: 13px 8px;
              font-size: 18px;
              font-weight: bold;
              text-transform: uppercase;
            }

            .os-box .numero {
              background: #06142e;
              color: #fff;
              text-align: center;
              padding: 18px 8px;
              font-size: 23px;
            }

            .os-box .numero strong {
              color: #1e88ff;
              font-size: 31px;
              letter-spacing: 2px;
            }

            .os-box .datas {
              padding: 14px 18px;
              font-size: 14px;
              line-height: 2.1;
            }

            .conteudo {
              padding: 0 34px 18px;
            }

            .bloco {
              border: 2px solid #0057ff;
              border-radius: 10px;
              margin-top: 18px;
              padding: 38px 22px 18px;
              position: relative;
            }

            .tag {
              position: absolute;
              top: -17px;
              left: -2px;
              background: linear-gradient(90deg, #0057ff, #0040c9);
              color: white;
              padding: 10px 26px;
              border-radius: 9px;
              font-size: 17px;
              font-weight: bold;
              text-transform: uppercase;
            }

            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 14px 28px;
            }

            .grid-3 {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 14px 22px;
            }

            .campo {
              border-bottom: 1px solid #888;
              min-height: 28px;
              font-size: 14px;
              padding-bottom: 4px;
            }

            .campo strong {
              margin-right: 6px;
            }

            .tabela-box {
              margin-top: 20px;
              border: 1px solid #999;
              border-radius: 9px;
              overflow: hidden;
            }

            .tabela-titulo {
              background: #06142e;
              color: white;
              text-align: center;
              font-size: 19px;
              font-weight: bold;
              padding: 9px;
              text-transform: uppercase;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th {
              background: #0057ff;
              color: white;
              padding: 9px 6px;
              border: 1px solid #aac4ff;
              font-size: 13px;
              text-transform: uppercase;
            }

            td {
              border: 1px solid #bbb;
              padding: 10px 8px;
              font-size: 14px;
              min-height: 38px;
            }

            .area-baixa {
              display: grid;
              grid-template-columns: 1.15fr 1fr;
              gap: 28px;
              margin-top: 18px;
            }

            .pagamento, .resumo, .observacoes {
              border: 2px solid #0057ff;
              border-radius: 10px;
              position: relative;
              padding: 36px 20px 18px;
            }

            .opcoes {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px 22px;
              font-size: 14px;
            }

            .check {
              display: inline-block;
              width: 15px;
              height: 15px;
              border: 1px solid #555;
              margin-right: 8px;
              vertical-align: middle;
            }

            .resumo-linha {
              display: flex;
              justify-content: space-between;
              border-bottom: 1px solid #999;
              padding: 8px 0;
              font-size: 15px;
              font-weight: bold;
            }

            .total-box {
              margin-top: 12px;
              background: linear-gradient(90deg, #06142e, #0062ff);
              color: white;
              border-radius: 10px;
              padding: 18px 22px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-weight: bold;
            }

            .total-box .label {
              font-size: 27px;
            }

            .total-box .valor {
              font-size: 48px;
              letter-spacing: 1px;
            }

            .observacoes {
              margin-top: 22px;
              min-height: 140px;
            }

            .obs-linha {
              border-bottom: 1px solid #777;
              min-height: 28px;
              margin-top: 10px;
            }

            .assinaturas {
              margin-top: 18px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              border: 1px solid #777;
              border-radius: 9px;
              overflow: hidden;
            }

            .assinaturas div {
              min-height: 82px;
              padding: 12px;
              text-align: center;
              font-size: 12px;
              font-weight: bold;
              position: relative;
            }

            .assinaturas div:first-child {
              border-right: 1px solid #777;
            }

            .assinaturas span {
              position: absolute;
              left: 18px;
              right: 18px;
              bottom: 16px;
              border-bottom: 1px solid #555;
            }

            .rodape {
              margin-top: 14px;
              background: #06142e;
              color: white;
              padding: 18px 34px;
              text-align: center;
            }

            .rodape .obrigado {
              color: #008cff;
              font-size: 29px;
              font-style: italic;
              margin-bottom: 4px;
            }

            .rodape strong {
              font-size: 20px;
              letter-spacing: 3px;
            }

            @media print {
              .print-btn {
                display: none;
              }

              body {
                padding: 0;
              }

              .pagina {
                border: none;
                max-width: none;
              }
            }
          </style>
        </head>

        <body>
          <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>

          <div class="pagina">
            <div class="topo">
              <div class="logo-box">
                <img src="/logo.png" class="logo" />
              </div>

              <div class="empresa">
                <h1>TECH <span>LINE</span></h1>
                <div class="sub">INFORMÁTICA</div>
                <div class="desc">Assistência Técnica • Manutenção • Venda de Peças • Informática</div>
                <p>📞 <strong>${configuracao.telefone || configuracao.whatsapp || '-'}</strong></p>
                <p>📍 ${configuracao.endereco || 'Endereço não informado'}</p>
                <p>🌐 ${configuracao.email || 'techlineinformatica.com.br'}</p>
              </div>

              <div class="os-box">
                <div class="titulo-os">Ordem de Serviço</div>
                <div class="numero">Nº <strong>${String(ordem.numero || ordem.id).replace('OS-', '').padStart(6, '0')}</strong></div>
                <div class="datas">
                  <strong>DATA:</strong> ${formatarData(ordem.data_abertura)}<br />
                  <strong>PREV.:</strong> ${formatarData(ordem.data_prevista)}
                </div>
              </div>
            </div>

            <div class="conteudo">
              <div class="bloco">
                <div class="tag">Dados do Cliente</div>
                <div class="grid-2">
                  <div class="campo"><strong>NOME:</strong> ${ordem.cliente || '-'}</div>
                  <div class="campo"><strong>CPF:</strong> ${clienteDados.cpf || '-'}</div>
                  <div class="campo"><strong>TELEFONE:</strong> ${clienteDados.telefone || '-'}</div>
                  <div class="campo"><strong>ENDEREÇO:</strong> ${clienteDados.endereco || '-'}</div>
                </div>
              </div>

              <div class="tabela-box">
                <div class="tabela-titulo">Equipamento / Serviços</div>
                <table>
                  <thead>
                    <tr>
                      <th>Cód.</th>
                      <th>Descrição</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${ordem.numero || ordem.id}</td>
                      <td>
                        <strong>Equip.:</strong> ${ordem.equipamento || '-'}<br />
                        <strong>Defeito:</strong> ${ordem.defeito || '-'}<br />
                        <strong>Serviço:</strong> ${ordem.servico || '-'}<br />
                        <strong>Acessórios:</strong> ${ordem.acessorios || '-'}
                      </td>
                      <td>${ordem.marca || '-'}</td>
                      <td>${ordem.modelo || '-'}</td>
                      <td>${ordem.valor || '0,00'}</td>
                    </tr>
                    <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
                  </tbody>
                </table>
              </div>

              <div class="area-baixa">
                <div>
                  <div class="observacoes">
                    <div class="tag">Observações</div>
                    <div class="obs-linha">${configuracao.mensagem_os || 'Declaro estar ciente das informações descritas nesta Ordem de Serviço.'}</div>
                    <div class="obs-linha"></div>
                    <div class="obs-linha"></div>
                  </div>
                </div>

                <div>
                  <div class="resumo">
                    <div class="tag">Resumo Financeiro</div>
                    <div class="resumo-linha"><span>Abertura:</span><span>${formatarData(ordem.data_abertura)}</span></div>
                    <div class="resumo-linha"><span>Conclusão:</span><span>${formatarData(ordem.data_conclusao)}</span></div>
                  </div>

                  <div class="total-box">
                    <div class="label">TOTAL<br />R$</div>
                    <div class="valor">${ordem.valor || '0,00'}</div>
                  </div>

                  <div class="assinaturas">
                    <div>ASSINATURA DO CLIENTE <span></span></div>
                    <div>ASSINATURA DO RESPONSÁVEL <span></span></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="rodape">
              <div class="obrigado">Obrigado pela preferência!</div>
              <strong>TECH LINE INFORMÁTICA</strong><br />
              Soluções em informática com qualidade e confiança.
            </div>
          </div>
        </body>
      </html>
    `)

    janela.document.close()
  }

  function imprimirCupom(ordem) {
    const clienteDados = buscarDadosCliente(ordem.cliente)
    const janela = window.open('', '_blank')

    janela.document.write(`
      <html>
        <head>
          <title>Cupom OS ${ordem.numero || ordem.id}</title>
          <style>
            body {
              font-family: monospace;
              width: 280px;
              padding: 10px;
              color: #000;
              font-size: 12px;
            }

            .logo-cupom {
              width: 70px;
              height: 70px;
              object-fit: contain;
              display: block;
              margin: 0 auto 6px;
            }

            h2, h3 {
              text-align: center;
              margin: 4px 0;
            }

            p {
              margin: 4px 0;
            }

            .linha {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }

            @media print {
              button {
                display: none;
              }

              body {
                margin: 0;
              }
            }
          </style>
        </head>

        <body>
          <button onclick="window.print()">🧾 Imprimir Bematech</button>

          <img src="/logo.png" class="logo-cupom" />
          <h2>${configuracao.nome_empresa || 'TECH LINE'}</h2>
          <p>${configuracao.whatsapp || configuracao.telefone || ''}</p>
          <h3>ORDEM DE SERVICO</h3>

          <div class="linha"></div>

          <p>OS: ${ordem.numero || ordem.id}</p>
          <p>Data: ${formatarData(ordem.data_abertura)}</p>
          <p>Cliente: ${ordem.cliente || '-'}</p>
          <p>Tel: ${clienteDados.telefone || '-'}</p>

          <div class="linha"></div>

          <p>Equip: ${ordem.equipamento || '-'}</p>
          <p>Marca: ${ordem.marca || '-'}</p>
          <p>Modelo: ${ordem.modelo || '-'}</p>

          <div class="linha"></div>

          <p>Defeito:</p>
          <p>${ordem.defeito || '-'}</p>

          <p>Servico:</p>
          <p>${ordem.servico || '-'}</p>

          <div class="linha"></div>

          <p>Status: ${ordem.status || '-'}</p>
          <p>Valor: ${ordem.valor || '-'}</p>

          <div class="linha"></div>

          <p>Ass. Cliente:</p>
          <br><br>
          <p>________________________</p>

          <div class="linha"></div>

          <h3>${configuracao.mensagem_recibo || 'Obrigado pela preferencia!'}</h3>
        </body>
      </html>
    `)

    janela.document.close()
  }

  function enviarWhatsApp(ordem) {
    const clienteDados = buscarDadosCliente(ordem.cliente)
    const telefoneLimpo = limparTelefone(clienteDados.telefone)

    const mensagem = `
Olá ${ordem.cliente}, sua OS foi registrada.

OS: ${ordem.numero || ordem.id}
Equipamento: ${ordem.equipamento}
Defeito: ${ordem.defeito}
Status: ${ordem.status}
Valor: ${ordem.valor || '-'}

${configuracao.nome_empresa || 'Tech Line'} - Assistência Técnica
    `

    const link = telefoneLimpo
      ? `https://wa.me/55${telefoneLimpo}?text=${encodeURIComponent(mensagem)}`
      : `https://wa.me/?text=${encodeURIComponent(mensagem)}`

    window.open(link, '_blank')
  }

  function escolherModeloImpressao(ordem) {
    const modelo = prompt(
      'Escolha o modelo de impressão:\n\n1 - A4 / PDF\n2 - Térmica 58mm / Cupom\n3 - Térmica 80mm / Cupom'
    )

    if (modelo === '1') {
      imprimirOS(ordem)
      return
    }

    if (modelo === '2' || modelo === '3') {
      imprimirCupom(ordem)
      return
    }

    if (modelo !== null) {
      alert('Opção inválida')
    }
  }

  return (
    <main className="content">
      <div className="dashboard-header">
        <div>
          <h1>Ordens de Serviço</h1>
          <p>Controle de serviços de informática</p>
        </div>
      </div>

      <div className="card">
        <h2>{ordemEditando !== null ? 'Editar OS' : 'Nova OS'}</h2>

        <form onSubmit={salvarOS}>
          <input
            type="text"
            name="numero"
            placeholder="Número da OS"
            value={form.numero}
            onChange={alterarCampo}
          />

          <input
            type="date"
            name="data_abertura"
            value={form.data_abertura}
            onChange={alterarCampo}
          />

          <input
            type="date"
            name="data_prevista"
            value={form.data_prevista}
            onChange={alterarCampo}
          />

          <input
            type="date"
            name="data_conclusao"
            value={form.data_conclusao}
            onChange={alterarCampo}
          />

          <select
            name="cliente"
            value={form.cliente}
            onChange={selecionarCliente}
          >
            <option value="">Selecione um cliente</option>

            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.nome}>
                {cliente.nome} - {cliente.telefone}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="telefone"
            placeholder="Telefone"
            value={form.telefone}
            readOnly
          />

          <input
            type="text"
            name="cpf"
            placeholder="CPF"
            value={form.cpf}
            readOnly
          />

          <input
            type="text"
            name="endereco"
            placeholder="Endereço"
            value={form.endereco}
            readOnly
          />

          <input type="text" name="equipamento" placeholder="Equipamento" value={form.equipamento} onChange={alterarCampo} />
          <input type="text" name="marca" placeholder="Marca" value={form.marca} onChange={alterarCampo} />
          <input type="text" name="modelo" placeholder="Modelo" value={form.modelo} onChange={alterarCampo} />
          <input type="text" name="defeito" placeholder="Defeito relatado" value={form.defeito} onChange={alterarCampo} />
          <input type="text" name="servico" placeholder="Serviço realizado" value={form.servico} onChange={alterarCampo} />
          <input type="text" name="acessorios" placeholder="Acessórios entregues" value={form.acessorios} onChange={alterarCampo} />
          <input type="text" name="valor" placeholder="Valor do orçamento" value={form.valor} onChange={alterarCampo} />

          <select name="status" value={form.status} onChange={alterarCampo}>
            <option>Recebido</option>
            <option>Em diagnóstico</option>
            <option>Aguardando aprovação</option>
            <option>Em manutenção</option>
            <option>Aguardando peça</option>
            <option>Concluído</option>
            <option>Entregue</option>
            <option>Cancelado</option>
          </select>

          <button className="btn-primary" type="submit">
            {ordemEditando !== null ? 'Atualizar OS' : 'Salvar Ordem de Serviço'}
          </button>
        </form>
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h2>Ordens cadastradas</h2>
          <span>{ordens.length} OS</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>OS</th>
              <th>Abertura</th>
              <th>Prevista</th>
              <th>Cliente</th>
              <th>Equipamento</th>
              <th>Defeito</th>
              <th>Status</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {ordens.map((ordem, index) => (
              <tr key={ordem.id}>
                <td>{ordem.numero}</td>
                <td>{formatarData(ordem.data_abertura)}</td>
                <td>{formatarData(ordem.data_prevista)}</td>
                <td>{ordem.cliente}</td>
                <td>{ordem.equipamento}</td>
                <td>{ordem.defeito}</td>
                <td>
                  <span className="badge success">{ordem.status}</span>
                </td>
                <td>{ordem.valor}</td>
                <td>
                  <button type="button" className="btn-edit" onClick={() => imprimirOS(ordem)}>
                    OS / PDF
                  </button>

                  <button type="button" className="btn-edit" onClick={() => escolherModeloImpressao(ordem)}>
                    Imprimir
                  </button>

                  <button type="button" className="btn-edit" onClick={() => enviarWhatsApp(ordem)}>
                    WhatsApp
                  </button>

                  <button type="button" className="btn-edit" onClick={() => editarOS(index)}>
                    Editar
                  </button>

                  <button type="button" className="btn-danger" onClick={() => excluirOS(ordem.id)}>
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

export default OrdensServico