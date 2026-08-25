// ============================================
// 1. APERTURA DEL SOBRE
// ============================================
const envelope = document.getElementById('envelope');
const envelopeWrapper = document.getElementById('envelopeWrapper');
const envelopeScreen = document.getElementById('envelopeScreen');
const mainContent = document.getElementById('mainContent');
const musicBtn = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');

function abrirInvitacion() {
  if (envelopeWrapper && envelopeWrapper.classList.contains('opened')) return;
  if (envelopeWrapper) envelopeWrapper.classList.add('opened');
  intentarReproducir();

  // ✅ FIX: reducido de 3400ms a 1800ms (animación del sobre ~1.2s + buffer)
  setTimeout(() => {
    envelopeScreen.classList.add('fade-out');
    mainContent.classList.remove('hidden');
    mainContent.setAttribute('aria-hidden', 'false');
    if (musicBtn) musicBtn.classList.remove('hidden');

    // ✅ FIX: eliminada la reaplicación redundante de scroll-snap-type
    // (ya está definida en CSS). Solo activamos animaciones.
    setTimeout(() => {
      triggerPageAnimations();
    }, 500);
  }, 1800);
}

if (envelopeWrapper) {
  envelopeWrapper.addEventListener('click', abrirInvitacion);
  envelopeWrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      abrirInvitacion();
    }
  });
}

// ============================================
// 2. MÚSICA CON FADE
// ============================================
let sonando = false;
let volumenActual = 0;

function intentarReproducir() {
  if (!bgMusic || sonando) return;
  const promesa = bgMusic.play();
  if (promesa && promesa.then) {
    promesa.then(() => {
      fadeInVolumen();
      sonando = true;
      if (musicBtn) {
        musicBtn.classList.add('playing');
        musicBtn.querySelector('.music-icon').textContent = '⏸';
      }
    }).catch(() => {
      console.log('Autoplay bloqueado. Toca el botón de música.');
    });
  }
}

function fadeInVolumen() {
  bgMusic.volume = 0;
  const interval = setInterval(() => {
    if (volumenActual < 0.5) {
      volumenActual += 0.05;
      bgMusic.volume = volumenActual;
    } else {
      clearInterval(interval);
    }
  }, 80);
}

function fadeOutVolumen() {
  const interval = setInterval(() => {
    if (volumenActual > 0) {
      volumenActual -= 0.05;
      bgMusic.volume = volumenActual;
    } else {
      clearInterval(interval);
      bgMusic.pause();
    }
  }, 80);
}

if (musicBtn && bgMusic) {
  musicBtn.addEventListener('click', () => {
    if (sonando) {
      sonando = false;
      fadeOutVolumen();
      musicBtn.classList.remove('playing');
      musicBtn.querySelector('.music-icon').textContent = '🎵';
    } else {
      bgMusic.play().then(() => {
        fadeInVolumen();
        sonando = true;
        musicBtn.classList.add('playing');
        musicBtn.querySelector('.music-icon').textContent = '⏸';
      }).catch(err => console.log('No se pudo reproducir:', err));
    }
  });
}

// ============================================
// 3. CONTADOR REGRESIVO
// ============================================
// ✅ FIX: comentario aclaratorio (mes 8 = septiembre en JS, 0-indexed)
const fechaEvento = new Date(2026, 8, 19, 19, 0, 0).getTime(); // 19/09/2026 19:00

const cdElems = {
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds')
};

function actualizarContador() {
  const ahora = Date.now();
  const distancia = fechaEvento - ahora;

  if (distancia <= 0) {
    Object.values(cdElems).forEach(el => { if (el) el.textContent = '00'; });
    return;
  }

  const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const min = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
  const seg = Math.floor((distancia % (1000 * 60)) / 1000);

  if (cdElems.days) cdElems.days.textContent = String(dias).padStart(2, '0');
  if (cdElems.hours) cdElems.hours.textContent = String(horas).padStart(2, '0');
  if (cdElems.minutes) cdElems.minutes.textContent = String(min).padStart(2, '0');
  if (cdElems.seconds) cdElems.seconds.textContent = String(seg).padStart(2, '0');
}

setInterval(actualizarContador, 1000);
actualizarContador();

// ============================================
// 4. ANIMACIONES ON-SCROLL
// ============================================
function triggerPageAnimations() {
  const pages = document.querySelectorAll('.page');
  if (!('IntersectionObserver' in window)) {
    pages.forEach(p => p.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.25, rootMargin: '0px' });

  pages.forEach(page => observer.observe(page));
}

