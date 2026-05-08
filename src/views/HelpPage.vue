<template>
  <div class="help-page">
    <!-- Navbar -->
    <nav class="help-nav">
      <div class="nav-container">
        <router-link to="/" class="nav-logo">
                  <img src="/images/contentlogo_branco.png" width="100" alt="Logo" class="auth-logo" />

        </router-link>
        <div class="nav-actions">
          <router-link to="/" class="back-link">Voltar ao Inicio</router-link>
          <router-link to="/register" class="nav-cta">Comecar Agora</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <header class="help-hero">
      <h1>Centro de Ajuda</h1>
      <p>Encontre respostas rapidas e guias passo a passo para utilizar o SYS RH.</p>
    </header>

    <!-- Content -->
    <main class="help-content">
      <div class="container">
        <!-- Sidebar Nav -->
        <aside class="help-sidebar">
          <h3>Topicos</h3>
          <a v-for="(s, i) in sections" :key="i" :href="'#' + s.id"
             :class="{ active: activeSection === s.id }"
             @click.prevent="scrollToSection(s.id)">
            {{ s.title }}
          </a>
        </aside>

        <!-- Articles -->
        <div class="help-articles">
          <!-- Intro -->
          <article id="introducao" class="help-article">
            <h2>Introducao ao SYS RH</h2>
            <p>O SYS RH e uma plataforma SaaS moderna de Gestao de Recursos Humanos. Este guia ajuda-o a comecar a utilizar todas as funcionalidades do sistema de forma rapida e eficiente.</p>
            <div class="info-box">
              <strong>Dica:</strong> O SYS RH funciona inteiramente no browser. Nao precisa de instalar nenhum software.
            </div>
          </article>

          <!-- Criar Conta -->
          <article id="criar-conta" class="help-article">
            <h2>Como Criar Conta</h2>
            <div class="steps">
              <div class="step" v-for="(st, i) in createSteps" :key="i">
                <span class="step-num">{{ i + 1 }}</span>
                <div>
                  <h4>{{ st.title }}</h4>
                  <p>{{ st.desc }}</p>
                </div>
              </div>
            </div>
          </article>

          <!-- Iniciar Sessao -->
          <article id="iniciar-sessao" class="help-article">
            <h2>Como Iniciar Sessao</h2>
            <div class="steps">
              <div class="step">
                <span class="step-num">1</span>
                <div><h4>Aceda a pagina de login</h4><p>Navegue ate a pagina de login do SYS RH.</p></div>
              </div>
              <div class="step">
                <span class="step-num">2</span>
                <div><h4>Introduza as credenciais</h4><p>Use o e-mail e palavra-passe que definiu durante o registo.</p></div>
              </div>
              <div class="step">
                <span class="step-num">3</span>
                <div><h4>Aceda ao dashboard</h4><p>Sera redirecionado automaticamente para o painel de administracao.</p></div>
              </div>
            </div>
          </article>

          <!-- Colaboradores -->
          <article id="colaboradores" class="help-article">
            <h2>Como Cadastrar Colaboradores</h2>
            <div class="steps">
              <div class="step">
                <span class="step-num">1</span>
                <div><h4>Aceda ao menu Colaboradores</h4><p>No painel lateral, clique em "Colaboradores".</p></div>
              </div>
              <div class="step">
                <span class="step-num">2</span>
                <div><h4>Clique em "Novo Colaborador"</h4><p>Preencha todos os dados pessoais, departamento e cargo.</p></div>
              </div>
              <div class="step">
                <span class="step-num">3</span>
                <div><h4>Guarde o registo</h4><p>Clique em "Guardar" para confirmar o cadastro do colaborador.</p></div>
              </div>
            </div>
          </article>

          <!-- Salarios -->
          <article id="salarios" class="help-article">
            <h2>Como Processar Salarios</h2>
            <div class="steps">
              <div class="step">
                <span class="step-num">1</span>
                <div><h4>Aceda ao modulo Payroll</h4><p>No menu, seleccione "Processamento Salarial".</p></div>
              </div>
              <div class="step">
                <span class="step-num">2</span>
                <div><h4>Seleccione o periodo</h4><p>Escolha o mes e ano para processamento.</p></div>
              </div>
              <div class="step">
                <span class="step-num">3</span>
                <div><h4>Gere a folha salarial</h4><p>O sistema calcula automaticamente os valores. Revise e confirme.</p></div>
              </div>
              <div class="step">
                <span class="step-num">4</span>
                <div><h4>Exporte PDFs</h4><p>Descarregue os recibos individuais ou a folha completa em PDF.</p></div>
              </div>
            </div>
          </article>

          <!-- Presenca -->
          <article id="presenca" class="help-article">
            <h2>Como Marcar Presenca</h2>
            <div class="steps">
              <div class="step">
                <span class="step-num">1</span>
                <div><h4>Aceda a Assiduidade</h4><p>No menu, clique em "Assiduidade".</p></div>
              </div>
              <div class="step">
                <span class="step-num">2</span>
                <div><h4>Registe entrada/saida</h4><p>Marque a presenca dos colaboradores ou utilize o registo automatico.</p></div>
              </div>
              <div class="step">
                <span class="step-num">3</span>
                <div><h4>Consulte o mapa de faltas</h4><p>Visualize e gira justificacoes de ausencia.</p></div>
              </div>
            </div>
          </article>

          <!-- Relatorios -->
          <article id="relatorios" class="help-article">
            <h2>Como Consultar Relatorios</h2>
            <div class="steps">
              <div class="step">
                <span class="step-num">1</span>
                <div><h4>Aceda a Relatorios</h4><p>No menu, seleccione "Relatorios e Analytics".</p></div>
              </div>
              <div class="step">
                <span class="step-num">2</span>
                <div><h4>Escolha o tipo de relatorio</h4><p>Seleccione entre KPIs, turnover, assiduidade, entre outros.</p></div>
              </div>
              <div class="step">
                <span class="step-num">3</span>
                <div><h4>Filtre e exporte</h4><p>Aplique filtros por periodo e exporte em PDF.</p></div>
              </div>
            </div>
          </article>

          <!-- FAQ -->
          <article id="faq" class="help-article">
            <h2>Perguntas Frequentes</h2>
            <div class="faq-list">
              <div class="faq-item" v-for="(f, i) in faqs" :key="i" @click="toggleFaq(i)">
                <div class="faq-question" :class="{ open: openFaq === i }">
                  <span>{{ f.q }}</span>
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
                <div class="faq-answer" v-show="openFaq === i">
                  <p>{{ f.a }}</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="help-footer">
      <p>&copy; {{ year }} SYS RH. Todos os direitos reservados.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const year = new Date().getFullYear()
