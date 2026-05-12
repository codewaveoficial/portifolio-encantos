const scrollTopEl = document.getElementById("scrollTop");
if (scrollTopEl) {
  scrollTopEl.addEventListener("click", function(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const mobileMenuBtn = document.querySelector(".mobile-menu");
const navbar = document.querySelector(".navbar");
const navLinks = document.querySelectorAll(".navbar ul li a");

if (mobileMenuBtn && navbar) {
  mobileMenuBtn.addEventListener("click", () => {
    const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    mobileMenuBtn.setAttribute('aria-expanded', String(!expanded));
    navbar.classList.toggle("open");
  });
}

const header = document.querySelector("header#home");
const sections = document.querySelectorAll("header#home, main section[id]");
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const link = document.querySelector(`.navbar ul li a[href="#${entry.target.id}"]`);
    if (entry.isIntersecting && link) {
      navLinks.forEach(item => item.classList.remove('active'));
      link.classList.add('active');
    }
  });
}, { threshold: 0.3 });
sections.forEach(section => sectionObserver.observe(section));

let lastScrollTop = 0;
window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > 140) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
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
      if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
  });
});

// Animação de entrada dos componentes
const revealItems = document.querySelectorAll('.kit-card, .galeria-item, .info-item, .resumo');
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = 1;
      entry.target.style.transform = 'translateY(0)';
      entry.target.style.transition = 'all 0.7s ease';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

