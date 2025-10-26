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
  const compareSource = document.getElementById('compareSource').value;
  const comparisonDiv = document.getElementById('comparisonResult');

  if (!knownHash) {
    comparisonDiv.textContent = "Please enter a hash to compare.";
    comparisonDiv.classList.remove('hidden');
    return;
  }

  let targetHash = '';
  let sourceLabel = '';

  if (compareSource === 'current') {
    if (!currentHash) {
      comparisonDiv.textContent = "No current file hash available. Please generate one first.";
      comparisonDiv.classList.remove('hidden');
      return;
    }
    targetHash = currentHash;
    sourceLabel = `current file: ${currentFilename}`;
  } else if (compareSource === 'history') {
    const history = JSON.parse(localStorage.getItem('hashHistory') || '[]');
    if (history.length === 0) {
      comparisonDiv.textContent = "No history available to compare.";
      comparisonDiv.classList.remove('hidden');
      return;
    }
    targetHash = history[0].hash; // Compare with most recent history entry
    sourceLabel = `history file: ${history[0].filename}`;
  }

  if (knownHash === targetHash) {
    comparisonDiv.innerHTML = `<span style="color:green;">✅ Match with ${sourceLabel}</span>`;
  } else {
    comparisonDiv.innerHTML = `<span style="color:red;">❌ No match with ${sourceLabel}</span>`;
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
  history.forEach((item, index) => {
    const li = document.createElement('li');
    li.classList.add('history-item');
    li.innerHTML = `
      <div class="history-content">
        <div class="hash-info">
          <strong>${item.filename}</strong><br>
          <code>${item.hash}</code>
        </div>
        <button class="compare-btn" onclick="compareToCurrent('${item.hash}', '${item.filename}')">Compare</button>
      </div>
    `;
    historyList.appendChild(li);
  });
}


// Load history on page load
updateHistoryMenu();

function clearHistory() {
  localStorage.removeItem('hashHistory');
  updateHistoryMenu();
}

function compareToCurrent(historyHash, historyFilename) {
  const comparisonDiv = document.getElementById('comparisonResult');

  if (!currentHash) {
    comparisonDiv.textContent = "No current file hash available. Please generate one first.";
    comparisonDiv.classList.remove('hidden');
    return;
  }

  if (currentHash === historyHash) {
    comparisonDiv.innerHTML = `<span style="color:green;">Match with history file: ${historyFilename}</span>`;
  } else {
    comparisonDiv.innerHTML = `<span style="color:red;">No match with history file: ${historyFilename}</span>`;
  }

  comparisonDiv.classList.remove('hidden');
}
