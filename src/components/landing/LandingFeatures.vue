<template>
  <section id="recursos" class="features">
    <video class="features-video" autoplay muted loop playsinline preload="auto"
      poster="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80">
      <source src="https://videos.pexels.com/video-files/3205918/3205918-sd_640_360_25fps.mp4" type="video/mp4">
    </video>
    <div class="features-overlay"></div>
    <div class="container">
      <div class="section-header" v-observe>
        <span class="section-tag">Funcionalidades</span>
        <h2>Tudo o Que Precisa Para Gerir Recursos Humanos</h2>
        <p>Ferramentas poderosas e integradas para cada aspecto da gestao de pessoas na sua empresa.</p>
      </div>
      <div class="features-grid">
        <div class="feature-card" v-for="(f, i) in features" :key="i" v-observe>
          <div class="feature-num">{{ String(i + 1).padStart(2, '0') }}</div>
          <h3>{{ f.title }}</h3>
          <ul>
            <li v-for="item in f.items" :key="item">{{ item }}</li>
          </ul>
          <div class="feature-glow"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const features = [
  { title: 'Gestao de Colaboradores', items: ['Cadastro completo', 'Departamentos', 'Cargos', 'Historico profissional'] },
  { title: 'Assiduidade e Ponto', items: ['Registo de entrada e saida', 'Mapa de faltas', 'Justificacoes automaticas'] },
  { title: 'Processamento Salarial', items: ['Folha salarial completa', 'PDFs automaticos', 'Historico de pagamentos'] },
  { title: 'Recrutamento', items: ['Pipeline Kanban', 'Portal de vagas publico', 'Gestao de candidatos'] },
  { title: 'Relatorios e Analytics', items: ['KPIs em tempo real', 'Analise de turnover', 'Relatorios PDF exportaveis'] },
  { title: 'Portal do Colaborador', items: ['Auto-servico completo', 'Consulta de recibos', 'Pedidos internos'] },
]
</script>

<style scoped>
.features { padding: 6rem 0; background: #080f1e; position: relative; overflow: hidden; }
.features-video {
  position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%;
  transform: translate(-50%,-50%); object-fit: cover; z-index: 0;
}
.features-overlay {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(135deg, rgba(5,10,24,0.93) 0%, rgba(8,15,30,0.88) 50%, rgba(5,10,24,0.95) 100%);
}
.container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; position: relative; z-index: 2; }
.section-header { text-align: center; margin-bottom: 4rem; }
.section-tag {
  display: inline-block; padding: 0.4rem 1.2rem; border-radius: 20px; font-size: 0.8rem;
  font-weight: 600; color: #2dd4a8; background: rgba(45,212,168,0.1);
  border: 1px solid rgba(45,212,168,0.2); margin-bottom: 1rem; letter-spacing: 1px; text-transform: uppercase;
}
.section-header h2 { font-size: clamp(1.6rem, 3.5vw, 2.4rem); font-weight: 800; color: #fff; margin-bottom: 1rem; }
.section-header p { color: rgba(255,255,255,0.6); max-width: 600px; margin: 0 auto; line-height: 1.7; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
.feature-card {
  position: relative; overflow: hidden; background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06); border-radius: 16px;
  padding: 2rem; transition: all 0.4s;
  opacity: 0; transform: translateY(30px);
}
.feature-card.observed { opacity: 1; transform: translateY(0); }
.feature-card:hover {
  border-color: rgba(45,212,168,0.25); transform: translateY(-4px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}
.feature-num {
  font-size: 2.5rem; font-weight: 900; color: rgba(45,212,168,0.12);
  line-height: 1; margin-bottom: 0.8rem;
}
.feature-card h3 { font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
.feature-card ul { list-style: none; padding: 0; margin: 0; }
.feature-card li {
  color: rgba(255,255,255,0.55); font-size: 0.88rem; padding: 0.35rem 0;
  padding-left: 1.2rem; position: relative; line-height: 1.5;
}
.feature-card li::before {
  content: ''; position: absolute; left: 0; top: 0.7rem;
  width: 6px; height: 6px; border-radius: 50%; background: #2dd4a8;
}
.feature-glow {
  position: absolute; bottom: -40px; right: -40px; width: 120px; height: 120px;
  background: radial-gradient(circle, rgba(45,212,168,0.08) 0%, transparent 70%);
  border-radius: 50%; transition: all 0.4s; pointer-events: none;
}
.feature-card:hover .feature-glow { transform: scale(2); opacity: 1; }
</style>
