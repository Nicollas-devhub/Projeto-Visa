
const users = [{ email: 'admin@visa.gov.br', senha: '123456' }, { email: 'test@test.com', senha: '123' }];
let estabelecimentos = [
  { id:1, nome:'Restaurante ABC',       tipo:'Alimentação', bairro:'Centro',     status:'Ativo',     conformidade:92 },
  { id:2, nome:'Farmácia Central',      tipo:'Saúde',       bairro:'Batel',      status:'Ativo',     conformidade:98 },
  { id:3, nome:'Supermercado Bom Preço',tipo:'Alimentação', bairro:'Portão',     status:'Irregular', conformidade:64 },
  { id:4, nome:'Padaria Pão Quente',    tipo:'Alimentação', bairro:'Água Verde', status:'Ativo',     conformidade:88 },
  { id:5, nome:'Clínica Saúde Total',   tipo:'Saúde',       bairro:'Bigorrilho', status:'Ativo',     conformidade:95 },
];

let inspecoes = [
  { id:1, estab:'Restaurante ABC',        data:'2024-05-10', inspetor:'Dr. Silva',   tipo:'Rotina',  resultado:'Aprovado'  },
  { id:2, estab:'Supermercado Bom Preço', data:'2024-05-08', inspetor:'Dra. Santos', tipo:'Especial',resultado:'Reprovado' },
  { id:3, estab:'Farmácia Central',       data:'2024-05-06', inspetor:'Dr. Costa',   tipo:'Rotina',  resultado:'Aprovado'  },
  { id:4, estab:'Padaria Pão Quente',     data:'2024-05-03', inspetor:'Dr. Silva',   tipo:'Rotina',  resultado:'Aprovado'  },
];

let denuncias = [
  { id:1, estab:'Restaurante ABC',        categoria:'Higiene',        desc:'Cozinha sem limpeza adequada', data:'2024-05-09', status:'Pendente'   },
  { id:2, estab:'Supermercado Bom Preço', categoria:'Manipulação',    desc:'Alimentos fora da validade',   data:'2024-05-07', status:'Em análise' },
  { id:3, estab:'Padaria Pão Quente',     categoria:'Infraestrutura', desc:'Goteiras no teto',             data:'2024-05-05', status:'Resolvida'  },
];

const el   = id => document.getElementById(id);
const html = (id, h) => { el(id).innerHTML = h; };
const toast = msg => { el('toast').textContent = msg; el('toast').style.display = 'block'; setTimeout(() => el('toast').style.display = 'none', 3000); };
const badge = (val, map) => `<span class="badge ${map[val] || 'badge-blue'}">${val}</span>`;

const badgeStatus  = v => badge(v, { Ativo:'badge-green', Irregular:'badge-red', Inativo:'badge-yellow' });
const badgeResult  = v => badge(v, { Aprovado:'badge-green', Reprovado:'badge-red' });
const badgeDen     = v => badge(v, { Pendente:'badge-yellow', 'Em análise':'badge-blue', Resolvida:'badge-green' });

const barColor = n => n >= 80 ? '#48bb78' : n >= 60 ? '#f6ad55' : '#fc8181';

const searchBar = (placeholder, oninput, btnLabel, btnAction) => `
  <div class="search-bar">
    <div class="search-wrap">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" placeholder="${placeholder}" oninput="${oninput}(this.value)" />
    </div>
    <button class="btn-primary" onclick="${btnAction}">${btnLabel}</button>
  </div>`;

const pageHeader = (title, searchPlaceholder, oninput, btnLabel, btnAction) => `
  <div class="page-header">
    <h2>${title}</h2>
    ${searchBar(searchPlaceholder, oninput, btnLabel, btnAction)}
  </div>`;

function makeChart(id, type, labels, data, colors) {
  setTimeout(() => {
    const ctx = el(id);
    if (ctx) new Chart(ctx, {
      type,
      data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: Array.isArray(colors) ? colors : colors, fill: type === 'line', tension: 0.4, pointRadius: 4, backgroundColor: type === 'line' ? 'rgba(26,115,232,0.08)' : colors }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: type === 'doughnut' } }, scales: type !== 'doughnut' ? { y: { beginAtZero: true }, x: { grid: { display: false } } } : {} }
    });
  }, 100);
}

