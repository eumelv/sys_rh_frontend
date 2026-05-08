<template>
  <section id="beneficios" class="benefits">
    <div class="container">
      <div class="section-header" v-observe>
        <span class="section-tag">Beneficios</span>
        <h2>Porque Escolher o SYS RH</h2>
        <p>Resultados reais para empresas que valorizam a gestao eficiente de pessoas.</p>
      </div>

      <div class="stats-row" v-observe>
        <div class="stat" v-for="s in stats" :key="s.label">
          <span class="stat-value">{{ s.value }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </div>

      <div class="benefits-grid">
        <div class="benefit-item" v-for="(b, i) in benefits" :key="i" v-observe>
          <div class="benefit-icon" v-html="b.icon"></div>
          <div>
            <h3>{{ b.title }}</h3>
            <p>{{ b.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const stats = [
  { value: '+100', label: 'Empresas Activas' },
  { value: '+10.000', label: 'Colaboradores Geridos' },
  { value: '99.9%', label: 'Uptime Garantido' },
  { value: '<2h', label: 'Tempo de Resposta' },
]
const benefits = [
  { title: 'Reducao de Trabalho Manual', desc: 'Automatize tarefas repetitivas e foque-se no que importa.', icon: '<svg width="24" height="24" fill="none" stroke="#2dd4a8" stroke-width="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>' },
  { title: 'Automatizacao de RH', desc: 'Processos salariais, relatorios e notificacoes automaticos.', icon: '<svg width="24" height="24" fill="none" stroke="#2dd4a8" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' },
  { title: 'Maior Controlo', desc: 'Visao completa de todos os colaboradores e processos em tempo real.', icon: '<svg width="24" height="24" fill="none" stroke="#2dd4a8" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' },
  { title: 'Melhor Produtividade', desc: 'Equipa mais produtiva com ferramentas integradas e eficientes.', icon: '<svg width="24" height="24" fill="none" stroke="#2dd4a8" stroke-width="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' },
  { title: 'Dados Organizados', desc: 'Toda a informacao centralizada e acessivel numa unica plataforma.', icon: '<svg width="24" height="24" fill="none" stroke="#2dd4a8" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><circle cx="6" cy="6" r="1" fill="#2dd4a8"/><circle cx="6" cy="18" r="1" fill="#2dd4a8"/></svg>' },
  { title: 'Acesso em Qualquer Lugar', desc: 'Plataforma cloud acessivel via browser em qualquer dispositivo.', icon: '<svg width="24" height="24" fill="none" stroke="#2dd4a8" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' },
]
</script>

<style scoped>
.benefits { padding: 6rem 0; background: linear-gradient(180deg, #060d1f 0%, #0a1628 100%); }
.container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
.section-header { text-align: center; margin-bottom: 3rem; }
.section-tag {
  display: inline-block; padding: 0.4rem 1.2rem; border-radius: 20px; font-size: 0.8rem;
  font-weight: 600; color: #2dd4a8; background: rgba(45,212,168,0.1);
  border: 1px solid rgba(45,212,168,0.2); margin-bottom: 1rem; letter-spacing: 1px; text-transform: uppercase;
}
.section-header h2 { font-size: clamp(1.6rem, 3.5vw, 2.4rem); font-weight: 800; color: #fff; margin-bottom: 1rem; }
.section-header p { color: rgba(255,255,255,0.6); max-width: 600px; margin: 0 auto; line-height: 1.7; }

.stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;
  margin-bottom: 4rem; opacity: 0; transform: translateY(30px);
}
.stats-row.observed { opacity: 1; transform: translateY(0); }
.stat {
  text-align: center; padding: 2rem 1rem; border-radius: 16px;
  background: rgba(45,212,168,0.04); border: 1px solid rgba(45,212,168,0.1);
}
.stat-value { display: block; font-size: 2.2rem; font-weight: 900; color: #2dd4a8; }
.stat-label { font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 0.3rem; display: block; }

.benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.2rem; }
.benefit-item {
  display: flex; align-items: flex-start; gap: 1rem; padding: 1.5rem;
  border-radius: 12px; transition: all 0.3s;
  opacity: 0; transform: translateY(20px);
}
.benefit-item.observed { opacity: 1; transform: translateY(0); }
.benefit-item:hover { background: rgba(255,255,255,0.03); }
.benefit-icon {
  flex-shrink: 0; width: 44px; height: 44px; border-radius: 10px;
  background: rgba(45,212,168,0.08); border: 1px solid rgba(45,212,168,0.15);
  display: flex; align-items: center; justify-content: center;
}
.benefit-item h3 { font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.3rem; }
.benefit-item p { font-size: 0.85rem; color: rgba(255,255,255,0.5); line-height: 1.5; }
@media (max-width: 768px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .stats-row { grid-template-columns: 1fr; } }
</style>
