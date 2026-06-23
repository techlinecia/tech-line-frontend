import { useEffect, useState } from 'react'
import axios from 'axios'

function Vendas() {
  const hoje = new Date().toISOString().split('T')[0]

  const [vendas, setVendas] = useState([])
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [editando, setEditando] = useState(null)
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState(null)
  const [vendasSelecionadasRecibo, setVendasSelecionadasRecibo] = useState([])

  const [form, setForm] = useState({
    cliente: '',
    item: '',
    tipo: 'Produto',
    quantidade: 1,
    valor_unitario: '',
    valor_total: '',
    forma_pagamento: 'PIX',
    parcelas: '',
    origem: 'WhatsApp',
    data_venda: hoje
  })

  const formasPagamento = [
    'PIX',
    'Dinheiro',
    'Cartão Débito',
    'Cartão Crédito',
    'Cartão Crédito Parcelado',
    'Parcelado'
  ]

  async function carregarVendas() {
    const resposta = await axios.get('https://tech-line-backend.onrender.com/vendas')
    setVendas(resposta.data)
  }

  async function carregarClientes() {
    const resposta = await axios.get('https://tech-line-backend.onrender.com/clientes')
    setClientes(resposta.data)
  }

  async function carregarProdutos() {
    try {
      const resposta = await axios.get('https://tech-line-backend.onrender.com/estoque')
      setProdutos(resposta.data)
    } catch (erro) {
      try {
        const resposta = await axios.get('https://tech-line-backend.onrender.com/produtos')
        setProdutos(resposta.data)
      } catch {
        setProdutos([])
      }
    }
  }

  useEffect(() => {
    carregarVendas()
    carregarClientes()
    carregarProdutos()
  }, [])

  function nomeProduto(produto) {
    return (
      produto.nome ||
      produto.produto ||
      produto.item ||
      produto.descricao ||
      produto.modelo ||
      ''
    )
  }

  function precoProduto(produto) {
    return (
      produto.venda ||
      produto.valor_venda ||
      produto.preco_venda ||
      produto.preco ||
      produto.valor ||
      produto.valor_unitario ||
      ''
    )
  }

  function produtoDisponivel(produto) {
    const status = String(
      produto.status ||
      produto.situacao ||
      produto.disponibilidade ||
      ''
    ).toLowerCase()

    if (
      status.includes('indispon') ||
      status.includes('esgot') ||
      status.includes('inativo') ||
      status.includes('vendido')
    ) {
      return false
    }

    if (
      produto.disponivel === false ||
      produto.ativo === false
    ) {
      return false
    }

    const quantidade = Number(
      produto.quantidade ??
      produto.qtd ??
      produto.estoque ??
      produto.saldo ??
      produto.quantidade_estoque ??
      0
    )

    return quantidade > 0
  }

  const produtosDisponiveis = produtos.filter(produtoDisponivel)

  function formatarMoeda(valor) {
    const numero = Number(String(valor || 0).replace(',', '.'))

    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  function formaPagamentoBase(venda) {
    const pagamento = String(venda.forma_pagamento || '').trim()

    if (pagamento.toLowerCase().includes('cartão crédito parcelado')) {
      return 'Cartão Crédito Parcelado'
    }

    if (pagamento.toLowerCase().includes('parcelado')) {
      return 'Parcelado'
    }

    return pagamento || 'Sem forma'
  }

  function parcelasVenda(venda) {
    if (venda.parcelas) return venda.parcelas

    const pagamento = String(venda.forma_pagamento || '')
    const match = pagamento.match(/(\d+)x/i)

    return match ? match[1] : ''
  }

  function alterarCampo(event) {
    const { name, value } = event.target

    const novoForm = {
      ...form,
      [name]: value
    }

    if (name === 'item') {
      const produtoSelecionado = produtos.find(
        produto => nomeProduto(produto) === value
      )

      if (produtoSelecionado) {
        const valorProduto = precoProduto(produtoSelecionado)

        if (valorProduto !== '') {
          novoForm.valor_unitario = Number(String(valorProduto).replace(',', '.')).toFixed(2)
        }

        novoForm.tipo = 'Produto'
      }
    }

    if (
      name === 'forma_pagamento' &&
      value !== 'Parcelado' &&
      value !== 'Cartão Crédito Parcelado'
    ) {
      novoForm.parcelas = ''
    }

    if (
      name === 'forma_pagamento' &&
      (value === 'Parcelado' || value === 'Cartão Crédito Parcelado') &&
      !novoForm.parcelas
    ) {
      novoForm.parcelas = '2'
    }

    const qtd = Number(
      name === 'quantidade'
        ? value
        : novoForm.quantidade
    )

    const valor = Number(
      String(
        name === 'valor_unitario'
          ? value
          : novoForm.valor_unitario
      ).replace(',', '.')
    )

    novoForm.valor_total = qtd && valor
      ? (qtd * valor).toFixed(2)
      : ''

    setForm(novoForm)
  }

  async function salvarVenda(event) {
    event.preventDefault()

    if (!form.item || !form.valor_unitario) {
      alert('Preencha item e valor')
      return
    }

    if (
      (form.forma_pagamento === 'Parcelado' ||
        form.forma_pagamento === 'Cartão Crédito Parcelado') &&
      !form.parcelas
    ) {
      alert('Selecione a quantidade de parcelas')
      return
    }

    if (editando !== null) {
      await axios.put(
        `https://tech-line-backend.onrender.com/vendas/${editando}`,
        form
      )
    } else {
      await axios.post(
        'https://tech-line-backend.onrender.com/vendas',
        form
      )
    }

    setForm({
      cliente: '',
      item: '',
      tipo: 'Produto',
      quantidade: 1,
      valor_unitario: '',
      valor_total: '',
      forma_pagamento: 'PIX',
      parcelas: '',
      origem: 'WhatsApp',
      data_venda: hoje
    })

    setEditando(null)
    carregarVendas()
  }

  function editarVenda(venda) {
    setForm({
      cliente: venda.cliente || '',
      item: venda.item || '',
      tipo: venda.tipo || 'Produto',
      quantidade: venda.quantidade || 1,
      valor_unitario: venda.valor_unitario || '',
      valor_total: venda.valor_total || '',
      forma_pagamento: formaPagamentoBase(venda) || 'PIX',
      parcelas: parcelasVenda(venda),
      origem: venda.origem || 'WhatsApp',
      data_venda: venda.data_venda || hoje
    })

    setEditando(venda.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function excluirVenda(id) {
    const confirmar = confirm('Deseja excluir esta venda?')

    if (!confirmar) return

    await axios.delete(`https://tech-line-backend.onrender.com/vendas/${id}`)
    carregarVendas()
  }

  function formatarData(data) {
    if (!data) return '-'

    const partes = data.slice(0, 10).split('-')

    if (partes.length !== 3) return data

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  function buscarCliente(nomeCliente) {
    return clientes.find(
      cliente => cliente.nome === nomeCliente
    )
  }

  function textoPagamento(venda) {
    const parcelas = parcelasVenda(venda)

    return `${formaPagamentoBase(venda)}${parcelas ? ` (${parcelas}x)` : ''}`
  }

  function vendaEstaSelecionada(id) {
    return vendasSelecionadasRecibo.includes(id)
  }

  function selecionarVendaRecibo(id) {
    setVendasSelecionadasRecibo((selecionadas) => {
      if (selecionadas.includes(id)) {
        return selecionadas.filter((item) => item !== id)
      }

      return [...selecionadas, id]
    })
  }

  function limparSelecaoRecibo() {
    setVendasSelecionadasRecibo([])
  }

  function gerarReciboAgrupado() {
    const selecionadas = vendas.filter((venda) =>
      vendasSelecionadasRecibo.includes(venda.id)
    )

    if (selecionadas.length === 0) {
      alert('Selecione pelo menos uma venda para gerar o recibo')
      return
    }

    const primeiraVenda = selecionadas[0]
    const clienteEncontrado = buscarCliente(primeiraVenda.cliente)

    const telefoneCliente = clienteEncontrado?.telefone || '-'
    const cpfCliente = clienteEncontrado?.cpf || '-'
    const enderecoCliente = clienteEncontrado?.endereco || '-'

    const totalRecibo = selecionadas.reduce(
      (total, venda) => total + Number(venda.valor_total || 0),
      0
    )

    const pagamentos = [...new Set(selecionadas.map((venda) => textoPagamento(venda)))].join(' / ')

    const janela = window.open('', '_blank')

    janela.document.write(`
      <html>
        <head>
          <title>Recibo Agrupado</title>

          <style>
            @page { size: A4; margin: 8mm; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #111; background: #fff; }
            .recibo { border: 2px solid #0057ff; border-radius: 14px; padding: 24px; max-width: 850px; margin: auto; }
            .topo { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0057ff; padding-bottom: 18px; margin-bottom: 20px; gap: 18px; }
            .logo { width: 115px; height: 115px; object-fit: contain; }
            .empresa { flex: 1; }
            .empresa h1 { margin: 0; font-size: 34px; color: #0057ff; }
            .empresa p { margin: 5px 0; font-size: 14px; }
            .numero { background: #06142e; color: white; padding: 18px; border-radius: 10px; text-align: center; min-width: 170px; }
            .numero strong { display: block; color: #1e88ff; font-size: 24px; margin-top: 8px; }
            .titulo { background: #0057ff; color: white; padding: 10px 15px; border-radius: 8px; margin-top: 22px; margin-bottom: 12px; font-weight: bold; }
            .linha { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 10px; }
            .campo { border-bottom: 1px solid #999; padding: 8px 0; font-size: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #0057ff; color: white; padding: 10px; border: 1px solid #ccc; }
            td { padding: 12px; border: 1px solid #ccc; text-align: center; }
            .total { margin-top: 20px; background: #06142e; color: white; padding: 18px; border-radius: 10px; text-align: right; font-size: 28px; font-weight: bold; }
            .assinaturas { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 55px; }
            .assinaturas div { border-top: 1px solid #111; text-align: center; padding-top: 8px; }
            .rodape { margin-top: 35px; background: #06142e; color: white; text-align: center; padding: 18px; border-radius: 10px; line-height: 1.5; }
            .print-btn { margin-bottom: 20px; padding: 10px 16px; border: none; border-radius: 8px; background: #0057ff; color: white; cursor: pointer; font-weight: bold; }
            @media print { .print-btn { display: none; } body { padding: 0; } .recibo { border: none; } }
          </style>
        </head>

        <body>
          <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>

          <div class="recibo">
            <div class="topo">
              <img src="/logo.png" class="logo" />

              <div class="empresa">
                <h1>TECH LINE</h1>
                <p><strong>Informática</strong></p>
                <p>Assistência Técnica • Manutenção • Venda de Peças</p>
                <p><strong>Telefone:</strong> (44) 99137-3517</p>
                <p><strong>Endereço:</strong> Rua Doutor Arnaldo Busatto, 430 - Zona 7</p>
              </div>

              <div class="numero">
                RECIBO
                <strong>${String(primeiraVenda.id).padStart(6, '0')}</strong>
              </div>
            </div>

            <div class="titulo">DADOS DO CLIENTE</div>

            <div class="linha">
              <div class="campo"><strong>Cliente:</strong> ${primeiraVenda.cliente || '-'}</div>
              <div class="campo"><strong>Telefone:</strong> ${telefoneCliente}</div>
            </div>

            <div class="linha">
              <div class="campo"><strong>CPF:</strong> ${cpfCliente}</div>
              <div class="campo"><strong>Data:</strong> ${formatarData(primeiraVenda.data_venda)}</div>
            </div>

            <div class="campo"><strong>Endereço:</strong> ${enderecoCliente}</div>

            <div class="linha">
              <div class="campo"><strong>Pagamento:</strong> ${pagamentos || '-'}</div>
              <div class="campo"><strong>Origem:</strong> ${primeiraVenda.origem || '-'}</div>
            </div>

            <div class="titulo">PRODUTOS / SERVIÇOS</div>

            <table>
              <thead>
                <tr>
                  <th>Cód.</th>
                  <th>Descrição</th>
                  <th>Qtd.</th>
                  <th>Valor Unit.</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                ${selecionadas.map((venda) => `
                  <tr>
                    <td>${venda.id}</td>
                    <td>${venda.item || '-'}</td>
                    <td>${venda.quantidade || 1}</td>
                    <td>R$ ${venda.valor_unitario || '0.00'}</td>
                    <td>R$ ${venda.valor_total || '0.00'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total">TOTAL R$ ${totalRecibo.toFixed(2)}</div>

            <div class="titulo">OBSERVAÇÕES</div>
            <p>Recebemos o valor referente aos produtos/serviços descritos acima.</p>

            <div class="assinaturas">
              <div>Assinatura do Cliente</div>
              <div>Assinatura do Responsável</div>
            </div>

            <div class="rodape">
              Obrigado pela preferência!<br />
              <strong>TECH LINE INFORMÁTICA</strong><br />
              Soluções em informática com qualidade e confiança.
            </div>
          </div>
        </body>
      </html>
    `)

    janela.document.close()
  }

  function gerarRecibo(venda) {
    const clienteEncontrado = buscarCliente(venda.cliente)

    const telefoneCliente = clienteEncontrado?.telefone || '-'
    const cpfCliente = clienteEncontrado?.cpf || '-'
    const enderecoCliente = clienteEncontrado?.endereco || '-'

    const janela = window.open('', '_blank')

    janela.document.write(`
      <html>
        <head>
          <title>Recibo Venda ${venda.id}</title>

          <style>
            @page { size: A4; margin: 8mm; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #111; background: #fff; }
            .recibo { border: 2px solid #0057ff; border-radius: 14px; padding: 24px; max-width: 850px; margin: auto; }
            .topo { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0057ff; padding-bottom: 18px; margin-bottom: 20px; gap: 18px; }
            .logo { width: 115px; height: 115px; object-fit: contain; }
            .empresa { flex: 1; }
            .empresa h1 { margin: 0; font-size: 34px; color: #0057ff; }
            .empresa p { margin: 5px 0; font-size: 14px; }
            .numero { background: #06142e; color: white; padding: 18px; border-radius: 10px; text-align: center; min-width: 170px; }
            .numero strong { display: block; color: #1e88ff; font-size: 28px; margin-top: 8px; }
            .titulo { background: #0057ff; color: white; padding: 10px 15px; border-radius: 8px; margin-top: 22px; margin-bottom: 12px; font-weight: bold; }
            .linha { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 10px; }
            .campo { border-bottom: 1px solid #999; padding: 8px 0; font-size: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #0057ff; color: white; padding: 10px; border: 1px solid #ccc; }
            td { padding: 12px; border: 1px solid #ccc; text-align: center; }
            .total { margin-top: 20px; background: #06142e; color: white; padding: 18px; border-radius: 10px; text-align: right; font-size: 28px; font-weight: bold; }
            .assinaturas { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 55px; }
            .assinaturas div { border-top: 1px solid #111; text-align: center; padding-top: 8px; }
            .rodape { margin-top: 35px; background: #06142e; color: white; text-align: center; padding: 18px; border-radius: 10px; line-height: 1.5; }
            .print-btn { margin-bottom: 20px; padding: 10px 16px; border: none; border-radius: 8px; background: #0057ff; color: white; cursor: pointer; font-weight: bold; }
            @media print { .print-btn { display: none; } body { padding: 0; } .recibo { border: none; } }
          </style>
        </head>

        <body>
          <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>

          <div class="recibo">
            <div class="topo">
              <img src="/logo.png" class="logo" />
              <div class="empresa">
                <h1>TECH LINE</h1>
                <p><strong>Informática</strong></p>
                <p>Assistência Técnica • Manutenção • Venda de Peças</p>
                <p><strong>Telefone:</strong> (44) 99137-3517</p>
                <p><strong>Endereço:</strong> Rua Doutor Arnaldo Busatto, 430 - Zona 7</p>
              </div>
              <div class="numero">RECIBO Nº<strong>${String(venda.id).padStart(6, '0')}</strong></div>
            </div>

            <div class="titulo">DADOS DO CLIENTE</div>

            <div class="linha">
              <div class="campo"><strong>Cliente:</strong> ${venda.cliente || '-'}</div>
              <div class="campo"><strong>Telefone:</strong> ${telefoneCliente}</div>
            </div>

            <div class="linha">
              <div class="campo"><strong>CPF:</strong> ${cpfCliente}</div>
              <div class="campo"><strong>Data:</strong> ${formatarData(venda.data_venda)}</div>
            </div>

            <div class="campo"><strong>Endereço:</strong> ${enderecoCliente}</div>

            <div class="linha">
              <div class="campo"><strong>Forma de pagamento:</strong> ${textoPagamento(venda)}</div>
              <div class="campo"><strong>Origem da venda:</strong> ${venda.origem || '-'}</div>
            </div>

            <div class="campo"><strong>Tipo:</strong> ${venda.tipo || '-'}</div>

            <div class="titulo">PRODUTOS / SERVIÇOS</div>

            <table>
              <thead>
                <tr>
                  <th>Cód.</th>
                  <th>Descrição</th>
                  <th>Qtd.</th>
                  <th>Valor Unit.</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>${venda.id}</td>
                  <td>${venda.item || '-'}</td>
                  <td>${venda.quantidade || 1}</td>
                  <td>R$ ${venda.valor_unitario || '0.00'}</td>
                  <td>R$ ${venda.valor_total || '0.00'}</td>
                </tr>
              </tbody>
            </table>

            <div class="total">TOTAL R$ ${venda.valor_total || '0.00'}</div>

            <div class="titulo">OBSERVAÇÕES</div>
            <p>Recebemos o valor referente ao produto/serviço descrito acima.</p>

            <div class="assinaturas">
              <div>Assinatura do Cliente</div>
              <div>Assinatura do Responsável</div>
            </div>

            <div class="rodape">
              Obrigado pela preferência!<br />
              <strong>TECH LINE INFORMÁTICA</strong><br />
              Soluções em informática com qualidade e confiança.
            </div>
          </div>
        </body>
      </html>
    `)

    janela.document.close()
  }

  function gerarImpressaoTermica(venda, largura) {
    const clienteEncontrado = buscarCliente(venda.cliente)

    const telefoneCliente = clienteEncontrado?.telefone || '-'
    const cpfCliente = clienteEncontrado?.cpf || '-'
    const enderecoCliente = clienteEncontrado?.endereco || '-'
    const larguraPapel = largura === 58 ? '58mm' : '80mm'
    const fonte = largura === 58 ? '11px' : '13px'
    const titulo = largura === 58 ? '16px' : '18px'

    const janela = window.open('', '_blank')

    janela.document.write(`
      <html>
        <head>
          <title>Impressão Térmica ${larguraPapel} - Venda ${venda.id}</title>

          <style>
            @page { size: ${larguraPapel} auto; margin: 2mm; }
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; font-size: ${fonte}; color: #000; background: #fff; }
            .cupom { width: ${larguraPapel}; padding: 6px; box-sizing: border-box; }
            .centro { text-align: center; }
            .empresa { font-size: ${titulo}; font-weight: bold; margin-bottom: 3px; }
            .linha { border-top: 1px dashed #000; margin: 8px 0; }
            .item { margin: 4px 0; word-break: break-word; }
            .total { font-size: ${titulo}; font-weight: bold; text-align: right; margin-top: 8px; }
            .assinatura { margin-top: 28px; border-top: 1px solid #000; text-align: center; padding-top: 4px; }
            .print-btn { margin: 8px; padding: 8px 10px; border: none; border-radius: 6px; background: #111; color: white; cursor: pointer; font-weight: bold; }
            @media print { .print-btn { display: none; } }
          </style>
        </head>

        <body>
          <button class="print-btn" onclick="window.print()">🖨️ Imprimir ${larguraPapel}</button>

          <div class="cupom">
            <div class="centro">
              <div class="empresa">TECH LINE</div>
              <div>INFORMÁTICA</div>
              <div>Assistência Técnica</div>
              <div>(44) 99137-3517</div>
            </div>

            <div class="linha"></div>
            <div class="centro"><strong>RECIBO DE VENDA</strong></div>
            <div class="centro">Nº ${String(venda.id).padStart(6, '0')}</div>
            <div>Data: ${formatarData(venda.data_venda)}</div>
            <div class="linha"></div>

            <div class="item"><strong>Cliente:</strong> ${venda.cliente || '-'}</div>
            <div class="item"><strong>Telefone:</strong> ${telefoneCliente}</div>
            <div class="item"><strong>CPF:</strong> ${cpfCliente}</div>
            <div class="item"><strong>Endereço:</strong> ${enderecoCliente}</div>

            <div class="linha"></div>

            <div class="item"><strong>Item:</strong> ${venda.item || '-'}</div>
            <div class="item"><strong>Tipo:</strong> ${venda.tipo || '-'}</div>
            <div class="item"><strong>Qtd:</strong> ${venda.quantidade || 1}</div>
            <div class="item"><strong>Valor unit.:</strong> R$ ${venda.valor_unitario || '0.00'}</div>
            <div class="item"><strong>Pagamento:</strong> ${textoPagamento(venda)}</div>
            <div class="item"><strong>Origem:</strong> ${venda.origem || '-'}</div>

            <div class="linha"></div>
            <div class="total">TOTAL: R$ ${venda.valor_total || '0.00'}</div>
            <div class="linha"></div>
            <div class="centro">Obrigado pela preferência!</div>
            <div class="centro">Tech Line Informática</div>
            <div class="assinatura">Assinatura do Cliente</div>
          </div>
        </body>
      </html>
    `)

    janela.document.close()
  }

  function escolherModeloImpressao(venda) {
    const opcao = window.prompt(
      'Escolha o modelo de impressão:\n\n1 - Recibo A4\n2 - Térmica 58mm\n3 - Térmica 80mm\n\nDigite 1, 2 ou 3:'
    )

    if (opcao === '1') gerarRecibo(venda)
    if (opcao === '2') gerarImpressaoTermica(venda, 58)
    if (opcao === '3') gerarImpressaoTermica(venda, 80)
  }

  function enviarReciboWhatsApp(venda) {
    const clienteEncontrado = buscarCliente(venda.cliente)

    const telefoneCliente = clienteEncontrado?.telefone || ''
    const cpfCliente = clienteEncontrado?.cpf || ''
    const enderecoCliente = clienteEncontrado?.endereco || ''

    const mensagem = `
🧾 RECIBO TECH LINE INFORMÁTICA

Cliente: ${venda.cliente || '-'}
Telefone: ${telefoneCliente || '-'}
CPF: ${cpfCliente || '-'}
Endereço: ${enderecoCliente || '-'}

Item: ${venda.item || '-'}
Tipo: ${venda.tipo || '-'}
Quantidade: ${venda.quantidade || 1}
Valor unitário: R$ ${venda.valor_unitario || '0.00'}
Total: R$ ${venda.valor_total || '0.00'}
Pagamento: ${textoPagamento(venda)}
Origem: ${venda.origem || '-'}
Data: ${formatarData(venda.data_venda)}

Obrigado pela preferência!
Tech Line Informática
    `

    const telefoneLimpo = telefoneCliente.replace(/\D/g, '')
    const link = telefoneLimpo
      ? `https://wa.me/55${telefoneLimpo}?text=${encodeURIComponent(mensagem)}`
      : `https://wa.me/?text=${encodeURIComponent(mensagem)}`

    window.open(link, '_blank')
  }

  function vendasPorPagamento(pagamento) {
    return vendas.filter((venda) => formaPagamentoBase(venda) === pagamento)
  }

  function renderizarPagamentos() {
    return (
      <div className="card" style={{ marginTop: '28px' }}>
        <div className="table-header">
          <div>
            <h2>💳 Vendas por forma de pagamento</h2>
            <p>Clique em uma forma de pagamento para ver o que foi vendido.</p>
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
          {formasPagamento.map((pagamento) => {
            const lista = vendasPorPagamento(pagamento)
            const total = lista.reduce(
              (soma, venda) => soma + Number(venda.valor_total || 0),
              0
            )
            const ativa = pagamentoSelecionado === pagamento

            return (
              <button
                key={pagamento}
                type="button"
                onClick={() => setPagamentoSelecionado(ativa ? null : pagamento)}
                className="card"
                style={{
                  margin: 0,
                  padding: '18px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: ativa ? '2px solid #22c55e' : undefined
                }}
              >
                <h3 style={{ marginTop: 0 }}>{pagamento}</h3>

                <p style={{ margin: '6px 0' }}>
                  🧾 Vendas: <strong>{lista.length}</strong>
                </p>

                <p style={{ margin: '6px 0' }}>
                  💰 Total: <strong>{formatarMoeda(total)}</strong>
                </p>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  function renderizarTabelaVendas(lista, titulo, vazioTexto) {
    return (
      <div className="card table-card" style={{ marginTop: '18px' }}>
        <div className="table-header">
          <h2>{titulo}</h2>
          <span>{lista.length} venda(s)</span>
        </div>

        {lista.length === 0 ? (
          <p style={{ padding: '18px 0' }}>{vazioTexto}</p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={gerarReciboAgrupado}
              >
                Gerar recibo das vendas selecionadas
              </button>

              <button
                type="button"
                className="btn-edit"
                onClick={limparSelecaoRecibo}
              >
                Limpar seleção
              </button>

              <span style={{ alignSelf: 'center' }}>
                {vendasSelecionadasRecibo.length} selecionada(s)
              </span>
            </div>

          <table>
            <thead>
              <tr>
                <th>Selecionar</th>
                <th>Cliente</th>
                <th>Item</th>
                <th>Tipo</th>
                <th>Qtd</th>
                <th>Total</th>
                <th>Pagamento</th>
                <th>Origem</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {lista.map(venda => (
                <tr key={venda.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={vendaEstaSelecionada(venda.id)}
                      onChange={() => selecionarVendaRecibo(venda.id)}
                    />
                  </td>
                  <td>{venda.cliente}</td>
                  <td>{venda.item}</td>
                  <td>{venda.tipo}</td>
                  <td>{venda.quantidade}</td>
                  <td>{formatarMoeda(venda.valor_total)}</td>
                  <td>{textoPagamento(venda)}</td>
                  <td>{venda.origem}</td>
                  <td>{formatarData(venda.data_venda)}</td>

                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => gerarRecibo(venda)}
                    >
                      Recibo
                    </button>

                    <button
                      className="btn-edit"
                      onClick={() => escolherModeloImpressao(venda)}
                    >
                      Imprimir
                    </button>

                    <button
                      className="btn-edit"
                      onClick={() => enviarReciboWhatsApp(venda)}
                    >
                      WhatsApp
                    </button>

                    <button
                      className="btn-edit"
                      onClick={() => editarVenda(venda)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn-danger"
                      onClick={() => excluirVenda(venda.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </>
        )}
      </div>
    )
  }

  const totalVendas = vendas.reduce(
    (total, venda) => total + Number(venda.valor_total || 0),
    0
  )

  const vendasSelecionadas = pagamentoSelecionado
    ? vendasPorPagamento(pagamentoSelecionado)
    : []

  return (
    <main className="content">
      <div className="dashboard-header">
        <div>
          <h1>💰 Vendas</h1>
          <p>Controle de vendas e formas de pagamento</p>
        </div>
      </div>

      <div className="cards stats-grid">
        <div className="card stat-card">
          <div>
            <span>Total Vendido</span>
            <strong>{formatarMoeda(totalVendas)}</strong>
          </div>
          <div className="stat-icon green">💵</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>Vendas</span>
            <strong>{vendas.length}</strong>
          </div>
          <div className="stat-icon blue">🧾</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>PIX</span>
            <strong>{vendasPorPagamento('PIX').length}</strong>
            <small>{formatarMoeda(vendasPorPagamento('PIX').reduce((t, v) => t + Number(v.valor_total || 0), 0))}</small>
          </div>
          <div className="stat-icon cyan">⚡</div>
        </div>

        <div className="card stat-card">
          <div>
            <span>Parcelado</span>
            <strong>
              {vendasPorPagamento('Parcelado').length + vendasPorPagamento('Cartão Crédito Parcelado').length}
            </strong>
            <small>
              {formatarMoeda(
                [...vendasPorPagamento('Parcelado'), ...vendasPorPagamento('Cartão Crédito Parcelado')]
                  .reduce((t, v) => t + Number(v.valor_total || 0), 0)
              )}
            </small>
          </div>
          <div className="stat-icon yellow">💳</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '28px' }}>
        <h2>{editando ? 'Editar Venda' : 'Nova Venda'}</h2>

        <form onSubmit={salvarVenda}>
          <select
            name="cliente"
            value={form.cliente}
            onChange={alterarCampo}
          >
            <option value="">Selecione o cliente</option>

            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.nome}>
                {cliente.nome}
              </option>
            ))}
          </select>

          {form.tipo === 'Produto' ? (
            <select
              name="item"
              value={form.item}
              onChange={alterarCampo}
            >
              <option value="">Selecione o produto</option>

              {produtosDisponiveis.length === 0 && (
                <option value="" disabled>
                  Nenhum produto disponível
                </option>
              )}

              {produtosDisponiveis.map(produto => {
                const nome = nomeProduto(produto)
                const preco = precoProduto(produto)

                return (
                  <option key={produto.id || nome} value={nome}>
                    {nome}
                    {preco ? ` - R$ ${Number(String(preco).replace(',', '.')).toFixed(2)}` : ''}
                  </option>
                )
              })}
            </select>
          ) : (
            <input
              type="text"
              name="item"
              placeholder="Digite o serviço"
              value={form.item}
              onChange={alterarCampo}
            />
          )}

          <select
            name="tipo"
            value={form.tipo}
            onChange={alterarCampo}
          >
            <option>Produto</option>
            <option>Serviço</option>
          </select>

          <input
            type="number"
            name="quantidade"
            placeholder="Quantidade"
            value={form.quantidade}
            onChange={alterarCampo}
          />

          <input
            type="number"
            step="0.01"
            name="valor_unitario"
            placeholder="Valor Unitário"
            value={form.valor_unitario}
            onChange={alterarCampo}
          />

          <input
            type="text"
            value={form.valor_total}
            readOnly
            placeholder="Valor Total"
          />

          <input
            type="date"
            name="data_venda"
            value={form.data_venda}
            onChange={alterarCampo}
          />

          <select
            name="forma_pagamento"
            value={form.forma_pagamento}
            onChange={alterarCampo}
          >
            {formasPagamento.map((pagamento) => (
              <option key={pagamento}>{pagamento}</option>
            ))}
          </select>

          {(form.forma_pagamento === 'Parcelado' ||
            form.forma_pagamento === 'Cartão Crédito Parcelado') && (
            <select
              name="parcelas"
              value={form.parcelas}
              onChange={alterarCampo}
            >
              <option value="">Quantidade de parcelas</option>
              {Array.from({ length: 12 }, (_, index) => index + 1).map(numero => (
                <option key={numero} value={numero}>
                  {numero}x de R$ {
                    form.valor_total
                      ? (Number(form.valor_total) / numero).toFixed(2)
                      : '0.00'
                  }
                </option>
              ))}
            </select>
          )}

          <select
            name="origem"
            value={form.origem}
            onChange={alterarCampo}
          >
            <option>WhatsApp</option>
            <option>Instagram</option>
            <option>Facebook</option>
            <option>Marketplace</option>
            <option>OLX</option>
            <option>Google</option>
            <option>Indicação</option>
            <option>Loja Física</option>
            <option>Site</option>
            <option>Outro</option>
          </select>

          <button className="btn-primary" type="submit">
            {editando ? 'Atualizar Venda' : 'Salvar Venda'}
          </button>
        </form>
      </div>

      {renderizarPagamentos()}

      {pagamentoSelecionado && renderizarTabelaVendas(
        vendasSelecionadas,
        `🧾 Vendas em ${pagamentoSelecionado}`,
        `Nenhuma venda encontrada em ${pagamentoSelecionado}.`
      )}
    </main>
  )
}

export default Vendas
