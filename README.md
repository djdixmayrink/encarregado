# ⏱️ Encarregado Digital

Um contador de horas simples, feito como **PWA (Progressive Web App)**, para gerenciar banco de horas pessoais.

## 🚀 Funcionalidades
- Contador de **horas trabalhadas** (botão Iniciar/Pausar).
- Quando **pausado**, desconta horas na taxa equivalente a **48h por semana (≈2/7)**.
- Mostra **saldo total** acumulado (positivo ou negativo).
- Saldo **nunca zera sozinho**.
- Funciona **100% offline** após instalado.
- Possui **backup manual** (exportar/importar JSON).

## 📱 Instalação no iPhone
1. Acesse pelo Safari o link do GitHub Pages:
https://djdixmayrink.github.io/encarregado/
2. Toque em **Compartilhar → Adicionar à Tela de Início**.
3. Abra como se fosse um app.  
4. Depois da primeira instalação, funciona **sem internet**.

## 💾 Memória e Backup
- O app salva os dados no armazenamento interno do navegador (localStorage).
- Caso os dados sejam apagados pelo sistema, você pode **importar backup**.
- Use o botão **Exportar backup** regularmente para salvar um arquivo `.json`.

## 🛠️ Estrutura dos arquivos
- `index.html` → página principal
- `app.js` → lógica do contador
- `sw.js` → service worker para offline
- `manifest.webmanifest` → informações do app (nome, ícones)
- `icons/` → ícones de instalação

## 📌 Observação
- Testado em Safari (iOS) e Chrome (Android).
- Para reinstalar, basta abrir a URL novamente e repetir a adição à Tela de Início.
