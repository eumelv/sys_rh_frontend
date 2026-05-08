<template>
  <section id="tecnologia" class="tech">
    <div class="container">
      <div class="tech-content" v-observe>
        <span class="section-tag">Tecnologia</span>
        <h2>Construido Com Tecnologia de Ponta</h2>
        <p>O SYS RH e desenvolvido com as tecnologias mais modernas e robustas do mercado, garantindo performance, seguranca e escalabilidade para a sua empresa.</p>
        <div class="tech-grid">
          <div class="tech-item" v-for="t in techs" :key="t.name">
            <span class="tech-name">{{ t.name }}</span>
            <span class="tech-desc">{{ t.desc }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const techs = [
  { name: 'Laravel 12', desc: 'Backend robusto e seguro' },
  { name: 'Vue 3', desc: 'Interface reactiva e moderna' },
  { name: 'Multi-Tenant', desc: 'Isolamento total de dados' },
  { name: 'API REST', desc: 'Integracao flexivel' },
  { name: 'Cloud Native', desc: 'Disponibilidade global' },
  { name: 'Encriptacao', desc: 'Dados sempre protegidos' },
]
</script>

<style scoped>
.tech {
  padding: 6rem 0;
  background: linear-gradient(135deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%);
  position: relative; overflow: hidden;
}
.tech::before {
  content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(45,212,168,0.04) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}
.container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
.tech-content { position: relative; z-index: 1; text-align: center; opacity: 0; transform: translateY(30px); }
.tech-content.observed { opacity: 1; transform: translateY(0); }
.section-tag {
  display: inline-block; padding: 0.4rem 1.2rem; border-radius: 20px; font-size: 0.8rem;
  font-weight: 600; color: #2dd4a8; background: rgba(45,212,168,0.1);
  border: 1px solid rgba(45,212,168,0.2); margin-bottom: 1rem; letter-spacing: 1px; text-transform: uppercase;
}
.tech-content h2 { font-size: clamp(1.6rem, 3.5vw, 2.4rem); font-weight: 800; color: #fff; margin-bottom: 1rem; }
.tech-content > p { color: rgba(255,255,255,0.6); max-width: 600px; margin: 0 auto 3rem; line-height: 1.7; }
.tech-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
.tech-item {
  display: flex; flex-direction: column; gap: 0.3rem; padding: 1.5rem;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; transition: all 0.3s;
}
.tech-item:hover { border-color: rgba(45,212,168,0.25); transform: translateY(-3px); }
.tech-name { font-size: 1.05rem; font-weight: 700; color: #2dd4a8; }
.tech-desc { font-size: 0.85rem; color: rgba(255,255,255,0.5); }
@media (max-width: 768px) { .tech-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .tech-grid { grid-template-columns: 1fr; } }
</style>
