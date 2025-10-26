let currentHash = '';
let currentFilename = '';

async function generateHash() {
  const fileInput = document.getElementById('fileInput');
  const resultDiv = document.getElementById('result');

  if (!fileInput.files.length) {
    resultDiv.textContent = "Please select a file.";
    resultDiv.classList.remove('hidden');
    return;
  }

  const file = fileInput.files[0];
  currentFilename = file.name;
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  currentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  resultDiv.innerHTML = `<strong>SHA-256 Hash:</strong><br>${currentHash}`;
  resultDiv.classList.remove('hidden');

  saveToHistory(currentFilename, currentHash);
  updateHistoryMenu();
}

function compareHash() {
  const knownHash = document.getElementById('knownHash').value.trim();
  const comparisonDiv = document.getElementById('comparisonResult');

  if (!knownHash) {
    comparisonDiv.textContent = "Please enter a hash to compare.";
    comparisonDiv.classList.remove('hidden');
    return;
  }

  if (currentHash && currentHash === knownHash) {
    comparisonDiv.innerHTML = `<span style="color:green;">✅ Match with current file: ${currentFilename}</span>`;
    comparisonDiv.classList.remove('hidden');
    return;
  }

  const match = checkHashInHistory(knownHash);
  if (match) {
    comparisonDiv.innerHTML = `<span style="color:blue;">🔍 Match found in history: ${match.filename}</span>`;
  } else {
    comparisonDiv.innerHTML = `<span style="color:red;">❌ No match found in history.</span>`;
  }
  comparisonDiv.classList.remove('hidden');
}

function checkHashInHistory(hashToFind) {
  const history = JSON.parse(localStorage.getItem('hashHistory') || '[]');
  return history.find(item => item.hash === hashToFind);
}

function saveToHistory(filename, hash) {
  const history = JSON.parse(localStorage.getItem('hashHistory') || '[]');
  history.unshift({ filename, hash });
  localStorage.setItem('hashHistory', JSON.stringify(history.slice(0, 10))); // keep last 10
}

function updateHistoryMenu() {
  const historyList = document.getElementById('historyList');
  const history = JSON.parse(localStorage.getItem('hashHistory') || '[]');

  historyList.innerHTML = '';
  if (history.length === 0) {
    historyList.classList.add('hidden');
    return;
  }

  historyList.classList.remove('hidden');
  history.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.filename}</strong><br><code>${item.hash}</code>`;
    historyList.appendChild(li);
  });
}

// Load history on page load
updateHistoryMenu();

function clearHistory() {
  localStorage.removeItem('hashHistory');
  updateHistoryMenu();
}

