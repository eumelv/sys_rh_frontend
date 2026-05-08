<template>
  <nav class="landing-nav" :class="{ scrolled: isScrolled, 'menu-open': menuOpen }">
    <div class="nav-container">
      <router-link to="/" class="nav-logo">
        
        <img src="/images/contentlogo_branco.png" width="100" alt="Logo" class="auth-logo" />
          
      </router-link>

      <div class="nav-links" :class="{ active: menuOpen }">
        <a href="#inicio" @click.prevent="scrollTo('inicio')">Inicio</a>
        <a href="#recursos" @click.prevent="scrollTo('recursos')">Recursos</a>
        <a href="#beneficios" @click.prevent="scrollTo('beneficios')">Beneficios</a>
        <a href="#preco" @click.prevent="scrollTo('preco')">Preco</a>
        <router-link to="/help" @click="menuOpen = false">Ajuda</router-link>
        <router-link to="/register" class="nav-cta" @click="menuOpen = false">Comecar Agora</router-link>
      </div>

      <button class="hamburger" @click="menuOpen = !menuOpen" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const menuOpen = ref(false)

const handleScroll = () => { isScrolled.value = window.scrollY > 50 }
const scrollTo = (id) => {
  menuOpen.value = false
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.landing-nav {
  position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;
  padding: 1rem 0; transition: all 0.4s ease;
}
.landing-nav.scrolled {
  background: rgba(8, 15, 30, 0.92); backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(45, 212, 168, 0.1); padding: 0.6rem 0;
  box-shadow: 0 4px 30px rgba(0,0,0,0.3);
}
.nav-container {
  max-width: 1280px; margin: 0 auto; padding: 0 2rem;
  display: flex; align-items: center; justify-content: space-between;
}
.nav-logo {
  display: flex; align-items: center; gap: 0.7rem;
  text-decoration: none; font-size: 1.4rem; font-weight: 700; color: #fff;
}
.logo-highlight { color: #2dd4a8; }
.nav-links {
  display: flex; align-items: center; gap: 2rem;
}
.nav-links a {
  color: rgba(255,255,255,0.75); text-decoration: none; font-size: 0.9rem;
  font-weight: 500; transition: color 0.3s; position: relative;
}
.nav-links a:hover { color: #2dd4a8; }
.nav-links a::after {
  content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px;
  background: #2dd4a8; transition: width 0.3s;
}
.nav-links a:hover::after { width: 100%; }
.nav-cta {
  background: linear-gradient(135deg, #2dd4a8, #0f4c81) !important;
  color: #fff !important; padding: 0.6rem 1.5rem; border-radius: 8px;
  font-weight: 600 !important; transition: transform 0.3s, box-shadow 0.3s !important;
}
.nav-cta::after { display: none !important; }
.nav-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(45,212,168,0.35); }
.hamburger {
  display: none; flex-direction: column; gap: 5px; background: none;
  border: none; cursor: pointer; padding: 4px;
}
.hamburger span {
  width: 24px; height: 2px; background: #fff; transition: all 0.3s;
}
@media (max-width: 768px) {
  .hamburger { display: flex; }
  .nav-links {
    position: fixed; top: 0; right: -100%; width: 280px; height: 100vh;
    background: rgba(8,15,30,0.98); backdrop-filter: blur(20px);
    flex-direction: column; padding: 5rem 2rem 2rem; gap: 1.5rem;
    transition: right 0.4s ease;
  }
  .nav-links.active { right: 0; }
  .menu-open .hamburger span:nth-child(1) { transform: rotate(45deg) translate(5px,5px); }
  .menu-open .hamburger span:nth-child(2) { opacity: 0; }
  .menu-open .hamburger span:nth-child(3) { transform: rotate(-45deg) translate(5px,-5px); }
}
</style>
