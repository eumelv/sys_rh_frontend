<template>
  <section id="sobre" class="about">
    <div class="container">
      <div class="section-header" v-observe>
        <span class="section-tag">Sobre o SYS RH</span>
        <h2>Plataforma Completa de Gestao de Recursos Humanos</h2>
        <p>O SYS RH e uma plataforma SaaS moderna desenvolvida para empresas que procuram automatizar processos internos, melhorar o controlo de colaboradores e aumentar a produtividade.</p>
      </div>
      <div class="about-grid">
        <div class="about-card" v-for="(item, i) in items" :key="i" v-observe>
          <div class="card-icon" v-html="item.icon"></div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const items = [
  { title: 'Multiempresa', desc: 'Gira varias empresas numa unica plataforma com dados isolados e seguros.', icon: '<svg width="28" height="28" fill="none" stroke="#2dd4a8" stroke-width="2" viewBox="0 0 24 24"><path d="M3 21h18M3 7v14m18-14v14M6 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-6 4h4m-4 4h4m6-8h2m-2 4h2"/></svg>' },
  { title: 'Gestao Centralizada', desc: 'Todos os processos de RH centralizados num painel intuitivo e acessivel.', icon: '<svg width="28" height="28" fill="none" stroke="#2dd4a8" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83"/></svg>' },
  { title: 'Seguranca', desc: 'Protecao de dados por empresa com autenticacao robusta e encriptacao.', icon: '<svg width="28" height="28" fill="none" stroke="#2dd4a8" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
  { title: 'Automacao', desc: 'Automatize folhas salariais, relatorios, notificacoes e muito mais.', icon: '<svg width="28" height="28" fill="none" stroke="#2dd4a8" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' },
  { title: 'Plataforma Cloud', desc: 'Aceda de qualquer lugar com total disponibilidade e performance.', icon: '<svg width="28" height="28" fill="none" stroke="#2dd4a8" stroke-width="2" viewBox="0 0 24 24"><path d="M18 10a6 6 0 00-11.18-2A5 5 0 007 18h11a4 4 0 000-8z"/></svg>' },
  { title: 'Interface Intuitiva', desc: 'Design moderno e facil de usar, sem necessidade de formacao extensa.', icon: '<svg width="28" height="28" fill="none" stroke="#2dd4a8" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>' },
]
</script>

<style scoped>
.about { padding: 6rem 0; background: #060d1f; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
.section-header { text-align: center; margin-bottom: 4rem; }
.section-tag {
  display: inline-block; padding: 0.4rem 1.2rem; border-radius: 20px; font-size: 0.8rem;
  font-weight: 600; color: #2dd4a8; background: rgba(45,212,168,0.1);
  border: 1px solid rgba(45,212,168,0.2); margin-bottom: 1rem; letter-spacing: 1px; text-transform: uppercase;
}
.section-header h2 {
  font-size: clamp(1.6rem, 3.5vw, 2.4rem); font-weight: 800; color: #fff; margin-bottom: 1rem;
}
.section-header p { color: rgba(255,255,255,0.6); max-width: 600px; margin: 0 auto; line-height: 1.7; }
.about-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;
}
.about-card {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px; padding: 2rem; transition: all 0.4s;
  opacity: 0; transform: translateY(30px);
}
.about-card.observed { opacity: 1; transform: translateY(0); }
.about-card:hover {
  border-color: rgba(45,212,168,0.3); transform: translateY(-6px);
  background: rgba(45,212,168,0.04); box-shadow: 0 15px 40px rgba(0,0,0,0.3);
}
.card-icon {
  width: 52px; height: 52px; border-radius: 12px; display: flex;
  align-items: center; justify-content: center; margin-bottom: 1.2rem;
  background: rgba(45,212,168,0.08); border: 1px solid rgba(45,212,168,0.15);
}
.about-card h3 { font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
.about-card p { color: rgba(255,255,255,0.55); font-size: 0.9rem; line-height: 1.6; }
</style>
