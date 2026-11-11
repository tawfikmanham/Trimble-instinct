const toggle = document.querySelector('.preview-toggle');
const preview = document.querySelector('#turn-preview');
const mapViewport = document.querySelector('.map-viewport');
const mapMenu = document.querySelector('#map-menu');
const mapMenuToggle = document.querySelector('.map-menu-toggle');
const mapViewToggle = document.querySelector('.map-view-toggle');
const mapZoomIn = document.querySelector('.map-zoom-in');
const mapZoomOut = document.querySelector('.map-zoom-out');
const mapVoice = document.querySelector('.map-voice');
const mapReset = document.querySelector('.map-reset');
const mapViewOptions = [...mapMenu.querySelectorAll('[data-map-view]')];
const mapZoomLevels = [.85, 1, 1.25, 1.55, 1.9, 2.3];
const defaultMapZoom = 1;
let mapZoomIndex = defaultMapZoom;
let mapPanX = 0;
let mapPanY = 0;
let touchCenter;

function updateMapReset() {
  mapReset.disabled = mapZoomIndex === defaultMapZoom && mapPanX === 0 && mapPanY === 0;
}

function setMapPan(x, y) {
  const scale = mapZoomLevels[mapZoomIndex];
  const limitX = mapViewport.clientWidth * scale * .65;
  const limitY = mapViewport.clientHeight * scale * .55;
  mapPanX = Math.max(-limitX, Math.min(limitX, x));
  mapPanY = Math.max(-limitY, Math.min(limitY, y));
  mapViewport.style.setProperty('--map-pan-x', `${mapPanX}px`);
  mapViewport.style.setProperty('--map-pan-y', `${mapPanY}px`);
  updateMapReset();
}

function setMapZoom(index) {
  mapZoomIndex = Math.max(0, Math.min(mapZoomLevels.length - 1, index));
  mapViewport.style.setProperty('--map-zoom', mapZoomLevels[mapZoomIndex]);
  mapZoomIn.disabled = mapZoomIndex === mapZoomLevels.length - 1;
  mapZoomOut.disabled = mapZoomIndex === 0;
  setMapPan(mapPanX, mapPanY);
}

function resetMapPosition() {
  setMapPan(0, 0);
  setMapZoom(defaultMapZoom);
}

function setMapView(view) {
  const overview = view === 'overview';
  mapViewport.dataset.view = view;
  mapViewport.setAttribute('aria-label', overview
    ? 'Top-down route overview showing start and destination'
    : 'Tilted guidance view of the simulated route');
  mapViewToggle.setAttribute('aria-label', overview ? 'Show tilted guidance' : 'Show route overview');
  mapViewToggle.firstElementChild.textContent = overview ? 'explore' : 'map';
  for (const option of mapViewOptions) {
    option.setAttribute('aria-pressed', String(option.dataset.mapView === view));
  }
  resetMapPosition();
  if (mapViewport.dataset.following !== undefined) renderDrive();
}

function setMapMenuOpen(open) {
  mapMenu.hidden = !open;
  mapMenuToggle.setAttribute('aria-expanded', String(open));
}

setMapZoom(defaultMapZoom);
mapViewport.addEventListener('wheel', (event) => {
  if (event.ctrlKey) return;
  event.preventDefault();
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? mapViewport.clientHeight : 1;
  setMapPan(mapPanX - event.deltaX * unit, mapPanY - event.deltaY * unit);
}, { passive: false });

function getTouchCenter(touches) {
  if (touches.length !== 2) return;
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
}