// ============================================
// 5. SLIDESHOW
// ============================================
const slideshow = document.getElementById('slideshow');
if (slideshow) {
  const slides = slideshow.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dots .dot');
  const INTERVALO = 3500;
  let indiceActual = 0;
  let timer = null;

  function mostrarSlide(indice) {
    slides.forEach((s, i) => s.classList.toggle('active', i === indice));
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === indice);
      if (i === indice) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    indiceActual = indice;
  }

  function siguienteSlide() {
    mostrarSlide((indiceActual + 1) % slides.length);
  }

  function iniciarTimer() {
    detenerTimer();
    timer = setInterval(siguienteSlide, INTERVALO);
  }

  function detenerTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      mostrarSlide(parseInt(dot.dataset.slide, 10));
      iniciarTimer();
    });
  });

  let touchStartX = 0;
  slideshow.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    detenerTimer();
  }, { passive: true });

  slideshow.addEventListener('touchend', (e) => {
    const diferencia = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diferencia) > 40) {
      if (diferencia < 0) mostrarSlide((indiceActual + 1) % slides.length);
      else mostrarSlide((indiceActual - 1 + slides.length) % slides.length);
    }
    iniciarTimer();
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    const paginaGaleria = slideshow.closest('.page');
    const observerGaleria = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) iniciarTimer();
        else detenerTimer();
      });
    }, { threshold: 0.3 });
    observerGaleria.observe(paginaGaleria);
  } else {
    iniciarTimer();
  }
}

// ============================================
// 6. DESTELLOS DORADOS
// ============================================
function iniciarDestellos() {
  const canvas = document.getElementById('sparkles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let particulas = [];
  let ancho = 0, alto = 0;
  let rafId = null;
  let pausado = false;

  const colores = ['239, 182, 76', '245, 206, 106', '255, 245, 220'];

  function elegirColor() {
    const r = Math.random();
    if (r < 0.12) return colores[2];
    if (r < 0.5) return colores[1];
    return colores[0];
  }

  function nuevaParticula(apareceDesdeAbajo) {
    const radio = Math.random() * 1.8 + 0.6;
    return {
      x: Math.random() * ancho,
      y: apareceDesdeAbajo ? Math.random() * alto : alto + radio * 2,
      radio,
      velocidadY: -(Math.random() * 0.3 + 0.08),
      amplitud: Math.random() * 0.5 + 0.2,
      fase: Math.random() * Math.PI * 2,
      velocidadFase: Math.random() * 0.02 + 0.005,
      opacidadBase: Math.random() * 0.5 + 0.25,
      velocidadParpadeo: Math.random() * 0.03 + 0.01,
      faseParpadeo: Math.random() * Math.PI * 2,
      color: elegirColor()
    };
  }

  function crearParticulas() {
    const cantidad = Math.min(70, Math.max(25, Math.floor((ancho * alto) / 25000)));
    particulas = [];
    for (let i = 0; i < cantidad; i++) particulas.push(nuevaParticula(true));
  }

  function redimensionar() {
    ancho = window.innerWidth;
    alto = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = ancho * dpr;
    canvas.height = alto * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    crearParticulas();
  }

  function dibujar() {
    if (pausado) return;
    ctx.clearRect(0, 0, ancho, alto);

    for (const p of particulas) {
      p.fase += p.velocidadFase;
      p.faseParpadeo += p.velocidadParpadeo;
      p.y += p.velocidadY;
      p.x += Math.sin(p.fase) * p.amplitud * 0.3;

      if (p.y < -p.radio * 2) Object.assign(p, nuevaParticula(false));

      const opacidad = p.opacidadBase * (0.6 + 0.4 * Math.sin(p.faseParpadeo));
      ctx.save();
      ctx.globalAlpha = Math.max(opacidad, 0);
      ctx.shadowColor = `rgba(${p.color}, 0.9)`;
      ctx.shadowBlur = p.radio * 5;
      ctx.fillStyle = `rgb(${p.color})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    rafId = requestAnimationFrame(dibujar);
  }

  // ✅ FIX: pausar canvas cuando la pestaña no está visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pausado = true;
      if (rafId) cancelAnimationFrame(rafId);
    } else {
      pausado = false;
      rafId = requestAnimationFrame(dibujar);
    }
  });

  try {
    redimensionar();
    window.addEventListener('resize', redimensionar);
    rafId = requestAnimationFrame(dibujar);
  } catch (error) {
    console.error('Error al iniciar destellos:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarDestellos);
} else {
  iniciarDestellos();
}

// ============================================
// 7. ANIMACIÓN DEL NOMBRE LETRA POR LETRA
// ============================================
function prepararNombreLetras() {
  const nombres = document.querySelectorAll('.envelope-subtitle, .cover-name, .end-name');
  nombres.forEach(el => {
    const texto = el.textContent.trim();
    el.setAttribute('aria-label', texto);
    el.textContent = '';

    [...texto].forEach((letra, i) => {
      const span = document.createElement('span');
      span.className = 'letter-anim';
      span.style.setProperty('--i', i);
      span.textContent = letra === ' ' ? '\u00A0' : letra;
      span.setAttribute('aria-hidden', 'true');
      el.appendChild(span);
    });
  });
}

function iniciarRevealNombres() {
  const nombres = document.querySelectorAll('.envelope-subtitle, .cover-name, .end-name');
  nombres.forEach(el => {
    if (el.classList.contains('envelope-subtitle')) {
      setTimeout(() => {
        el.classList.add('reveal');
      }, 600);
    } else {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px' });
        observer.observe(el);
      } else {
        el.classList.add('reveal');
      }
    }
  });
}

prepararNombreLetras();
iniciarRevealNombres();
