const AULAS = [
  { id: '1a', label: '1ª', inicio: '7:00', fim: '7:50', tipo: 'aula' },
  { id: '2a', label: '2ª', inicio: '7:50', fim: '8:40', tipo: 'aula' },
  { id: '3a', label: '3ª', inicio: '8:40', fim: '9:30', tipo: 'aula' },
  { id: 'inter1', label: 'INTER.', inicio: '9:30', fim: '9:50', tipo: 'intervalo' },
  { id: '4a', label: '4ª', inicio: '9:50', fim: '10:40', tipo: 'aula' },
  { id: '5a', label: '5ª', inicio: '10:40', fim: '11:30', tipo: 'aula' },
  { id: '6aEM', label: '6ª EM', inicio: '11:30', fim: '12:20', tipo: 'aula' },
  { id: 'almEF', label: 'Alm EF', inicio: '11:30', fim: '12:20', tipo: 'almoco' },
  { id: 'almEM', label: 'Alm EM', inicio: '12:20', fim: '14:40', tipo: 'almoco' },
  { id: '6aEF', label: '6ª EF', inicio: '12:20', fim: '13:10', tipo: 'aula' },
  { id: '7a', label: '7ª', inicio: '13:10', fim: '14:00', tipo: 'aula' },
  { id: 'inter2', label: 'INTER.', inicio: '14:00', fim: '14:20', tipo: 'intervalo' },
  { id: '8a', label: '8ª', inicio: '14:20', fim: '15:10', tipo: 'aula' },
  { id: '9a', label: '9ª', inicio: '15:10', fim: '16:00', tipo: 'aula' },
];

const CARRINHOS = ['multilaser','samsung1','samsung2','positivo1','acessa'];
const CARRINHO_LABEL = {
  multilaser: 'Multilaser',
  samsung1: 'Samsung 1',
  samsung2: 'Samsung 2',
  positivo1: 'Positivo 1',
  acessa: 'Positivo Acessa',
};
const BADGE_CLASS = {
  multilaser: 'badge-ml',
  samsung1: 'badge-s1',
  samsung2: 'badge-s2',
  positivo1: 'badge-p1',
  acessa: 'badge-ac',
};

const DIAS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

function hoje() {
  const d = new Date();
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

function getDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function loadData(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; }
}

