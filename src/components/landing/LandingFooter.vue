<template>
  <footer class="landing-footer">
    <div class="container">
     
      <div class="footer-bottom">
        <p>&copy; {{ year }} SYS RH. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.landing-footer {
  padding: 4rem 0 0; background: #040a18;
  border-top: 1px solid rgba(255,255,255,0.04);
}
.container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; margin-bottom: 3rem; }
.footer-brand p { color: rgba(255,255,255,0.45); font-size: 0.88rem; line-height: 1.7; margin-top: 1rem; max-width: 300px; }
.footer-logo {
  display: flex; align-items: center; gap: 0.6rem; font-size: 1.2rem; color: #fff; font-weight: 700;
}
.footer-logo b { color: #2dd4a8; }
.footer-links { display: flex; flex-direction: column; gap: 0.6rem; }
.footer-links h4 { font-size: 0.9rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
.footer-links a, .footer-links span {
  color: rgba(255,255,255,0.4); font-size: 0.85rem; text-decoration: none; transition: color 0.3s;
}
.footer-links a:hover { color: #2dd4a8; }
.footer-bottom {
  padding: 1.5rem 0; border-top: 1px solid rgba(255,255,255,0.04);
  text-align: center;
}
.footer-bottom p { font-size: 0.8rem; color: rgba(255,255,255,0.3); }
@media (max-width: 768px) {
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
}
@media (max-width: 480px) {
  .footer-grid { grid-template-columns: 1fr; }
}
</style>