const toggleSenha = () => { const i = el('senha-input'); i.type = i.type === 'password' ? 'text' : 'password'; };

document.addEventListener('keydown', e => { if (e.key === 'Enter' && el('login-screen').style.display !== 'none') doLogin(); });

function doLogin() {
  const email = el('email-input').value.trim(), senha = el('senha-input').value, err = el('login-error');
  if (!email || !senha) { err.style.display = 'block'; err.textContent = 'Preencha e-mail e senha.'; return; }
  if (users.find(u => u.email === email && u.senha === senha)) {
    el('login-screen').style.display = 'none';
    el('dashboard-screen').style.display = 'block';
    showPage('dashboard');
  } else {
    err.style.display = 'block';
    err.textContent = 'Incorretos. Tente: admin@visa.gov.br / 123456';
  }
}

function doLogout() {
  el('dashboard-screen').style.display = 'none';
  el('login-screen').style.display = 'flex';
  ['email-input','senha-input'].forEach(id => el(id).value = '');
  el('login-error').style.display = 'none';
}

const pageTitles = { dashboard:'Dashboard', estabelecimentos:'Estabelecimentos', inspecoes:'Inspeções', denuncias:'Denúncias', relatorios:'Relatórios', configuracoes:'Configurações' };
const renders    = { dashboard: renderDashboard, estabelecimentos: renderEstabelecimentos, inspecoes: renderInspecoes, denuncias: renderDenuncias, relatorios: renderRelatorios, configuracoes: renderConfiguracoes };

function showPage(page) {
  Object.keys(pageTitles).forEach(p => { const n = el('nav-' + p); if (n) n.classList.remove('active'); });
  const n = el('nav-' + page); if (n) n.classList.add('active');
  el('topbar-title').textContent = pageTitles[page] || page;
  renders[page]?.(el('main-content'));
}

