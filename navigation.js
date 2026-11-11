const toggle = document.querySelector('.preview-toggle');
const preview = document.querySelector('#turn-preview');
const screenElements = document.querySelectorAll('[data-screen]');
const screenLinks = [...document.querySelectorAll('.sections a')];
const dutyTrigger = document.querySelector('.duty');
const dutyLabel = document.querySelector('#duty-label');
const dutyDialog = document.querySelector('#duty-dialog');
const dutyOptions = [...dutyDialog.querySelectorAll('[data-duty]')];
let selectedDuty;
const fuelGauge = document.querySelector('.fuel-gauge');
const fuelReading = fuelGauge.querySelector('.fuel-reading');
const fuelSamples = [13.5, 6.2, 9.8, 15];
const fuelScale = 15;
let fuelSampleIndex = 0;

fuelGauge.addEventListener('click', () => {
  fuelSampleIndex = (fuelSampleIndex + 1) % fuelSamples.length;
  const reading = fuelSamples[fuelSampleIndex].toFixed(1);
  fuelReading.textContent = reading;
  fuelGauge.style.setProperty('--fuel-progress', fuelSamples[fuelSampleIndex] / fuelScale * 100);
  fuelGauge.setAttribute('aria-label', `${reading} MPG, average 11.8 MPG. Cycle sample reading.`);
});

const audioButton = document.querySelector('.audio-play');
const audioElapsed = document.querySelector('#audio-elapsed');
const audioTrack = document.querySelector('.audio-track');
const audioDuration = 200;
let elapsed = 0;
let startedAt;
let playbackTimer;
let displayedTime = '0:00';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const timerDigits = Array.from(displayedTime, (character) => {
  const cell = document.createElement('span');
  cell.textContent = character;
  cell.setAttribute('aria-hidden', 'true');
  if (character !== ':') cell.className = 'audio-digit';
  return cell;
});
audioElapsed.replaceChildren(...timerDigits);

function renderAudioTime(time) {
  if (time === displayedTime) return;

  for (const [index, cell] of timerDigits.entries()) {
    const previous = displayedTime[index];
    const next = time[index];
    if (previous === next) continue;
    if (reducedMotion.matches || time === '0:00') {
      cell.textContent = next;
      continue;
    }

    const outgoing = document.createElement('span');
    outgoing.className = 'audio-digit-outgoing';
    outgoing.textContent = previous;
    const incoming = document.createElement('span');
    incoming.textContent = next;
    cell.replaceChildren(outgoing, incoming);

    const timing = { duration: 150, easing: 'cubic-bezier(.65, 0, .35, 1)' };
    outgoing.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], timing)
      .addEventListener('finish', () => outgoing.remove(), { once: true });
    incoming.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], timing);
  }
  displayedTime = time;
  audioElapsed.setAttribute('aria-label', `${time} elapsed`);
}

function renderAudio() {
  const seconds = Math.floor(elapsed);
  renderAudioTime(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`);
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
    playbackTimer = setInterval(updateAudioProgress, 100);
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