const activeSection = ref('introducao')
const openFaq = ref(null)

const sections = [
  { id: 'introducao', title: 'Introducao' },
  { id: 'criar-conta', title: 'Como Criar Conta' },
  { id: 'iniciar-sessao', title: 'Como Iniciar Sessao' },
  { id: 'colaboradores', title: 'Cadastrar Colaboradores' },
  { id: 'salarios', title: 'Processar Salarios' },
  { id: 'presenca', title: 'Marcar Presenca' },
  { id: 'relatorios', title: 'Consultar Relatorios' },
  { id: 'faq', title: 'FAQ' },
]

const createSteps = [
  { title: 'Clique em "Comecar Agora"', desc: 'Na pagina inicial, clique no botao de registo.' },
  { title: 'Preencha os dados da empresa', desc: 'Introduza o nome da empresa, NIF e dados de contacto.' },
  { title: 'Configure a conta', desc: 'Defina o e-mail e palavra-passe do administrador.' },
  { title: 'Aceda ao dashboard', desc: 'Apos o registo, sera redirecionado para o painel de gestao.' },
]

const faqs = [
  { q: 'Como recuperar a minha senha?', a: 'Na pagina de login, clique em "Esqueceu a senha?" e siga as instrucoes enviadas para o seu e-mail.' },
  { q: 'Como adicionar funcionarios?', a: 'No menu lateral, aceda a "Colaboradores" e clique em "Novo Colaborador". Preencha os dados e guarde.' },
  { q: 'O sistema funciona no telemovel?', a: 'Sim, o SYS RH e totalmente responsivo e funciona em qualquer dispositivo com browser.' },
  { q: 'Os dados estao seguros?', a: 'Sim, utilizamos encriptacao de ponta, isolamento multi-tenant e backups automaticos.' },
  { q: 'Existe suporte tecnico?', a: 'Sim, disponibilizamos suporte via e-mail e telefone em horario comercial com tempo de resposta inferior a 2 horas.' },
]

const toggleFaq = (i) => { openFaq.value = openFaq.value === i ? null : i }

