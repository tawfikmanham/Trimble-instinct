const toggle = document.querySelector('.preview-toggle');
const preview = document.querySelector('#turn-preview');
const screenElements = document.querySelectorAll('[data-screen]');
const screenLinks = document.querySelectorAll('.sections a');

function showCurrentScreen() {
  const currentScreen = location.hash === '#summary' ? 'summary' : 'navigation';

  for (const element of screenElements) {
    element.hidden = element.dataset.screen !== currentScreen;
  }

  for (const link of screenLinks) {
    if (link.hash === `#${currentScreen}`) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

window.addEventListener('hashchange', showCurrentScreen);
showCurrentScreen();

function setPreviewOpen(open) {
  toggle.setAttribute('aria-expanded', String(open));
  preview.inert = !open;
  preview.classList.toggle('is-open', open);
}

toggle.addEventListener('click', () => {
  setPreviewOpen(toggle.getAttribute('aria-expanded') === 'false');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !toggle.closest('.navigation').hidden && toggle.getAttribute('aria-expanded') === 'true') {
    setPreviewOpen(false);
    toggle.focus();
  }
});
