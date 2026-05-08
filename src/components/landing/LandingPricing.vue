<template>
  <section id="preco" class="pricing">
    <div class="container">
      <div class="section-header" v-observe>
        <span class="section-tag">Preco</span>
        <h2>Um Plano Simples. Tudo Incluido.</h2>
        <p>Sem surpresas, sem custos escondidos. Tudo o que precisa num unico plano profissional.</p>
      </div>
      <div class="pricing-card" v-observe>
        <div class="pricing-glow"></div>
        <div class="plan-badge">Recomendado</div>
        <h3>Plano Profissional</h3>
        <div class="plan-price">
          <span class="price-amount">9.900</span>
          <div class="price-details">
            <span class="price-currency">Kz</span>
            <span class="price-period">/mes</span>
          </div>
        </div>
        <ul class="plan-features">
          <li v-for="f in planFeatures" :key="f">
            <svg width="18" height="18" fill="none" stroke="#2dd4a8" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
            {{ f }}
          </li>
        </ul>
        <router-link to="/register" class="plan-cta">Comecar Agora</router-link>
        <p class="plan-note">Sem compromisso. Cancele quando quiser.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
const planFeatures = [
  'Gestao completa de RH',
  'Processamento salarial (Payroll)',
  'Controlo de assiduidade',
  'Modulo de recrutamento (ATS)',
  'Relatorios e analytics',
  'Portal do colaborador',
  'Suporte tecnico dedicado',
  'Actualizacoes gratuitas',
]
</script>

<style scoped>
.pricing { padding: 6rem 0; background: #060d1f; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
.section-header { text-align: center; margin-bottom: 3rem; }
.section-tag {
  display: inline-block; padding: 0.4rem 1.2rem; border-radius: 20px; font-size: 0.8rem;
  font-weight: 600; color: #2dd4a8; background: rgba(45,212,168,0.1);
  border: 1px solid rgba(45,212,168,0.2); margin-bottom: 1rem; letter-spacing: 1px; text-transform: uppercase;
}
.section-header h2 { font-size: clamp(1.6rem, 3.5vw, 2.4rem); font-weight: 800; color: #fff; margin-bottom: 1rem; }
.section-header p { color: rgba(255,255,255,0.6); max-width: 600px; margin: 0 auto; line-height: 1.7; }

.pricing-card {
  position: relative; max-width: 440px; margin: 0 auto; padding: 3rem;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(45,212,168,0.2);
  border-radius: 24px; text-align: center; overflow: hidden;
  opacity: 0; transform: translateY(30px);
}
.pricing-card.observed { opacity: 1; transform: translateY(0); }
.pricing-glow {
  position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(45,212,168,0.15) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}
.plan-badge {
  display: inline-block; padding: 0.3rem 1rem; border-radius: 20px; font-size: 0.75rem;
  font-weight: 700; color: #060d1f; background: linear-gradient(135deg, #2dd4a8, #0f4c81);
  margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 1px;
}
.pricing-card h3 { font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 1.5rem; }
.plan-price { display: flex; align-items: flex-end; justify-content: center; gap: 0.3rem; margin-bottom: 2rem; }
.price-amount { font-size: 3.5rem; font-weight: 900; color: #2dd4a8; line-height: 1; }
.price-details { display: flex; flex-direction: column; align-items: flex-start; padding-bottom: 0.4rem; }
.price-currency { font-size: 1.2rem; font-weight: 700; color: rgba(255,255,255,0.7); }
.price-period { font-size: 0.85rem; color: rgba(255,255,255,0.4); }
.plan-features { list-style: none; padding: 0; margin: 0 0 2rem; text-align: left; }
.plan-features li {
  display: flex; align-items: center; gap: 0.7rem; padding: 0.6rem 0;
  color: rgba(255,255,255,0.7); font-size: 0.92rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.plan-features li:last-child { border-bottom: none; }
.plan-cta {
  display: inline-block; width: 100%; padding: 1rem; border-radius: 12px;
  background: linear-gradient(135deg, #2dd4a8, #0f4c81); color: #fff;
  font-weight: 700; font-size: 1.05rem; text-decoration: none;
  transition: all 0.3s; border: none; cursor: pointer;
}
.plan-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 35px rgba(45,212,168,0.35); }
.plan-note { font-size: 0.78rem; color: rgba(255,255,255,0.35); margin-top: 1rem; }
</style>
