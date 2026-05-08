<template>
  <section id="inicio" class="hero">
    <video class="hero-video" autoplay muted loop playsinline preload="auto"
      poster="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80">
      <source src="https://videos.pexels.com/video-files/3205918/3205918-sd_640_360_25fps.mp4" type="video/mp4">
    </video>
    <div class="hero-overlay"></div>
    <div class="hero-content" :class="{ visible: loaded }">
      <h1>Gestão de Recursos Humanos Inteligente para Empresas Modernas</h1>
      <p class="hero-sub">O SYS RH automatiza processos, simplifica a gestao de colaboradores e ajuda a sua empresa a crescer com eficiencia.</p>
      <div class="hero-btns">
        <router-link to="/register" class="btn-primary">Testar Agora</router-link>
        <a href="#recursos" class="btn-outline" @click.prevent="scrollTo('recursos')">Ver Recursos</a>
      </div>
      <div class="hero-badges">
        <span>Sem Cartao de Credito</span>
        <span>Suporte Incluido</span>
        <span>Setup em 5 min</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const loaded = ref(false)
const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
onMounted(() => { setTimeout(() => loaded.value = true, 200) })
</script>

<style scoped>
.hero {
  position: relative; min-height: 100vh; display: flex; align-items: center;
  justify-content: center; overflow: hidden;
}
.hero-video {
  position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%;
  transform: translate(-50%,-50%); object-fit: cover; z-index: 0;
}
.hero-overlay {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(135deg, rgba(5,10,24,0.88) 0%, rgba(15,76,129,0.7) 50%, rgba(5,10,24,0.85) 100%);
}
.hero-content {
  position: relative; z-index: 2; text-align: center; max-width: 800px;
  padding: 0 2rem; opacity: 0; transform: translateY(40px);
  transition: all 1s cubic-bezier(0.16,1,0.3,1);
}
.hero-content.visible { opacity: 1; transform: translateY(0); }
.hero h1 {
  font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.15;
  color: #fff; margin-bottom: 1.2rem;
  background: linear-gradient(135deg, #fff 0%, #2dd4a8 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-sub {
  font-size: clamp(1rem, 2vw, 1.2rem); color: rgba(255,255,255,0.8);
  line-height: 1.7; margin-bottom: 2rem; max-width: 620px; margin-left: auto; margin-right: auto;
}
.hero-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
.btn-primary {
  padding: 0.9rem 2.2rem; border-radius: 10px; font-weight: 700; font-size: 1rem;
  background: linear-gradient(135deg, #2dd4a8, #0f4c81); color: #fff;
  text-decoration: none; transition: all 0.3s; border: none; cursor: pointer;
}
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 35px rgba(45,212,168,0.4); }
.btn-outline {
  padding: 0.9rem 2.2rem; border-radius: 10px; font-weight: 700; font-size: 1rem;
  border: 2px solid rgba(45,212,168,0.5); color: #2dd4a8;
  text-decoration: none; transition: all 0.3s; background: transparent;
}
.btn-outline:hover { background: rgba(45,212,168,0.1); border-color: #2dd4a8; transform: translateY(-3px); }
.hero-badges { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; }
.hero-badges span {
  font-size: 0.8rem; color: rgba(255,255,255,0.6); display: flex; align-items: center; gap: 0.4rem;
}
.hero-badges span::before {
  content: ''; width: 6px; height: 6px; border-radius: 50%; background: #2dd4a8;
}
@media (max-width: 600px) {
  .hero-btns { flex-direction: column; align-items: center; }
  .btn-primary, .btn-outline { width: 100%; max-width: 280px; text-align: center; }
}
</style>
