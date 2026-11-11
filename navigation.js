const toggle = document.querySelector('.preview-toggle');
const preview = document.querySelector('#turn-preview');
const screenElements = document.querySelectorAll('[data-screen]');
const screenLinks = [...document.querySelectorAll('.sections a')];
const dutyTrigger = document.querySelector('.duty');
const dutyLabel = document.querySelector('#duty-label');
const dutyDialog = document.querySelector('#duty-dialog');
const dutyOptions = [...dutyDialog.querySelectorAll('[data-duty]')];
let selectedDuty;
const audioButton = document.querySelector('.audio-play');
const audioElapsed = document.querySelector('#audio-elapsed');
const audioTrack = document.querySelector('.audio-track');
const audioDuration = 200;
let elapsed = 0;
let startedAt;
let playbackTimer;

function renderAudio() {
  const seconds = Math.floor(elapsed);
  audioElapsed.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  audioTrack.style.setProperty('--audio-progress', `${elapsed / audioDuration * 100}%`);
  const playing = playbackTimer !== undefined;
  audioButton.classList.toggle('is-playing', playing);
  audioButton.setAttribute('aria-label', playing ? 'Pause audio' : 'Play audio');
}

function stopAudio() {
  clearInterval(playbackTimer);
  playbackTimer = undefined;
}

function updateAudioProgress() {
  elapsed = Math.min(audioDuration, (performance.now() - startedAt) / 1000);
  if (elapsed === audioDuration) stopAudio();
  renderAudio();
}

audioButton.addEventListener('click', () => {
  if (playbackTimer !== undefined) {
    stopAudio();
    updateAudioProgress();
  } else {
    if (elapsed === audioDuration) elapsed = 0;
    startedAt = performance.now() - elapsed * 1000;
    playbackTimer = setInterval(updateAudioProgress, 250);
    renderAudio();
  }
});

function showCurrentScreen() {
  const activeHash = screenLinks.find((link) => link.hash === location.hash)?.hash;
  const currentScreen = activeHash?.slice(1) ?? 'navigation';
  dutyLabel.textContent = selectedDuty ?? (currentScreen === 'navigation' ? 'ON(YM)' : 'ON(D)');

  for (const element of screenElements) {
    element.hidden = !element.dataset.screen.split(' ').includes(currentScreen);
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

dutyTrigger.addEventListener('click', () => {
  const active = dutyOptions.find((option) => option.dataset.duty === dutyLabel.textContent);
  for (const option of dutyOptions) {
    option.setAttribute('aria-pressed', String(option === active));
  }
  dutyDialog.showModal();
  dutyTrigger.setAttribute('aria-expanded', 'true');
  active?.focus();
});

for (const option of dutyOptions) {
  option.addEventListener('click', () => {
    selectedDuty = option.dataset.duty;
    dutyLabel.textContent = selectedDuty;
    dutyDialog.close();
  });
}

dutyDialog.querySelector('.duty-close').addEventListener('click', () => dutyDialog.close());
dutyDialog.addEventListener('click', (event) => {
  if (event.target === dutyDialog) dutyDialog.close();
});
dutyDialog.addEventListener('close', () => {
  dutyTrigger.setAttribute('aria-expanded', 'false');
  dutyTrigger.focus();
});

function setPreviewOpen(open) {
  toggle.setAttribute('aria-expanded', String(open));
  preview.inert = !open;
  preview.classList.toggle('is-open', open);
}

toggle.addEventListener('click', () => {
  setPreviewOpen(toggle.getAttribute('aria-expanded') === 'false');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !dutyDialog.open && !toggle.closest('.navigation').hidden && toggle.getAttribute('aria-expanded') === 'true') {
    setPreviewOpen(false);
    toggle.focus();
  }
});
