// YT Focus — Popup Script

const switchShorts = document.getElementById('switch-shorts');
const switchRec = document.getElementById('switch-rec');
const rowShorts = document.getElementById('row-shorts');
const rowRec = document.getElementById('row-rec');
const reloadBtn = document.getElementById('reload-btn');
const toast = document.getElementById('toast');

let settings = { hideShorts: true, hideRecommended: true };

function setSwitch(el, on) {
  el.classList.toggle('on', on);
}

function showToast(msg = 'Settings saved') {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function saveSettings() {
  chrome.storage.sync.set(settings, () => showToast('Settings saved'));
}

// Load current settings
chrome.storage.sync.get(['hideShorts', 'hideRecommended'], (data) => {
  settings.hideShorts = data.hideShorts !== false;
  settings.hideRecommended = data.hideRecommended !== false;
  setSwitch(switchShorts, settings.hideShorts);
  setSwitch(switchRec, settings.hideRecommended);
});

rowShorts.addEventListener('click', () => {
  settings.hideShorts = !settings.hideShorts;
  setSwitch(switchShorts, settings.hideShorts);
  saveSettings();
});

rowRec.addEventListener('click', () => {
  settings.hideRecommended = !settings.hideRecommended;
  setSwitch(switchRec, settings.hideRecommended);
  saveSettings();
});

reloadBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) chrome.tabs.reload(tabs[0].id);
  });
});
