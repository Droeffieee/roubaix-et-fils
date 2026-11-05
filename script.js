/* Roubaix & Fils · Dark by nature. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Intro: de brandfilm als laadscherm ---------- */
  var intro = document.getElementById('intro');
  var video = document.getElementById('introVideo');
  var soundBtn = document.getElementById('introSound');
  var skipBtn = document.getElementById('introSkip');
  var bar = document.getElementById('introBar');
  if (intro) {

  function closeIntro() {
    if (!root.classList.contains('has-intro')) return;
    try { sessionStorage.setItem('rf-intro-seen', '1'); } catch (e) {}
    intro.classList.add('is-leaving');
    video.pause();
    setTimeout(function () {
      root.classList.remove('has-intro');
      intro.classList.remove('is-leaving');
      video.currentTime = 0;
    }, 1200);
  }

  function openIntro(withSound) {
    root.classList.add('has-intro');
    intro.classList.remove('is-leaving');
    video.currentTime = 0;
    video.muted = !withSound;
    soundBtn.setAttribute('aria-pressed', String(withSound));
    soundBtn.textContent = withSound ? 'Sound off' : 'Sound on';
    var p = video.play();
    if (p && p.catch) p.catch(function () { video.muted = true; video.play().catch(closeIntro); });
    skipBtn.focus({ preventScroll: true });
  }

  if (root.classList.contains('has-intro')) {
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* autoplay geweigerd: poster blijft, gebruiker kan skippen */ });
  }

  video.addEventListener('timeupdate', function () {
    if (video.duration) bar.style.width = (video.currentTime / video.duration * 100) + '%';
  });
  video.addEventListener('ended', closeIntro);
  skipBtn.addEventListener('click', closeIntro);
  soundBtn.addEventListener('click', function () {
    video.muted = !video.muted;
    var on = !video.muted;
    soundBtn.setAttribute('aria-pressed', String(on));
    soundBtn.textContent = on ? 'Sound off' : 'Sound on';
    if (video.paused) video.play();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains('has-intro')) closeIntro();
  });
  Array.prototype.forEach.call(document.querySelectorAll('.replay'), function (b) {
    b.addEventListener('click', function () { openIntro(true); });
  });
  } /* einde intro */

  /* ---------- Navigatie + scrolllijn ---------- */
  var nav = document.getElementById('nav');
  var scrollBar = document.getElementById('scrollBar');
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-solid', y > 40);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.width = (max > 0 ? y / max * 100 : 0) + '%';
    parallax();
  }

  /* ---------- Trage parallax ---------- */
  var plx = document.querySelectorAll('[data-parallax]');
  function parallax() {
    if (reduced) return;
    Array.prototype.forEach.call(plx, function (img) {
      var r = img.parentNode.getBoundingClientRect();
      var prog = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      img.style.transform = 'translateY(' + (-8 + prog * -10).toFixed(2) + '%)';
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal bij scrollen ---------- */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(items, function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Messing cursorring (desktop) ---------- */
  var cursor = document.getElementById('cursor');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced) {
    var x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; cursor.classList.add('is-on'); });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('is-on'); });
    (function loop() {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      cursor.classList.toggle('is-hover', !!e.target.closest('a, button, .card'));
    });
  }
})();