function renderDashboard(c) {
  c.innerHTML = `
    <div class="metrics-grid">
      ${[['Total Estabelecimentos','1.247','+12% este mês',''],['Inspeções Realizadas','342','+8% este mês',''],['Denúncias Pendentes','28','Requer atenção','warn'],['Taxa de Conformidade','87%','+3% este mês','']].map(([l,v,s,cls]) => `
        <div class="metric-card"><div class="card-label">${l}</div><div class="card-value">${v}</div><div class="card-sub ${cls}">${s}</div></div>`).join('')}
    </div>
    <div class="charts-row">
      <div class="chart-card"><h3>Inspeções por Mês</h3><div class="chart-wrap"><canvas id="chart-inspecoes"></canvas></div></div>
      <div class="chart-card"><h3>Atividades Recentes</h3><div class="activity-list">
        ${['1h','2h','3h','4h','5h'].map(t => `<div class="activity-item"><div class="activity-dot"></div><div><strong>Inspeção realizada</strong><span>Restaurante ABC — Há ${t}</span></div></div>`).join('')}
      </div></div>
    </div>`;
  makeChart('chart-inspecoes','line',['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],[28,35,42,38,55,48,62,58,70,65,72,80],'#1a73e8');
}

function renderEstabelecimentos(c) {
  c.innerHTML = pageHeader(`Estabelecimentos (${estabelecimentos.length})`,'Buscar...','filtrarEstab','+ Novo',"showToast('Cadastro aberto')") + `
    <div class="section-card"><table>
      <thead><tr><th>Nome</th><th>Tipo</th><th>Bairro</th><th>Conformidade</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody id="estab-tbody">${rowsEstab(estabelecimentos)}</tbody>
    </table></div>`;
}
const rowsEstab = list => list.map(e => `<tr>
  <td style="font-weight:500">${e.nome}</td><td>${e.tipo}</td><td>${e.bairro}</td>
  <td><div style="display:flex;align-items:center;gap:8px"><div style="background:#e2e8f0;border-radius:4px;height:6px;width:80px;overflow:hidden"><div style="background:${barColor(e.conformidade)};width:${e.conformidade}%;height:100%"></div></div><span style="font-size:0.78rem">${e.conformidade}%</span></div></td>
  <td>${badgeStatus(e.status)}</td>
  <td><button class="btn-secondary" style="padding:4px 10px;font-size:0.75rem" onclick="showToast('Editando: ${e.nome}')">Editar</button>
      <button class="btn-danger"    style="padding:4px 10px;font-size:0.75rem;margin-left:4px" onclick="excluirEstab(${e.id})">Excluir</button></td>
</tr>`).join('');
const filtrarEstab = q => html('estab-tbody', rowsEstab(estabelecimentos.filter(e => e.nome.toLowerCase().includes(q.toLowerCase()) || e.bairro.toLowerCase().includes(q.toLowerCase()))));
function excluirEstab(id) { if (confirm('Excluir?')) { estabelecimentos = estabelecimentos.filter(e => e.id !== id); renderEstabelecimentos(el('main-content')); toast('Removido'); } }

function renderInspecoes(c) {
  c.innerHTML = pageHeader(`Inspeções (${inspecoes.length})`,'Buscar...','filtrarInspecoes','+ Nova Inspeção',"openModal('modal-inspecao')") + `
    <div class="section-card"><table>
      <thead><tr><th>Estabelecimento</th><th>Data</th><th>Inspetor</th><th>Tipo</th><th>Resultado</th><th>Ações</th></tr></thead>
      <tbody id="insp-tbody">${rowsInsp(inspecoes)}</tbody>
    </table></div>`;
}
const rowsInsp = list => list.map(i => `<tr>
  <td style="font-weight:500">${i.estab}</td><td>${i.data}</td><td>${i.inspetor}</td>
  <td>${badge(i.tipo,{})}</td><td>${badgeResult(i.resultado)}</td>
  <td><button class="btn-secondary" style="padding:4px 10px;font-size:0.75rem" onclick="showToast('Ver inspeção #${i.id}')">Ver</button>
      <button class="btn-danger"    style="padding:4px 10px;font-size:0.75rem;margin-left:4px" onclick="excluirInspecao(${i.id})">Excluir</button></td>
</tr>`).join('');
const filtrarInspecoes = q => html('insp-tbody', rowsInsp(inspecoes.filter(i => i.estab.toLowerCase().includes(q.toLowerCase()) || i.inspetor.toLowerCase().includes(q.toLowerCase()))));
function excluirInspecao(id) { if (confirm('Excluir?')) { inspecoes = inspecoes.filter(i => i.id !== id); renderInspecoes(el('main-content')); toast('Removida'); } }

function renderDenuncias(c) {
  c.innerHTML = pageHeader(`Denúncias (${denuncias.length})`,'Buscar...','filtrarDenuncias','+ Nova Denúncia',"openModal('modal-denuncia')") + `
    <div class="section-card"><table>
      <thead><tr><th>Estabelecimento</th><th>Categoria</th><th>Descrição</th><th>Data</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody id="den-tbody">${rowsDen(denuncias)}</tbody>
    </table></div>`;
}
const rowsDen = list => list.map(d => `<tr>
  <td style="font-weight:500">${d.estab}</td><td>${d.categoria}</td>
  <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d.desc}</td><td>${d.data}</td>
  <td>${badgeDen(d.status)}</td>
  <td><button class="btn-secondary" style="padding:4px 10px;font-size:0.75rem" onclick="alterarStatus(${d.id})">Atualizar</button>
      <button class="btn-danger"    style="padding:4px 10px;font-size:0.75rem;margin-left:4px" onclick="excluirDenuncia(${d.id})">Excluir</button></td>
</tr>`).join('');
const filtrarDenuncias = q => html('den-tbody', rowsDen(denuncias.filter(d => d.estab.toLowerCase().includes(q.toLowerCase()) || d.categoria.toLowerCase().includes(q.toLowerCase()))));
function alterarStatus(id) {
  const d = denuncias.find(x => x.id === id); if (!d) return;
  const s = ['Pendente','Em análise','Resolvida'];
  d.status = s[(s.indexOf(d.status) + 1) % s.length];
  renderDenuncias(el('main-content')); toast('Status: ' + d.status);
}
function excluirDenuncia(id) { if (confirm('Excluir?')) { denuncias = denuncias.filter(d => d.id !== id); renderDenuncias(el('main-content')); toast('Removida'); } }

function renderRelatorios(c) {
  const ap = inspecoes.filter(i => i.resultado === 'Aprovado').length;
  const re = inspecoes.filter(i => i.resultado === 'Reprovado').length;
  const ab = denuncias.filter(d => d.status !== 'Resolvida').length;
  c.innerHTML = `
    <div class="page-header"><h2>Relatórios</h2></div>
    <div class="charts-row">
      <div class="chart-card"><h3>Conformidade por Estabelecimento</h3><div class="chart-wrap"><canvas id="chart-conf"></canvas></div></div>
      <div class="chart-card"><h3>Status das Denúncias</h3><div class="chart-wrap"><canvas id="chart-den"></canvas></div></div>
    </div>
    <div class="section-card"><h3>Resumo Geral</h3>
      <div class="metrics-grid" style="margin-top:1rem">
        ${[['Total Inspeções', inspecoes.length],['Aprovadas',ap],['Reprovadas',re],['Denúncias Abertas',ab]].map(([l,v]) => `<div class="metric-card"><div class="card-label">${l}</div><div class="card-value">${v}</div></div>`).join('')}
      </div>
    </div>
    <div style="text-align:right;margin-top:1rem">
      <button class="btn-primary" onclick="toast('PDF gerado!')">Exportar PDF</button>
      <button class="btn-secondary" style="margin-left:8px" onclick="toast('Excel gerado!')">Exportar Excel</button>
    </div>`;
  makeChart('chart-conf','bar', estabelecimentos.map(e => e.nome.split(' ').slice(0,2).join(' ')), estabelecimentos.map(e => e.conformidade), estabelecimentos.map(e => barColor(e.conformidade)));
  makeChart('chart-den','doughnut',['Pendente','Em análise','Resolvida'],[denuncias.filter(d=>d.status==='Pendente').length, denuncias.filter(d=>d.status==='Em análise').length, denuncias.filter(d=>d.status==='Resolvida').length],['#f6ad55','#63b3ed','#68d391']);
}

function renderConfiguracoes(c) {
  c.innerHTML = `
    <div class="page-header"><h2>Configurações</h2></div>
    <div class="section-card"><h3>Perfil do Usuário</h3>
      <div class="form-grid" style="margin-top:1rem">
        <div class="form-field"><label>Nome</label><input type="text" value="Administrador VISA" /></div>
        <div class="form-field"><label>E-mail</label><input type="email" value="admin@visa.gov.br" /></div>
        <div class="form-field"><label>Cargo</label><input type="text" value="Fiscal Sanitário" /></div>
        <div class="form-field"><label>CRF/CRM</label><input type="text" value="12345-PR" /></div>
      </div>
      <div class="form-actions"><button class="btn-primary" onclick="toast('Perfil salvo!')">Salvar Perfil</button></div>
    </div>
    <div class="section-card" style="margin-top:1rem"><h3>Alterar Senha</h3>
      <div class="form-grid" style="margin-top:1rem">
        <div class="form-field"><label>Senha Atual</label><input type="password" placeholder="••••••" /></div>
        <div class="form-field"><label>Nova Senha</label><input type="password" placeholder="••••••" /></div>
      </div>
      <div class="form-actions"><button class="btn-primary" onclick="toast('Senha alterada!')">Alterar Senha</button></div>
    </div>
    <div class="section-card" style="margin-top:1rem"><h3>Sobre o Sistema</h3>
      <p style="font-size:0.85rem;color:#718096;margin-top:0.5rem">Vigilância Sanitária v1.0.0 — Gestão e monitoramento de estabelecimentos.</p>
    </div>
    <div style="margin-top:1.5rem;text-align:right"><button class="btn-danger" onclick="doLogout()">Sair do Sistema</button></div>`;
}

const openModal  = id => el(id).classList.add('open');
const closeModal = id => el(id).classList.remove('open');

function salvarInspecao() {
  inspecoes.unshift({ id: inspecoes.length+1, estab:'Novo Estabelecimento', data: new Date().toISOString().split('T')[0], inspetor:'Dr. Silva', tipo:'Rotina', resultado:'Aprovado' });
  closeModal('modal-inspecao'); toast('Inspeção registrada!');
}
function salvarDenuncia() {
  denuncias.unshift({ id: denuncias.length+1, estab:'Estabelecimento', categoria:'Higiene', desc:'Nova denúncia', data: new Date().toISOString().split('T')[0], status:'Pendente' });
  closeModal('modal-denuncia'); toast('Denúncia registrada!');
}
function showToast(msg) { toast(msg); }
document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); }));