for (const type of ['touchstart', 'touchend', 'touchcancel']) {
  mapViewport.addEventListener(type, (event) => { touchCenter = getTouchCenter(event.touches); });
}
mapViewport.addEventListener('touchmove', (event) => {
  const next = getTouchCenter(event.touches);
  if (touchCenter && next) {
    setMapPan(mapPanX + next.x - touchCenter.x, mapPanY + next.y - touchCenter.y);
  }
  touchCenter = next;
});
window.addEventListener('resize', () => {
  if (mapViewport.clientWidth) setMapPan(mapPanX, mapPanY);
});
mapZoomIn.addEventListener('click', () => setMapZoom(mapZoomIndex + 1));
mapZoomOut.addEventListener('click', () => setMapZoom(mapZoomIndex - 1));
mapMenuToggle.addEventListener('click', () => setMapMenuOpen(mapMenu.hidden));
mapViewToggle.addEventListener('click', () => {
  setMapView(mapViewport.dataset.view === 'guidance' ? 'overview' : 'guidance');
});
for (const option of mapViewOptions) {
  option.addEventListener('click', () => {
    setMapView(option.dataset.mapView);
    setMapMenuOpen(false);
    mapMenuToggle.focus();
  });
}
mapReset.addEventListener('click', () => {
  resetMapPosition();
  setMapMenuOpen(false);
  mapMenuToggle.focus();
});
mapVoice.addEventListener('click', () => {
  const muted = mapVoice.getAttribute('aria-pressed') === 'false';
  mapVoice.setAttribute('aria-pressed', String(muted));
  mapVoice.firstElementChild.textContent = muted ? 'volume_off' : 'volume_up';
});
document.addEventListener('click', (event) => {
  if (!mapMenu.hidden && !mapMenu.contains(event.target) && !mapMenuToggle.contains(event.target)) {
    setMapMenuOpen(false);
  }
});
const screenElements = document.querySelectorAll('[data-screen]');
const screenLinks = [...document.querySelectorAll('.sections a')];
const dutyTrigger = document.querySelector('.duty');
const dutyLabel = document.querySelector('#duty-label');
const dutyDialog = document.querySelector('#duty-dialog');
const dutyOptions = [...dutyDialog.querySelectorAll('[data-duty]')];
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
const driveButton = document.querySelector('.map-demo');
const route = document.querySelector('#demo-route');
const mapPlane = document.querySelector('.map-plane');
const mapPosition = document.querySelector('.map-position');
const vehicleStatus = document.querySelector('.vehicle strong');
const turnArrow = document.querySelector('.next-turn .material-symbol');
const turnDistance = document.querySelector('.turn-distance');
const thenTurn = document.querySelector('.then-turn');
const followingArrow = thenTurn.querySelector('.material-symbol');
const followingDistance = document.querySelector('.following-distance');
const streetName = document.querySelector('.street');
const tripMiles = document.querySelector('.remaining-miles');
const tripEta = document.querySelector('.arrival-time');
const instructions = toggle.firstElementChild;
const upcoming = [...preview.querySelectorAll('li')].map((item) => ({
  item,
  icon: item.querySelector('.material-symbol'),
  title: item.querySelector('strong'),
  street: item.querySelector('div span'),
  distance: item.querySelector('.distance'),
}));
const firstTurn = 223 + Math.hypot(117, 30);
const driveStart = firstTurn - Math.hypot(44, 11);
const driveStages = [
  { time: 0, at: driveStart },
  { time: 4.5, at: firstTurn, icon: 'turn_left', cue: 'Turn left', street: 'Xerxes Avenue South', feet: 350 },
  { time: 9, at: firstTurn + 118, icon: 'turn_right', cue: 'Turn right', street: 'W 82nd Street', feet: 50 },
  { time: 14, at: firstTurn + 287, icon: 'turn_left', cue: 'Turn left', street: 'Penn Avenue', feet: 850 },
  { time: 19, at: firstTurn + 354, icon: 'turn_right', cue: 'Turn right', street: 'W 81st Street', feet: 400 },
  { time: 24, at: firstTurn + 527, icon: 'flag', cue: 'Arrive at destination', street: 'Destination', feet: 950 },
];
const driveDuration = driveStages.at(-1).time;
let driveTime = 0;
let driveStartedAt = 0;
let driveFrame;

function setText(element, value) {
  const text = String(value);
  if (element.textContent !== text) element.textContent = text;
}

