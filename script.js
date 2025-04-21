const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');
const checkButton = document.getElementById('check');

// Store data in localStorage
function store(key, value) {
  localStorage.setItem(key, value);
}

// Retrieve data from localStorage
function retrieve(key) {
  return localStorage.getItem(key);
}

// Clear all stored data
function clearStorage() {
  localStorage.clear();
}

// Generate a random 3-digit number
function getRandomThreeDigitNumber() {
  const number = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
  return number.toString(); // as string for hashing
}

// Compute SHA256 hash for a given string
async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Get or generate the hash of a random 3-digit number
async function getOrGenerateSHA256Hash() {
  let cachedHash = retrieve('sha256');
  let cachedPin = retrieve('pin');

  if (cachedHash && cachedPin) {
    return { hash: cachedHash, originalPin: cachedPin };
  }

  const randomPin = getRandomThreeDigitNumber();
  const hash = await sha256(randomPin);

  store('sha256', hash);
  store('pin', randomPin);

  return { hash, originalPin: randomPin };
}

// Initialize the interface with a hash
async function initializeChallenge() {
  sha256HashView.innerText = '🔄 Generating Hash...';
  const { hash } = await getOrGenerateSHA256Hash();
  sha256HashView.innerText = hash;
}

// Check if the user’s input matches the generated hash
async function checkGuess() {
  const userPin = pinInput.value;

  if (userPin.length !== 3) {
    resultView.innerText = '💡 Please enter exactly 3 digits.';
    resultView.classList.remove('hidden', 'success');
    return;
  }

  const userHash = await sha256(userPin);
  const correctHash = retrieve('sha256');

  if (userHash === correctHash) {
    resultView.innerText = '🎉 Correct! Well done.';
    resultView.classList.add('success');
  } else {
    resultView.innerText = '❌ Incorrect! Try another guess.';
    resultView.classList.remove('success');
  }
  resultView.classList.remove('hidden');
}

// Input validation: allow only digits, limit to 3 characters
pinInput.addEventListener('input', (e) => {
  const cleanedValue = e.target.value.replace(/\D/g, '').slice(0, 3);
  pinInput.value = cleanedValue;
});

// Attach check logic to button
checkButton.addEventListener('click', checkGuess);

// Start the challenge
initializeChallenge();