function saveData(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

let reservas = loadData('reservas_' + getDateKey(), {});
let avulsas = loadData('avulsas_' + getDateKey(), []);
let editIdx = null;

document.getElementById('headerDate').textContent = hoje();

function aulaAtual() {
  const now = new Date();
  const hm = now.getHours() * 60 + now.getMinutes();
  for (const a of AULAS) {
    if (a.tipo !== 'aula') continue;
    const [h1,m1] = a.inicio.split(':').map(Number);
    const [h2,m2] = a.fim.split(':').map(Number);
    if (hm >= h1*60+m1 && hm < h2*60+m2) return a;
  }
  return null;
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-' + id).classList.add('active');
  document.querySelectorAll('nav button').forEach((b,i) => {
    b.classList.toggle('active', ['painel','avulsas','resumo'][i] === id);
  });
  if (id === 'resumo') renderResumo();
}

function populateAulaSelect(selId) {
  const sel = document.getElementById(selId);
  sel.innerHTML = '';
  AULAS.filter(a => a.tipo === 'aula').forEach(a => {
    const o = document.createElement('option');
    o.value = a.id;
    o.textContent = `${a.label} (${a.inicio}–${a.fim})`;
    sel.appendChild(o);
  });
}

function renderTabela() {
  const tbody = document.getElementById('tbodyReservas');
  const atual = aulaAtual();
  const info = document.getElementById('aulaAtualInfo');
  if (atual) {
    info.innerHTML = `<span class="aula-atual-badge">🟢 Aula atual: ${atual.label} (${atual.inicio}–${atual.fim})</span>`;
  } else {
    info.innerHTML = '';
  }

  let diaSet = false;
  tbody.innerHTML = '';
  AULAS.forEach(a => {
    const tr = document.createElement('tr');
    if (a.tipo === 'intervalo') tr.classList.add('intervalo');
    if (a.tipo === 'almoco') tr.classList.add('almoco');

    const isAtual = atual && atual.id === a.id;
    if (isAtual) tr.style.background = '#fffbe6';

    let diaCell = '';
    if (!diaSet) {
      const nAulas = AULAS.filter(x => x.tipo === 'aula').length;
      diaCell = `<td class="dia-label" rowspan="${AULAS.length}" style="font-size:0.7rem;background:#ffcc00;color:#333;">${hoje().split(',')[0].toUpperCase()}</td>`;
      diaSet = true;
    }

    if (a.tipo === 'intervalo' || a.tipo === 'almoco') {
      tr.innerHTML = `
        ${!diaSet ? diaCell : ''}
        <td class="aula-label">${a.label}</td>
        <td class="hora-label" colspan="2">${a.inicio} – ${a.fim}</td>
        <td colspan="10" style="color:#aaa;font-style:italic;font-size:0.75rem;">${a.tipo === 'intervalo' ? 'Intervalo' : 'Almoço'}</td>
        <td></td>
      `;
    } else {
      const cells = CARRINHOS.map(c => {
        const r = reservas[a.id] && reservas[a.id][c];
        if (r && r.prof) {
          return `
            <td>
              <div class="cell-content">
                <span class="cell-prof">${r.prof}</span>
                ${r.turma ? `<span class="cell-turma">${r.turma}</span>` : ''}
              </div>
            </td>
            <td>
              <button class="edit-btn" title="Editar" onclick="editarReserva('${a.id}','${c}')">✏️</button>
              <button class="del-btn" title="Remover" onclick="removerReserva('${a.id}','${c}')">✕</button>
            </td>
          `;
        }
        return `<td colspan="2"><span class="cell-vazio">—</span> <button class="edit-btn" onclick="abrirModalReserva('${a.id}','${c}')" title="Adicionar">＋</button></td>`;
      });

      tr.innerHTML = `
        <td class="aula-label">${a.label}</td>
        <td class="hora-label">${a.inicio}</td>
        <td class="hora-label">${a.fim}</td>
        ${cells.join('')}
      `;
    }
    tbody.appendChild(tr);
  });

  // Fix: add dia column only once at start
  const firstRow = tbody.querySelector('tr');
  if (firstRow) {
    const nRows = AULAS.length;
    const diaCol = document.createElement('td');
    diaCol.className = 'dia-label';
    diaCol.rowSpan = nRows;
    diaCol.textContent = hoje().split(',')[0].toUpperCase();
    diaCol.style.cssText = 'font-size:0.7rem;background:#ffcc00;color:#333;';
    firstRow.insertBefore(diaCol, firstRow.firstChild);
  }
}

function abrirModalReserva(aulaId, carrinho) {
  editIdx = null;
  populateAulaSelect('resAula');
  document.getElementById('modalReservaTitulo').textContent = 'Nova Reserva';
  document.getElementById('resProf').value = '';
  document.getElementById('resTurma').value = '';
  if (aulaId) document.getElementById('resAula').value = aulaId;
  if (carrinho) document.getElementById('resCarrinho').value = carrinho;
  document.getElementById('modalReserva').classList.add('open');
}

function editarReserva(aulaId, carrinho) {
  const r = reservas[aulaId] && reservas[aulaId][carrinho];
  if (!r) return;
  populateAulaSelect('resAula');
  document.getElementById('modalReservaTitulo').textContent = 'Editar Reserva';
  document.getElementById('resAula').value = aulaId;
  document.getElementById('resCarrinho').value = carrinho;
  document.getElementById('resProf').value = r.prof || '';
  document.getElementById('resTurma').value = r.turma || '';
  editIdx = { aulaId, carrinho };
  document.getElementById('modalReserva').classList.add('open');
}

function salvarReserva() {
  const aula = document.getElementById('resAula').value;
  const carrinho = document.getElementById('resCarrinho').value;
  const prof = document.getElementById('resProf').value.trim();
  const turma = document.getElementById('resTurma').value.trim();
  if (!prof) { alert('Informe o professor e a atividade.'); return; }
  if (!reservas[aula]) reservas[aula] = {};
  reservas[aula][carrinho] = { prof, turma };
  saveData('reservas_' + getDateKey(), reservas);
  fecharModal('modalReserva');
  renderTabela();
}

function removerReserva(aulaId, carrinho) {
  if (!confirm('Remover esta reserva?')) return;
  if (reservas[aulaId]) delete reservas[aulaId][carrinho];
  saveData('reservas_' + getDateKey(), reservas);
  renderTabela();
}

function limparDia() {
  if (!confirm('Tem certeza que deseja limpar todas as reservas do dia?')) return;
  reservas = {};
  saveData('reservas_' + getDateKey(), reservas);
  renderTabela();
}

function abrirModalAvulsa() {
  populateAulaSelect('avAula');
  document.getElementById('avProf').value = '';
  document.getElementById('avNotebooks').value = '';
  document.getElementById('avQtd').value = '';
  document.getElementById('avSala').value = '';
  document.getElementById('avObs').value = '';
  document.getElementById('modalAvulsa').classList.add('open');
}

function salvarAvulsa() {
  const prof = document.getElementById('avProf').value.trim();
  const carrinho = document.getElementById('avCarrinho').value;
  const notebooks = document.getElementById('avNotebooks').value.trim();
  const qtd = document.getElementById('avQtd').value;
  const sala = document.getElementById('avSala').value.trim();
  const aulaId = document.getElementById('avAula').value;
  const obs = document.getElementById('avObs').value.trim();
  if (!prof || !notebooks || !sala) { alert('Preencha professor, notebooks e sala.'); return; }
  const aulaObj = AULAS.find(a => a.id === aulaId);
  avulsas.push({
    id: Date.now(),
    prof, carrinho, notebooks, qtd, sala,
    aula: aulaObj ? `${aulaObj.label} (${aulaObj.inicio}–${aulaObj.fim})` : aulaId,
    obs,
    hora: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}),
  });
  saveData('avulsas_' + getDateKey(), avulsas);
  fecharModal('modalAvulsa');
  renderAvulsas();
}

