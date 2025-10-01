// Encarregado Digital — PWA minimalista, 100% offline
const KEY = 'encarregado:v1';
const RATE = 2/7; // 48h por 168h

// estado
let st = {};
try { st = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { st = {}; }

let saldo_s  = Number.isFinite(st.saldo_s) ? st.saldo_s : 0;                 // saldo em segundos (pode ser negativo)
let last_ts  = Number.isFinite(st.last_ts) ? st.last_ts : Math.floor(Date.now()/1000);
let running  = typeof st.running === 'boolean' ? st.running : false;
let last_save_ts = Number.isFinite(st.last_save_ts) ? st.last_save_ts : 0;
let install_id = st.install_id || (self.crypto?.randomUUID?.() ? crypto.randomUUID() : String(Math.random()).slice(2));

function save() {
  last_save_ts = Math.floor(Date.now()/1000);
  const state = { saldo_s, last_ts, running, last_save_ts, install_id };
  localStorage.setItem(KEY, JSON.stringify(state));
}

function fmtSignedHMM(sec) {
  const neg = sec < 0; sec = Math.abs(sec);
  const h = Math.floor(sec/3600);
  const m = Math.floor((sec%3600)/60);
  return `${neg?'-':'+'}${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function fmtTime(ts) {
  if (!ts) return 'ainda não salvo';
  const d = new Date(ts*1000);
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  return `salvo às ${hh}:${mm}`;
}

function render() {
  document.querySelector('#saldo').textContent = fmtSignedHMM(saldo_s);
  document.querySelector('#led').style.opacity = running ? 1 : 0.2;
  document.querySelector('#status').textContent = running ? 'TRABALHANDO' : 'PAUSADO';
  document.querySelector('#toggle').textContent = running ? 'Pausar' : 'Iniciar';
  document.querySelector('#lastsave').textContent = fmtTime(last_save_ts);
}

function tick() {
  const now = Math.floor(Date.now()/1000);
  if (now > last_ts) {
    let dt = now - last_ts;
    // proteção contra mudanças bruscas de relógio
    const DT_MAX = 36*3600; // 36h
    if (dt > DT_MAX) dt = DT_MAX;
    if (running) saldo_s += dt;
    else         saldo_s -= Math.round(dt * RATE);
    last_ts = now;
    save();
    render();
  }
}

function detectMemoryReset() {
  // Heurística simples: se não há last_save_ts mas já existe install_id, tratamos como 1a execução.
  // Se o objeto KEY sumir, o app será recriado com novo install_id, então mostramos aviso.
  // (PWA minimalista — sem sincronizar com outros storages)
  const had = !!st.install_id;
  const has = !!install_id;
  if (had && !has) return 'reset_detected';
  if (!had && has && last_save_ts === 0) return 'first_run';
  return 'ok';
}

async function checkPersistence() {
  const el = document.querySelector('#persist');
  try {
    if (!('storage' in navigator) || !navigator.storage.persisted) {
      el.textContent = 'Armazenamento: padrão do navegador';
      return;
    }
    if (!(await navigator.storage.persisted())) {
      // tentar solicitar persistência
      if (navigator.storage.persist) {
        await navigator.storage.persist();
      }
    }
    const persisted = await navigator.storage.persisted();
    el.textContent = persisted ? 'Armazenamento: protegido ✅' : 'Armazenamento: sujeito a limpeza ⚠️';
  } catch (e) {
    el.textContent = 'Armazenamento: indeterminado';
  }
}

function wireUI() {
  document.querySelector('#toggle').addEventListener('click', () => {
    running = !running;
    save();
    render();
  });
  document.querySelector('#export').addEventListener('click', () => {
    const blob = new Blob([localStorage.getItem(KEY) || '{}'], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {href:url, download:'encarregado-backup.json'});
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });
  document.querySelector('#import').addEventListener('change', async (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      localStorage.setItem(KEY, text);
      location.reload();
    } catch (e) {
      console.error('Import error', e);
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') save();
  });
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  }
}

// boot
(function init(){
  // garantir que salvamos o install_id na primeira execução
  save();
  render();
  wireUI();
  registerSW();
  checkPersistence();
  setInterval(tick, 1000);

  // aviso de memória reiniciada (heurística leve)
  const status = detectMemoryReset();
  const banner = document.querySelector('#banner');
  if (status === 'reset_detected') {
    banner.textContent = 'Memória reiniciada — importe backup ou defina um saldo inicial.';
    banner.style.display = 'block';
  }
})();
