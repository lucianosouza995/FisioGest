/**
 * Utilitário de WhatsApp (Zero-Cost API)
 * Gera link com mensagem amigável de cobrança de sessões de fisioterapia
 * 
 * @param {string} telefone - Número de telefone do paciente
 * @param {string} nomePaciente - Nome do paciente
 * @param {number|string} quantidadeSessoes - Número de sessões realizadas/cobradas
 * @param {number|string} valorTotal - Valor total das sessões
 * @param {string} chavePix - Chave Pix para pagamento
 * @returns {string} URL completa para abrir o WhatsApp
 */
export function gerarLinkCobrancaWhatsApp(
  telefone: string,
  nomePaciente: string,
  quantidadeSessoes: number | string,
  valorTotal: number | string,
  chavePix: string
): string {
  // 1. Higieniza o número de telefone (apenas dígitos)
  let cleanPhone = String(telefone || '').replace(/\D/g, '');

  // Adiciona DDI 55 (Brasil) caso não tenha
  if (cleanPhone.length === 10 || cleanPhone.length === 11) {
    cleanPhone = `55${cleanPhone}`;
  }

  // 2. Formata valor caso seja numérico
  const valorFormatado = typeof valorTotal === 'number' 
    ? valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : String(valorTotal);

  const sessoesTexto = Number(quantidadeSessoes) === 1 ? '1 sessão' : `${quantidadeSessoes} sessões`;

  // 3. Monta texto cordial, profissional e claro
  const mensagem = 
`Olá, ${nomePaciente}! Tudo bem? 😊

Passando para enviar o resumo dos seus atendimentos de Fisioterapia:
📋 *Plano:* ${sessoesTexto}
💰 *Valor Total:* ${valorFormatado}

🔑 *Chave PIX para pagamento:*
${chavePix}

Assim que realizar a transferência, por favor envie o comprovante por aqui.
Qualquer dúvida ou caso queira ajustar sua agenda, estou à disposição! 🩺✨`;

  // 4. Retorna a URL codificada
  const encodedText = encodeURIComponent(mensagem);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Atalho padrão solicitado
 */
export default gerarLinkCobrancaWhatsApp;
