const scrollTopEl = document.getElementById("scrollTop");
if (scrollTopEl) {
  scrollTopEl.addEventListener("click", function(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const mobileMenuBtn = document.querySelector(".mobile-menu");
const navbar = document.querySelector(".navbar");
if (mobileMenuBtn && navbar) {
  mobileMenuBtn.addEventListener("click", () => {
    navbar.classList.toggle("open");
  });
}

let lastScrollTop = 0;
window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > 140) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  if (scrollTop > lastScrollTop && scrollTop > 120) {
    navbar.classList.add('hidden');
  } else {
    navbar.classList.remove('hidden');
  }
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// Scroll suave para links internos
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (navbar) navbar.classList.remove('open');
    }
  });
});

// Animação de entrada dos cards
const cards = document.querySelectorAll(".card");
window.addEventListener("scroll", () => {
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      card.style.opacity = 1;
      card.style.transform = "translateY(0)";
    }
  });
});

// Inicializa estilo dos cards
cards.forEach(card => {
  card.style.opacity = 0;
  card.style.transform = "translateY(50px)";
  card.style.transition = "all 0.6s ease";
});

// Parallax effect for header
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const header = document.querySelector('header');
  if (header) {
    header.style.backgroundPositionY = -(scrolled * 0.5) + 'px';
  }
});

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light-theme');
  const isLight = body.classList.contains('light-theme');
  themeToggle.textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  body.classList.add('light-theme');
  themeToggle.textContent = '☀️';
}

// Lógica para Pegue e Monte
let selectedKit = null;
const kitCards = document.querySelectorAll('.kit-card');
const addOnCheckboxes = document.querySelectorAll('.add-on input');
const resumoItens = document.getElementById('resumo-itens');
const totalSpan = document.getElementById('total');
const solicitarBtn = document.getElementById('solicitar-orcamento');

function atualizarResumo() {
  let total = 0;
  let itens = [];

  if (selectedKit) {
    const kitName = selectedKit.querySelector('h3').textContent;
    const kitPrice = parseFloat(selectedKit.dataset.price);
    total += kitPrice;
    itens.push(`Kit: ${kitName} (R$ ${kitPrice})`);
  }

  addOnCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      const serviceName = checkbox.dataset.service;
      const servicePrice = parseFloat(checkbox.value);
      total += servicePrice;
      itens.push(`Adicional: ${serviceName} (R$ ${servicePrice})`);
    }
  });

  resumoItens.innerHTML = itens.map(item => `<div>${item}</div>`).join('');
  totalSpan.textContent = total.toFixed(2);
}

kitCards.forEach(card => {
  card.addEventListener('click', () => {
    kitCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedKit = card;
    atualizarResumo();
  });
});

addOnCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', atualizarResumo);
});

solicitarBtn.addEventListener('click', () => {
  const total = totalSpan.textContent;
  const itens = Array.from(resumoItens.children).map(div => div.textContent).join('\n');
  const mensagem = `Olá! Gostaria de solicitar um orçamento para meu evento.\n\nItens selecionados:\n${itens}\n\nTotal estimado: R$ ${total}`;
  const url = `mailto:contato@encantosnamesa.com?subject=Orçamento Evento&body=${encodeURIComponent(mensagem)}`;
  window.location.href = url;
});
