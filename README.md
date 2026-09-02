# Mobi4You - Qualificação Inteligente de Leads

Sistema interativo de qualificação comercial estilo Typeform, desenvolvido sob medida para a **Mobi4You Mobiliário Corporativo**.

## 🚀 Funcionalidades

- **Design Elegante & Minimalista**: Fundo escuro imersivo com efeito de iluminação ambiente suave (*backlight glow*), card elevado em alto contraste e tipografia balanceada (`text-wrap: balance`).
- **Navegação Multietapa Inteligente**: 
  - **Etapa 1**: Identificação e dados de contato com máscara telefônica brasileira e conformidade LGPD.
  - **Etapa 2**: Segmentação de perfil (Arquiteto / Especificador ou Facilities / Comprador).
  - **Etapas 3 a 5**: Ramificação condicional com perguntas direcionadas a cada perfil.
  - **Etapa Final**: Resumo completo das informações e botão direto para WhatsApp Oficial com mensagem personalizada.
- **Validações & UX Fluida**:
  - Transições animadas suaves entre as etapas.
  - Bloqueio inteligente do botão "Avançar" até que uma alternativa seja selecionada.
  - Suporte total a atalhos de teclado (`A, B, C, D, E`, `Enter`, `Backspace`).
- **Automação Make (Integromat) & Google Sheets**:
  - Disparo de Webhook assíncrono ao finalizar a última pergunta com trava de envio único para evitar duplicidades na planilha.

## 🛠️ Tecnologias

- **HTML5** semântico
- **CSS3** avançado (Flexbox, Grid, Animações, Gradientes em camadas)
- **JavaScript** (ES6+ Vanilla)
- **Make** / **Google Sheets** (Webhook automation)
- **Vercel** (Deploy e hospedagem rápida em nuvem)

---

Desenvolvido para **Mobi4You Mobiliário Corporativo**.
