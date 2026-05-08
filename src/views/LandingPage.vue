<template>
  <div class="landing-page">
    <LandingNavbar />
    <LandingHero />
    <LandingAbout />
    <LandingFeatures />
    <LandingBenefits />
    <LandingPricing />
    <LandingFooter />

    <!-- WhatsApp Floating Button -->
    <a href="https://wa.me/244938378065" target="_blank" rel="noopener noreferrer"
       class="whatsapp-float" aria-label="Contactar via WhatsApp">
      <svg viewBox="0 0 32 32" width="28" height="28" fill="#fff">
        <path d="M16.004 2.003C8.268 2.003 2.003 8.268 2.003 16.004c0 2.467.644 4.877 1.868 6.998L2 30l7.168-1.88A13.94 13.94 0 0016.004 30c7.736 0 13.996-6.265 13.996-14S23.74 2.003 16.004 2.003zm0 25.594a11.56 11.56 0 01-5.9-1.615l-.424-.252-4.387 1.15 1.17-4.276-.276-.44a11.56 11.56 0 01-1.774-6.16c0-6.395 5.204-11.6 11.6-11.6 6.394 0 11.597 5.205 11.597 11.6s-5.203 11.593-11.606 11.593zm6.36-8.686c-.348-.174-2.063-1.018-2.383-1.134-.32-.116-.553-.174-.786.174-.232.348-.9 1.134-1.104 1.367-.203.232-.406.26-.754.087-.348-.174-1.47-.542-2.8-1.727-1.034-.922-1.733-2.06-1.937-2.41-.203-.347-.022-.535.153-.708.157-.156.348-.406.522-.61.174-.203.232-.347.348-.58.116-.231.058-.435-.03-.609-.087-.174-.785-1.893-1.076-2.592-.283-.68-.57-.588-.786-.6-.203-.01-.435-.012-.668-.012s-.61.087-.93.435c-.32.348-1.22 1.192-1.22 2.91s1.25 3.375 1.424 3.607c.174.232 2.46 3.754 5.96 5.265.832.36 1.483.574 1.99.735.837.266 1.598.228 2.2.138.67-.1 2.063-.843 2.354-1.658.29-.814.29-1.512.203-1.658-.087-.145-.32-.232-.668-.406z"/>
      </svg>
    </a>
  </div>
</template>

<script setup>
import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import LandingHero from '@/components/landing/LandingHero.vue'
import LandingAbout from '@/components/landing/LandingAbout.vue'
import LandingFeatures from '@/components/landing/LandingFeatures.vue'
import LandingBenefits from '@/components/landing/LandingBenefits.vue'
import LandingPricing from '@/components/landing/LandingPricing.vue'
import LandingTech from '@/components/landing/LandingTech.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&family=Roboto:wght@400;500;700;800;900&display=swap');

.landing-page {
  font-family: 'Roboto', 'Open Sans', sans-serif !important;
  background: #060d1f;
  color: #fff;
  overflow-x: hidden;
}
.landing-page *, .landing-page *::before, .landing-page *::after {
  box-sizing: border-box;
}
html { scroll-behavior: smooth; }

/* WhatsApp Floating Button */
.whatsapp-float {
  position: fixed; bottom: 28px; right: 28px; z-index: 999;
  width: 56px; height: 56px; border-radius: 50%;
  background: #25D366; color: #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.45);
  transition: all 0.3s ease; text-decoration: none;
  animation: whatsapp-pulse 2s infinite;
}
.whatsapp-float:hover {
  transform: scale(1.1); box-shadow: 0 6px 30px rgba(37, 211, 102, 0.6);
}
@keyframes whatsapp-pulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(37, 211, 102, 0.45); }
  50% { box-shadow: 0 4px 30px rgba(37, 211, 102, 0.7), 0 0 0 12px rgba(37, 211, 102, 0.1); }
}
</style>