function renderDrive() {
  const total = route.getTotalLength();
  const arrived = driveTime >= driveDuration;
  const nextIndex = arrived ? driveStages.length - 1 : driveStages.findIndex((stage) => stage.time > driveTime);
  const next = driveStages[nextIndex];
  const previous = driveStages[nextIndex - 1];
  const following = driveStages[nextIndex + 1];
  const progress = (driveTime - previous.time) / (next.time - previous.time);
  const distance = arrived ? total : previous.at + (next.at - previous.at) * progress;
  const point = route.getPointAtLength(distance);
  const behind = route.getPointAtLength(Math.max(0, distance - 10));
  const ahead = route.getPointAtLength(Math.min(total, distance + 10));
  const bearing = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI + 90;
  mapPosition.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${bearing})`);

  const followingVehicle = mapViewport.dataset.view === 'guidance';
  mapViewport.dataset.following = String(followingVehicle);
  mapPlane.setAttribute('viewBox', followingVehicle
    ? `${point.x - 266.6} ${point.y - 186} 620 310`
    : '0 0 1000 500');
  mapViewport.style.setProperty('--map-bearing', followingVehicle && !reducedMotion.matches ? `${-bearing}deg` : '0deg');

  const feet = Math.ceil(next.feet * (1 - progress) / 10) * 10;
  setText(turnArrow, next.icon);
  setText(turnDistance, feet);
  setText(streetName, next.street);
  thenTurn.hidden = !following || arrived;
  if (following) {
    setText(followingArrow, following.icon);
    followingArrow.setAttribute('aria-label', following.cue);
    setText(followingDistance, `${following.feet} ft`);
  }
  setText(instructions, arrived ? 'You have arrived.' : `${next.cue}.${following ? ` Then ${following.cue.toLowerCase()}.` : ''}`);
  setText(tripMiles, (3.2 * Math.max(0, (total - distance) / (total - driveStart))).toFixed(1));
  setText(tripEta, `12:${String(12 - Math.floor(driveTime / 6)).padStart(2, '0')}`);

  for (const [index, row] of upcoming.entries()) {
    const stage = index === 0 ? next : following;
    row.item.hidden = !stage;
    if (!stage) continue;
    setText(row.icon, stage.icon);
    setText(row.title, arrived ? 'Arrived' : stage.cue);
    setText(row.street, stage.street);
    setText(row.distance, `${index === 0 ? feet : stage.feet} ft`);
  }
}

function setDriveButton(icon, label) {
  setText(driveButton.firstElementChild, icon);
  setText(driveButton.lastElementChild, label);
}

function stopDrive() {
  cancelAnimationFrame(driveFrame);
  driveFrame = undefined;
  setText(vehicleStatus, 'STOPPED');
  if (driveTime >= driveDuration) setDriveButton('replay', 'Replay drive');
  else setDriveButton('play_arrow', 'Resume drive');
}

function advanceDrive(now) {
  driveTime = Math.min(driveDuration, (now - driveStartedAt) / 1000);
  renderDrive();
  if (driveTime < driveDuration) driveFrame = requestAnimationFrame(advanceDrive);
  else stopDrive();
}

driveButton.addEventListener('click', () => {
  if (driveFrame !== undefined) {
    stopDrive();
    return;
  }
  if (driveTime >= driveDuration) {
    driveTime = 0;
    resetMapPosition();
  }
  driveStartedAt = performance.now() - driveTime * 1000;
  setText(vehicleStatus, 'DRIVING');
  setDriveButton('pause', 'Pause drive');
  renderDrive();
  driveFrame = requestAnimationFrame(advanceDrive);
});
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
  if (currentScreen !== 'navigation' && driveFrame !== undefined) stopDrive();

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
  const active = dutyOptions.find((option) => option.getAttribute('aria-pressed') === 'true');
  dutyDialog.showModal();
  dutyTrigger.setAttribute('aria-expanded', 'true');
  active?.focus();
});

for (const option of dutyOptions) {
  option.addEventListener('click', () => {
    for (const candidate of dutyOptions) {
      candidate.setAttribute('aria-pressed', String(candidate === option));
    }
    dutyLabel.textContent = option.querySelector('.duty-option-label').textContent;
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
  if (event.key === 'Escape' && !dutyDialog.open && !mapMenu.hidden) {
    setMapMenuOpen(false);
    mapMenuToggle.focus();
    return;
  }
  if (event.key === 'Escape' && !dutyDialog.open && !toggle.closest('.navigation').hidden && toggle.getAttribute('aria-expanded') === 'true') {
    setPreviewOpen(false);
    toggle.focus();
  }
});