const scrollToSection = (id) => {
  activeSection.value = id
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;800&display=swap');
.help-page { font-family: 'Roboto', sans-serif; background: #060d1f; color: #fff; min-height: 100vh; }

/* Nav */
.help-nav { position: sticky; top: 0; z-index: 100; background: rgba(8,15,30,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 0.8rem 0; }
.nav-container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; }
.nav-logo { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; color: #fff; font-size: 1.2rem; font-weight: 700; }
.nav-logo b { color: #2dd4a8; }
.nav-actions { display: flex; align-items: center; gap: 1rem; }
.back-link { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.88rem; transition: color 0.3s; }
.back-link:hover { color: #2dd4a8; }
.nav-cta { padding: 0.5rem 1.2rem; border-radius: 8px; background: linear-gradient(135deg,#2dd4a8,#0f4c81); color: #fff; text-decoration: none; font-weight: 600; font-size: 0.85rem; transition: all 0.3s; }
.nav-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(45,212,168,0.3); }

/* Hero */
.help-hero { text-align: center; padding: 5rem 2rem 3rem; background: linear-gradient(180deg, #0a1628 0%, #060d1f 100%); }
.help-hero h1 { font-size: clamp(1.8rem,4vw,2.8rem); font-weight: 800; margin-bottom: 0.8rem; background: linear-gradient(135deg,#fff,#2dd4a8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.help-hero p { color: rgba(255,255,255,0.6); font-size: 1.05rem; max-width: 500px; margin: 0 auto; }

/* Content Layout */
.help-content { padding: 3rem 0 4rem; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: grid; grid-template-columns: 240px 1fr; gap: 3rem; }

/* Sidebar */
.help-sidebar { position: sticky; top: 80px; align-self: start; }
.help-sidebar h3 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.4); margin-bottom: 1rem; }
.help-sidebar a { display: block; padding: 0.6rem 1rem; color: rgba(255,255,255,0.5); text-decoration: none; font-size: 0.88rem; border-left: 2px solid transparent; transition: all 0.3s; border-radius: 0 6px 6px 0; }
.help-sidebar a:hover, .help-sidebar a.active { color: #2dd4a8; border-left-color: #2dd4a8; background: rgba(45,212,168,0.05); }

/* Articles */
.help-article { margin-bottom: 3rem; padding-bottom: 3rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
.help-article:last-child { border-bottom: none; }
.help-article h2 { font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 1rem; }
.help-article > p { color: rgba(255,255,255,0.6); line-height: 1.7; margin-bottom: 1.5rem; }

.info-box { padding: 1rem 1.2rem; border-radius: 10px; background: rgba(45,212,168,0.06); border: 1px solid rgba(45,212,168,0.15); color: rgba(255,255,255,0.7); font-size: 0.9rem; line-height: 1.6; }

/* Steps */
.steps { display: flex; flex-direction: column; gap: 1rem; }
.step { display: flex; align-items: flex-start; gap: 1rem; padding: 1.2rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; transition: all 0.3s; }
.step:hover { border-color: rgba(45,212,168,0.2); }
.step-num { flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px; background: rgba(45,212,168,0.1); color: #2dd4a8; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
.step h4 { font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 0.3rem; }
.step p { font-size: 0.85rem; color: rgba(255,255,255,0.5); line-height: 1.5; }

/* FAQ */
.faq-list { display: flex; flex-direction: column; gap: 0.8rem; }
.faq-item { border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; cursor: pointer; transition: border-color 0.3s; }
.faq-item:hover { border-color: rgba(45,212,168,0.2); }
.faq-question { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.2rem; color: #fff; font-weight: 600; font-size: 0.95rem; }
.faq-question svg { transition: transform 0.3s; color: rgba(255,255,255,0.4); }
.faq-question.open svg { transform: rotate(180deg); color: #2dd4a8; }
.faq-answer { padding: 0 1.2rem 1rem; }
.faq-answer p { color: rgba(255,255,255,0.55); font-size: 0.88rem; line-height: 1.7; }

/* Footer */
.help-footer { text-align: center; padding: 2rem; border-top: 1px solid rgba(255,255,255,0.04); }
.help-footer p { font-size: 0.8rem; color: rgba(255,255,255,0.3); }

@media (max-width: 768px) {
  .container { grid-template-columns: 1fr; }
  .help-sidebar { position: static; display: flex; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1.5rem; margin-bottom: 1rem; }
  .help-sidebar h3 { width: 100%; }
  .help-sidebar a { border-left: none; border-bottom: 2px solid transparent; border-radius: 6px; padding: 0.4rem 0.8rem; font-size: 0.8rem; }
  .help-sidebar a.active { border-bottom-color: #2dd4a8; }
  .nav-actions { gap: 0.5rem; }
  .back-link { display: none; }
}
</style>
