const playerCountSelect = document.getElementById('playerCount');
for (let i = 1; i <= 30; i++) {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = i;
  playerCountSelect.appendChild(opt);
}

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const step4 = document.getElementById('step4');

const startNames = document.getElementById('startNames');
const submitNames = document.getElementById('submitNames');
const startGameBtn = document.getElementById('startGame');
const spinBtn = document.getElementById('spin');
const nextBtn = document.getElementById('next');

let numPlayers = 0;
let players = [];
let roles = [];
let remainingRoles = [];
let currentPlayer = 0;

startNames.addEventListener('click', () => {
  numPlayers = parseInt(playerCountSelect.value);
  const nameForm = document.getElementById('nameForm');
  nameForm.innerHTML = '';
  for (let i = 0; i < numPlayers; i++) {
    const input = document.createElement('input');
    input.placeholder = `Người chơi ${i + 1}`;
    nameForm.appendChild(input);
  }
  showStep(2);
});

submitNames.addEventListener('click', () => {
  const inputs = document.querySelectorAll('#nameForm input');
  players = [];
  inputs.forEach((inp, idx) => {
    players.push(inp.value || `Người chơi ${idx + 1}`);
  });
  const roleForm = document.getElementById('roleForm');
  roleForm.innerHTML = '';
  for (let i = 0; i < numPlayers; i++) {
    const input = document.createElement('input');
    input.placeholder = `Role ${i + 1}`;
    roleForm.appendChild(input);
  }
  showStep(3);
});

startGameBtn.addEventListener('click', () => {
  const inputs = document.querySelectorAll('#roleForm input');
  roles = [];
  inputs.forEach((inp, idx) => {
    roles.push(inp.value || `Role ${idx + 1}`);
  });
  remainingRoles = roles.slice();
  currentPlayer = 0;
  showStep(4);
  setupPlayer();
});

function showStep(n) {
  [step1, step2, step3, step4].forEach((s, i) => s.classList.toggle('hidden', i !== n - 1));
}

function setupPlayer() {
  document.getElementById('currentPlayer').textContent = players[currentPlayer];
  document.getElementById('result').textContent = '';
  nextBtn.classList.add('hidden');
  spinBtn.disabled = false;
  updateWheel();
  const wheel = document.getElementById('wheel');
  wheel.style.transition = 'none';
  wheel.style.transform = 'rotate(0deg)';
}

function updateWheel() {
  const wheel = document.getElementById('wheel');
  const n = remainingRoles.length;
  const step = 360 / n;
  const colors = [];
  for (let i = 0; i < n; i++) {
    colors.push(`hsl(${(i * step) % 360},70%,60%) ${i * step}deg ${(i + 1) * step}deg`);
  }
  wheel.style.background = `conic-gradient(${colors.join(',')})`;
}

spinBtn.addEventListener('click', () => {
  if (remainingRoles.length === 0) return;
  const wheel = document.getElementById('wheel');
  const n = remainingRoles.length;
  const index = Math.floor(Math.random() * n);
  const selected = remainingRoles.splice(index, 1)[0];
  const spinDeg = 360 * 4 + Math.random() * 360;
  wheel.style.transition = 'transform 4s ease-out';
  wheel.style.transform = `rotate(${spinDeg}deg)`;
  spinBtn.disabled = true;
  setTimeout(() => {
    document.getElementById('result').textContent = `${players[currentPlayer]} - ${selected}`;
    nextBtn.classList.remove('hidden');
  }, 4000);
});

nextBtn.addEventListener('click', () => {
  currentPlayer++;
  if (currentPlayer < players.length) {
    setupPlayer();
  } else {
    document.getElementById('currentPlayer').textContent = 'Hoàn thành!';
    document.getElementById('wheelContainer').classList.add('hidden');
    spinBtn.classList.add('hidden');
    nextBtn.classList.add('hidden');
  }
});