revealItems.forEach(item => {
  item.style.opacity = 0;
  item.style.transform = 'translateY(40px)';
  revealObserver.observe(item);
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
const kitButtons = document.querySelectorAll('.select-kit');
const addOnCheckboxes = document.querySelectorAll('.add-on input');
const resumoItens = document.getElementById('resumo-itens');
const totalSpan = document.getElementById('total');
const solicitarBtn = document.getElementById('solicitar-orcamento');

function atualizarResumo() {
  let total = 0;
  let itens = [];
  const kitsAcombinar = ['guirlanda', 'personalizado', 'ornamentacao'];

  if (selectedKit) {
    const kitName = selectedKit.querySelector('h3').textContent;
    const kitType = selectedKit.dataset.kit;
    const kitPrice = parseFloat(selectedKit.dataset.price);
    
    // Se é um dos kits que precisa combinar preço
    if (kitsAcombinar.includes(kitType)) {
      itens.push(`Kit: ${kitName} (A Combinar)`);
    } else {
      total += kitPrice;
      itens.push(`Kit: ${kitName} (R$ ${kitPrice})`);
    }
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

function clearKitSelection() {
  if (!selectedKit) return;
  selectedKit.classList.remove('selected');
  const previousButton = selectedKit.querySelector('.select-kit');
  if (previousButton) {
    previousButton.textContent = 'Selecionar';
  }
  selectedKit = null;
}

function selectKit(card) {
  selectedKit = card;
  selectedKit.classList.add('selected');
  const button = selectedKit.querySelector('.select-kit');
  if (button) {
    button.textContent = 'Selecionado';
  }
}

function updateKitButtons() {
  kitButtons.forEach(button => {
    const card = button.closest('.kit-card');
    if (card === selectedKit) {
      button.textContent = 'Selecionado';
    } else {
      button.textContent = 'Selecionar';
    }
  });
}

function handleKitSelection(card) {
  if (selectedKit === card) {
    clearKitSelection();
  } else {
    if (selectedKit) {
      clearKitSelection();
    }
    selectKit(card);
  }

  updateKitButtons();
  atualizarResumo();
}

kitCards.forEach(card => {
  card.addEventListener('click', (event) => {
    if (event.target.closest('.select-kit')) return;
    handleKitSelection(card);
  });
});

kitButtons.forEach(button => {
  const card = button.closest('.kit-card');
  if (!card) return;
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    handleKitSelection(card);
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

// Galeria de Kits
const kitPhotos = {
  essencial: [
    'assets/img/kit essencial/essencial1.jpeg',
    'assets/img/kit essencial/essencial2.jpeg',
    'assets/img/kit essencial/essencial3.jpeg',
    'assets/img/kit essencial/essencial4.jpeg',
    'assets/img/kit essencial/essencial5.jpeg',
    'assets/img/kit essencial/essencial6.jpeg',
    'assets/img/kit essencial/essencial7.jpeg'
  ],
  especial: [
    'assets/img/kit especial/especial 1.jpeg',
    'assets/img/kit especial/especial 2.jpeg',
    'assets/img/kit especial/especial 3.jpeg',
    'assets/img/kit especial/especial 4.jpeg',
    'assets/img/kit especial/especial 5.jpeg',
  ],
  supremo: [
    'assets/img/kit supremo/kit supremo.jpeg',

  ],
  personalizado: [
    'assets/img/festa personalizada/personalizada 1.jpeg',
    'assets/img/festa personalizada/personalizada 2.jpeg',
    'assets/img/festa personalizada/personalizada 3.jpeg',
    'assets/img/festa personalizada/personalizada 4.jpeg',
    'assets/img/festa personalizada/personalizada 5.jpeg',
    'assets/img/festa personalizada/personalizada 6.jpeg',
    'assets/img/festa personalizada/personalizada 7.jpeg',
  ],
  ornamentacao: [
    'https://dummyimage.com/400x300/ffbf00/ffffff&text=Ornamenta%C3%A7%C3%A3o+de+Lojas+1',
    'https://dummyimage.com/400x300/ffbf00/ffffff&text=Ornamenta%C3%A7%C3%A3o+de+Lojas+2',
    'https://dummyimage.com/400x300/ffbf00/ffffff&text=Ornamenta%C3%A7%C3%A3o+de+Lojas+3'
  ],
  guirlanda: [
    // Pasta vazia, manter dummy por enquanto
    'https://dummyimage.com/400x300/FFD700/FFFFFF&text=Guirlanda+Baloes+Foto+1',
    'https://dummyimage.com/400x300/FFD700/FFFFFF&text=Guirlanda+Baloes+Foto+2',
    'https://dummyimage.com/400x300/FFD700/FFFFFF&text=Guirlanda+Baloes+Foto+3'
  ]
};

const galeriaItems = document.querySelectorAll('.galeria-item');
const modal = document.getElementById('galeria-modal');
const closeBtn = document.querySelector('.close');
const fullscreenImage = document.getElementById('fullscreen-image');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

let currentKit = '';
let currentIndex = 0;

galeriaItems.forEach(item => {
  item.addEventListener('click', () => {
    const kit = item.dataset.kit;
    openGallery(kit);
  });
});

function openGallery(kit) {
  currentKit = kit;
  currentIndex = 0;
  updateImage();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Impede rolagem da página
}

function updateImage() {
  const photos = kitPhotos[currentKit];
  if (photos && photos.length > 0) {
    fullscreenImage.src = photos[currentIndex];
    fullscreenImage.alt = `Foto ${currentIndex + 1} do Kit ${currentKit}`;
    prevBtn.style.display = photos.length > 1 ? 'block' : 'none';
    nextBtn.style.display = photos.length > 1 ? 'block' : 'none';
  }
}

prevBtn.addEventListener('click', () => {
  const photos = kitPhotos[currentKit];
  currentIndex = (currentIndex - 1 + photos.length) % photos.length;
  updateImage();
});

nextBtn.addEventListener('click', () => {
  const photos = kitPhotos[currentKit];
  currentIndex = (currentIndex + 1) % photos.length;
  updateImage();
});

closeBtn.addEventListener('click', () => {
  modal.classList.remove('active');
  document.body.style.overflow = ''; // Restaura rolagem da página
});

// Fechar modal clicando fora
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restaura rolagem da página
  }
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restaura rolagem da página
  }
});
