/**
 * MOBI4YOU - Lógica do Formulário Multietapa Estilo Typeform
 * Identidade Visual Oficial e Navegação Inteligente
 */

document.addEventListener('DOMContentLoaded', () => {
  // Número de WhatsApp Oficial para redirecionamento final (11 94515-1114)
  const WHATSAPP_NUMBER = '5511945151114';

  // URL do Webhook do Make / Integromat (Conectado para automação)
  const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/d2tncbssc7axio1b1vyhdc9vaspsc6ds';

  // Estado da Aplicação
  const formData = {
    nome: '',
    telefone: '',
    email: '',
    perfil: '', // 'arquiteto' ou 'facilities'
    area: '',
    tipo_imovel: '',
    etapa: '',
    necessidade: '',
    previsao: '',
    processo_compra: '',
    data_hora: ''
  };

  // Trava definitiva para garantir exatamente 1 único envio ao Make por preenchimento
  let qualificacaoEnviada = false;

  // Função para envio assíncrono ao Make / Webhook
  async function sendToMakeWebhook(statusEvent) {
    if (!MAKE_WEBHOOK_URL) return;

    // Bloqueio rigoroso: impede qualquer segundo envio para a planilha
    if (qualificacaoEnviada) return;
    qualificacaoEnviada = true;

    try {
      formData.data_hora = new Date().toLocaleString('pt-BR');
      const payload = {
        evento: 'Qualificação Concluída',
        data_hora: formData.data_hora,
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        perfil: formData.perfil === 'arquiteto' ? 'Arquiteto / Especificador' : (formData.perfil === 'facilities' ? 'Facilities / Comprador' : ''),
        area: formData.area || '',
        tipo_imovel: formData.tipo_imovel || '',
        etapa: formData.etapa || '',
        necessidade: formData.necessidade || '',
        previsao: formData.previsao || '',
        processo_compra: formData.processo_compra || ''
      };

      await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Erro silencioso ao enviar webhook para o Make:', err);
    }
  }

  // Pilha de Histórico para Navegação Voltar/Avançar
  let historyStack = ['1'];
  let currentStep = '1';
  let autoAdvanceTimer = null;

  // Elementos do DOM
  const stepBadgeText = document.getElementById('stepBadgeText');
  const stepProfileText = document.getElementById('stepProfileText');
  const cardProgressFill = document.getElementById('cardProgressFill');
  const nomeInput = document.getElementById('nome');
  const telefoneInput = document.getElementById('telefone');
  const emailInput = document.getElementById('email');
  const btnStep1Next = document.getElementById('btnStep1Next');
  const btnWhatsapp = document.getElementById('btnWhatsapp');
  const summaryBox = document.getElementById('summaryBox');

  const TOTAL_STEPS = 5;

  // Informações de cabeçalho por etapa em sequência exata (1 a 5)
  const stepMetaConfig = {
    '1': {
      badge: 'ETAPA 1 DE 5',
      profile: 'Identificação',
      progress: 20
    },
    '2': {
      badge: 'ETAPA 2 DE 5',
      profile: 'Perfil de Atendimento',
      progress: 40
    },
    'p1_3': {
      badge: 'ETAPA 3 DE 5',
      profile: 'Arquiteto / Especificador',
      progress: 60
    },
    'p1_4': {
      badge: 'ETAPA 4 DE 5',
      profile: 'Arquiteto / Especificador',
      progress: 80
    },
    'p1_5': {
      badge: 'ETAPA 5 DE 5',
      profile: 'Arquiteto / Especificador',
      progress: 100
    },
    'p2_3': {
      badge: 'ETAPA 3 DE 5',
      profile: 'Facilities / Comprador',
      progress: 60
    },
    'p2_4': {
      badge: 'ETAPA 4 DE 5',
      profile: 'Facilities / Comprador',
      progress: 80
    },
    'p2_5': {
      badge: 'ETAPA 5 DE 5',
      profile: 'Facilities / Comprador',
      progress: 100
    },
    'final': {
      badge: 'ETAPA 5 DE 5',
      profile: 'Concluído',
      progress: 100
    }
  };

  // Mapeamento de Ordem das Etapas por Perfil
  function getNextStep(step) {
    if (step === '1') return '2';
    if (step === '2') {
      return formData.perfil === 'arquiteto' ? 'p1_3' : 'p2_3';
    }
    // Rota Arquiteto
    if (step === 'p1_3') return 'p1_4';
    if (step === 'p1_4') return 'p1_5';
    if (step === 'p1_5') return 'final';

    // Rota Facilities
    if (step === 'p2_3') return 'p2_4';
    if (step === 'p2_4') return 'p2_5';
    if (step === 'p2_5') return 'final';

    return 'final';
  }

  // Atualizar Barra de Progresso e Cabeçalho do Card
  function updateProgress() {
    const config = stepMetaConfig[currentStep] || { badge: 'ETAPA 1 DE 5', profile: '', progress: 20 };
    
    if (stepBadgeText) stepBadgeText.textContent = config.badge;
    if (stepProfileText) stepProfileText.textContent = config.profile;
    if (cardProgressFill) cardProgressFill.style.width = `${config.progress}%`;
  }

  // Navegar para uma Etapa Especifica
  function goToStep(targetStep, isBack = false) {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }

    const currentCard = document.querySelector(`.step-card[data-step="${currentStep}"]`);
    const nextCard = document.querySelector(`.step-card[data-step="${targetStep}"]`);

    if (!nextCard) return;

    if (!isBack && targetStep !== currentStep) {
      historyStack.push(targetStep);
    }

    if (currentCard) {
      currentCard.classList.remove('active');
    }

    currentStep = targetStep;
    nextCard.classList.add('active');

    // Verifica se a próxima etapa já possui uma opção selecionada (caso o usuário tenha voltado)
    const nextBtn = nextCard.querySelector('.btn-next-step');
    if (nextBtn) {
      const hasSelected = nextCard.querySelector('.option-card.selected');
      nextBtn.disabled = !hasSelected;
      if (hasSelected) {
        nextBtn.classList.remove('btn-disabled');
      } else {
        nextBtn.classList.add('btn-disabled');
      }
    }

    updateProgress();

    // Se for a etapa final, renderiza o resumo e envia os dados ao webhook
    if (currentStep === 'final') {
      renderSummary();
      sendToMakeWebhook('qualificacao_concluida');
    }
  }

  // Voltar Etapa
  function goBack() {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }

    if (historyStack.length > 1) {
      historyStack.pop(); // Remove a atual
      const prevStep = historyStack[historyStack.length - 1];
      goToStep(prevStep, true);
    }
  }

  // Avançar na etapa atual quando clicar em "Avançar"
  function advanceCurrentStep() {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }

    if (currentStep === '1') {
      if (validateStep1()) {
        goToStep(getNextStep('1'));
      }
      return;
    }

    const activeCard = document.querySelector(`.step-card[data-step="${currentStep}"]`);
    if (!activeCard) return;

    const selectedOption = activeCard.querySelector('.option-card.selected');
    if (!selectedOption) {
      // NUNCA seleciona automaticamente: avisa o usuário através de feedback visual
      activeCard.classList.add('shake-card');
      setTimeout(() => activeCard.classList.remove('shake-card'), 380);
      return;
    }

    goToStep(getNextStep(currentStep));
  }

  // Máscara Automática para o Telefone (XX) XXXXX-XXXX
  if (telefoneInput) {
    telefoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);

      if (value.length > 6) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      } else if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else if (value.length > 0) {
        value = `(${value}`;
      }

      e.target.value = value;
    });
  }

  // Validação da Etapa 1 (Contato)
  function validateStep1() {
    const nome = nomeInput.value.trim();
    const telefone = telefoneInput.value.trim();
    const email = emailInput.value.trim();

    if (!nome) {
      alert('Por favor, informe seu nome completo.');
      nomeInput.focus();
      return false;
    }

    if (telefone.length < 14) {
      alert('Por favor, informe um número de WhatsApp/telefone válido com DDD.');
      telefoneInput.focus();
      return false;
    }

    formData.nome = nome;
    formData.telefone = telefone;
    formData.email = email || 'Não informado';

    return true;
  }

  // Evento Avançar Etapa 1
  if (btnStep1Next) {
    btnStep1Next.addEventListener('click', () => {
      if (validateStep1()) {
        goToStep(getNextStep('1'));
      }
    });
  }

  // Evento para todos os botões "Avançar"
  document.querySelectorAll('.btn-next-step').forEach(btn => {
    btn.addEventListener('click', advanceCurrentStep);
  });

  // Evento para todos os botões "Voltar"
  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', goBack);
  });

  // Seleção de Opções (Etapas de Seleção Única)
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.option-card');
    if (!card) return;

    const parentStepCard = card.closest('.step-card');
    const stepId = parentStepCard.getAttribute('data-step');

    // Desmarcar outras na mesma etapa
    parentStepCard.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    // Desbloquear o botão Avançar da etapa
    const nextBtn = parentStepCard.querySelector('.btn-next-step');
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.classList.remove('btn-disabled');
    }

    // Lógica para Etapa 2 (Perfil)
    if (stepId === '2') {
      formData.perfil = card.getAttribute('data-perfil');
    } else {
      // Outras etapas
      const field = card.getAttribute('data-field');
      const val = card.getAttribute('data-value');
      if (field && val) {
        formData[field] = val;
      }
    }

    // ATIVAÇÃO IMEDIATA DO ENVIO NA ÚLTIMA ETAPA / ÚLTIMA PERGUNTA:
    // Assim que a pessoa preenche a última etapa (p1_5 ou p2_5), os dados já são enviados ao Make
    if (stepId === 'p1_5' || stepId === 'p2_5') {
      sendToMakeWebhook('qualificacao_concluida');
    }

    // Transição suave ao selecionar (permite que o usuário clique em Avançar imediatamente ou avance suavemente)
    if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = setTimeout(() => {
      if (currentStep === stepId) {
        goToStep(getNextStep(stepId));
      }
    }, 420);
  });

  // Suporte a Atalhos de Teclado (A, B, C, D, E e Enter)
  document.addEventListener('keydown', (e) => {
    // Se o usuário estiver digitando em um input
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      if (e.key === 'Enter' && currentStep === '1') {
        e.preventDefault();
        if (validateStep1()) {
          goToStep(getNextStep('1'));
        }
      }
      return;
    }

    const activeCard = document.querySelector(`.step-card[data-step="${currentStep}"]`);
    if (!activeCard) return;

    const key = e.key.toUpperCase();

    // Se pressionar letras A, B, C, D, E
    if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
      const targetOption = activeCard.querySelector(`.option-card[data-key="${key}"]`);
      if (targetOption) {
        targetOption.click();
      }
    }

    // Se pressionar Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      advanceCurrentStep();
    }

    // Se pressionar Backspace ou Escape, volta a etapa
    if (e.key === 'Backspace' || e.key === 'Escape') {
      e.preventDefault();
      goBack();
    }
  });

  // Renderizar Resumo na Tela Final
  function renderSummary() {
    const isArquiteto = formData.perfil === 'arquiteto';
    
    let html = `
      <div class="summary-item">
        <span class="summary-label">Nome:</span>
        <span class="summary-value">${formData.nome}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">WhatsApp / Telefone:</span>
        <span class="summary-value">${formData.telefone}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">E-mail:</span>
        <span class="summary-value">${formData.email}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Perfil:</span>
        <span class="summary-value">${isArquiteto ? 'Arquiteto / Especificador' : 'Comprador / Facilities'}</span>
      </div>
    `;

    if (isArquiteto) {
      html += `
        <div class="summary-item">
          <span class="summary-label">Área do Projeto:</span>
          <span class="summary-value">${formData.area || '-'}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Tipo de Imóvel:</span>
          <span class="summary-value">${formData.tipo_imovel || '-'}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Etapa do Projeto:</span>
          <span class="summary-value">${formData.etapa || '-'}</span>
        </div>
      `;
    } else {
      html += `
        <div class="summary-item">
          <span class="summary-label">Necessidade:</span>
          <span class="summary-value">${formData.necessidade || '-'}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Previsão:</span>
          <span class="summary-value">${formData.previsao || '-'}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Processo de Compra:</span>
          <span class="summary-value">${formData.processo_compra || '-'}</span>
        </div>
      `;
    }

    if (summaryBox) {
      summaryBox.innerHTML = html;
    }
  }

  // Gerar Mensagem e Redirecionar para o WhatsApp Oficial
  if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', () => {
      const isArquiteto = formData.perfil === 'arquiteto';

      let msg = `*MOBI4YOU - NOVO LEAD QUALIFICADO*\n\n`;
      msg += `📋 *DADOS DE CONTATO*\n`;
      msg += `• *Nome:* ${formData.nome}\n`;
      msg += `• *Telefone:* ${formData.telefone}\n`;
      msg += `• *E-mail:* ${formData.email}\n\n`;

      msg += `👤 *PERFIL*\n`;
      msg += `• ${isArquiteto ? 'Sou Arquiteto / Especificador' : 'Sou Comprador / Facilities'}\n\n`;

      msg += `📐 *DETALHES DA NECESSIDADE*\n`;
      if (isArquiteto) {
        msg += `• *Área do Projeto:* ${formData.area}\n`;
        msg += `• *Tipo de Imóvel:* ${formData.tipo_imovel}\n`;
        msg += `• *Etapa do Projeto:* ${formData.etapa}\n`;
      } else {
        msg += `• *Necessidade:* ${formData.necessidade}\n`;
        msg += `• *Previsão:* ${formData.previsao}\n`;
        msg += `• *Processo de Compra:* ${formData.processo_compra}\n`;
      }

      const encodedMsg = encodeURIComponent(msg);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`;

      window.open(whatsappUrl, '_blank');
    });
  }

  // Inicializar primeira etapa
  updateProgress();
});