function removerAvulsa(id) {
  if (!confirm('Remover este registro?')) return;
  avulsas = avulsas.filter(a => a.id !== id);
  saveData('avulsas_' + getDateKey(), avulsas);
  renderAvulsas();
}

function renderAvulsas() {
  const lista = document.getElementById('listaPegas');
  if (!avulsas.length) {
    lista.innerHTML = `<div class="empty-state"><span>📦</span>Nenhuma pega avulsa registrada hoje.<br>Clique em <strong>+ Registrar Pega</strong> para adicionar.</div>`;
    return;
  }
  lista.innerHTML = '<div class="pegas-list">' + avulsas.map(a => {
    const nbs = a.notebooks.split(',').map(n => n.trim()).filter(Boolean);
    const tagClass = {samsung1:'samsung',samsung2:'samsung',positivo1:'positivo',multilaser:'multilaser',acessa:'acessa'}[a.carrinho] || '';
    return `
      <div class="pega-card">
        <div class="pega-card-info">
          <span class="badge-carrinho ${BADGE_CLASS[a.carrinho]}">${CARRINHO_LABEL[a.carrinho]}</span>
          <div class="pega-prof">${a.prof}</div>
          <div class="pega-meta">📍 ${a.sala} &nbsp;|&nbsp; 🕐 ${a.aula} &nbsp;|&nbsp; registrado às ${a.hora} &nbsp;|&nbsp; ${a.qtd ? a.qtd + ' notebooks' : ''}</div>
          <div class="pega-notebooks">
            ${nbs.map(n => `<span class="nb-tag ${tagClass}">${n}</span>`).join('')}
          </div>
          ${a.obs ? `<div class="pega-meta" style="margin-top:6px;font-style:italic;">💬 ${a.obs}</div>` : ''}
        </div>
        <button class="del-btn" onclick="removerAvulsa(${a.id})" title="Remover" style="font-size:1rem;">✕</button>
      </div>
    `;
  }).join('') + '</div>';
}

function renderResumo() {
  const totalReservas = Object.values(reservas).reduce((acc, r) => acc + Object.keys(r).length, 0);
  const totalAvulsas = avulsas.reduce((acc, a) => acc + (parseInt(a.qtd) || 0), 0);
  const carrinhoCount = {};
  avulsas.forEach(a => { carrinhoCount[a.carrinho] = (carrinhoCount[a.carrinho] || 0) + (parseInt(a.qtd) || 0); });

  const grid = document.getElementById('resumoGrid');
  grid.innerHTML = `
    <div class="resumo-card">
      <div class="rc-label">Reservas agendadas</div>
      <div class="rc-total">${totalReservas}</div>
      <div class="rc-sub">no painel de hoje</div>
    </div>
    <div class="resumo-card">
      <div class="rc-label">Notebooks avulsos</div>
      <div class="rc-total">${totalAvulsas}</div>
      <div class="rc-sub">em uso fora do agendamento</div>
    </div>
    <div class="resumo-card">
      <div class="rc-label">Pegas avulsas</div>
      <div class="rc-total">${avulsas.length}</div>
      <div class="rc-sub">registros hoje</div>
    </div>
  `;

  const det = document.getElementById('resumoDetalhe');
  if (avulsas.length) {
    det.innerHTML = `
      <h3 style="color:var(--blue);margin-bottom:0.75rem;font-size:0.95rem;">Notebooks avulsos em uso agora</h3>
      <div class="pegas-list">
        ${avulsas.map(a => {
          const nbs = a.notebooks.split(',').map(n => n.trim()).filter(Boolean);
          const tagClass = {samsung1:'samsung',samsung2:'samsung',positivo1:'positivo',multilaser:'multilaser',acessa:'acessa'}[a.carrinho] || '';
          return `
            <div class="pega-card">
              <div class="pega-card-info">
                <span class="badge-carrinho ${BADGE_CLASS[a.carrinho]}">${CARRINHO_LABEL[a.carrinho]}</span>
                <div class="pega-prof">${a.prof}</div>
                <div class="pega-meta">📍 ${a.sala} &nbsp;|&nbsp; 🕐 ${a.aula}</div>
                <div class="pega-notebooks">
                  ${nbs.map(n => `<span class="nb-tag ${tagClass}">${n}</span>`).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else {
    det.innerHTML = `<div class="empty-state"><span>✅</span>Nenhum notebook avulso em uso hoje.</div>`;
  }
}

function fecharModal(id) {
  document.getElementById(id).classList.remove('open');
}

document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

renderTabela();
renderAvulsas();
setInterval(renderTabela, 60000);
