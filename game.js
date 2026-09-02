const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const scoreText = document.querySelector('#score');
const livesText = document.querySelector('#lives');
const statusText = document.querySelector('#status');

const world = { width: 3600, ground: 445 };
const keys = {};
let player, camera, score, lives, state, coins, enemies;

const platforms = [
    { x: 0, y: 445, w: 760, h: 95 }, { x: 850, y: 445, w: 600, h: 95 },
    { x: 1535, y: 445, w: 470, h: 95 }, { x: 2100, y: 445, w: 700, h: 95 },
    { x: 2900, y: 445, w: 700, h: 95 },
    { x: 430, y: 350, w: 150, h: 20 }, { x: 990, y: 335, w: 170, h: 20 },
    { x: 1280, y: 275, w: 130, h: 20 }, { x: 1730, y: 350, w: 170, h: 20 },
    { x: 2320, y: 330, w: 180, h: 20 }, { x: 3150, y: 350, w: 190, h: 20 }
];

function reset() {
    player = { x: 90, y: 380, w: 30, h: 42, vx: 0, vy: 0, grounded: false };
    camera = 0; score = 0; lives = 3; state = 'playing';
    coins = [280, 485, 535, 770, 1050, 1320, 1650, 1800, 2180, 2370, 2540, 2940, 3200, 3400]
        .map((x, i) => ({ x, y: i % 3 === 0 ? 300 : 395, taken: false }));
    enemies = [620, 1120, 1410, 1850, 2470, 2730, 3060, 3490].map(x => ({ x, y: 408, w: 32, h: 37, vx: 1 }));
    updateHud();
}
function updateHud() { scoreText.textContent = score; livesText.textContent = lives; }
function hit(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function respawn() {
    lives--; updateHud();
    if (!lives) { state = 'lost'; statusText.textContent = 'ゲームオーバー！ Rで再挑戦'; }
    else { player.x = Math.max(90, player.x - 260); player.y = 250; player.vy = 0; statusText.textContent = 'いたっ！ 気をつけて！'; }
}
function update() {
    if (state !== 'playing') return;
    const left = Boolean(keys.ArrowLeft || keys.a), right = Boolean(keys.ArrowRight || keys.d);
    player.vx = (right - left) * 4.4; player.vy += .7; player.x += player.vx; player.y += player.vy;
    player.x = Math.max(0, Math.min(world.width - player.w, player.x));
    player.grounded = false;
    for (const p of platforms) {
        if (player.x + player.w > p.x && player.x < p.x + p.w && player.y + player.h >= p.y &&
            player.y + player.h - player.vy <= p.y && player.vy >= 0) {
            player.y = p.y - player.h; player.vy = 0; player.grounded = true;
        }
    }
    if (player.y > canvas.height + 30) respawn();
    enemies.forEach(e => { e.x += e.vx; if (Math.abs(e.x - Math.round(e.x / 160) * 160) < 2) e.vx *= -1; if (hit(player, e)) respawn(); });
    coins.forEach(c => { if (!c.taken && hit(player, { x: c.x - 10, y: c.y - 10, w: 20, h: 20 })) { c.taken = true; score += 10; updateHud(); } });
    camera += (player.x - camera - 350) * .08; camera = Math.max(0, Math.min(world.width - canvas.width, camera));
    if (player.x > world.width - 145) { state = 'won'; statusText.textContent = 'クリア！ おめでとう！'; }
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height); sky.addColorStop(0, '#29275f'); sky.addColorStop(1, '#7061a3'); ctx.fillStyle = sky; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.translate(-camera, 0);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; for (let x = -200; x < world.width; x += 260) { ctx.beginPath(); ctx.arc(x, 130 + (x % 90), 55, 0, Math.PI * 2); ctx.fill(); }
    platforms.forEach(p => { ctx.fillStyle = '#302b57'; ctx.fillRect(p.x, p.y, p.w, p.h); ctx.fillStyle = '#62d3a5'; ctx.fillRect(p.x, p.y, p.w, 8); });
    coins.forEach(c => { if (!c.taken) { ctx.fillStyle = '#ffd35a'; ctx.beginPath(); ctx.arc(c.x, c.y, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff1a6'; ctx.fillRect(c.x - 2, c.y - 6, 3, 8); } });
    enemies.forEach(e => { ctx.fillStyle = '#ef6a7d'; ctx.fillRect(e.x, e.y, e.w, e.h); ctx.fillStyle = '#fff'; ctx.fillRect(e.x + 7, e.y + 9, 6, 8); ctx.fillRect(e.x + 20, e.y + 9, 6, 8); });
    ctx.fillStyle = '#ffcf5c'; ctx.fillRect(world.width - 120, 270, 7, 175); ctx.fillStyle = '#ff7189'; ctx.beginPath(); ctx.moveTo(world.width - 113, 275); ctx.lineTo(world.width - 40, 300); ctx.lineTo(world.width - 113, 325); ctx.fill();
    ctx.fillStyle = '#8e6bff'; ctx.fillRect(player.x, player.y, player.w, player.h); ctx.fillStyle = '#fff'; ctx.fillRect(player.x + 18, player.y + 9, 6, 6); ctx.restore();
    if (state !== 'playing') { ctx.fillStyle = 'rgba(14,12,35,.72)'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '900 42px Nunito'; ctx.fillText(state === 'won' ? 'CLEAR!' : 'GAME OVER', canvas.width / 2, 245); ctx.font = '700 18px Nunito'; ctx.fillText('Rキーまたはボタンでリスタート', canvas.width / 2, 285); }
}
function loop() { update(); draw(); requestAnimationFrame(loop); }
addEventListener('keydown', e => { keys[e.key] = true; if ([' ', 'ArrowUp', 'w'].includes(e.key) && player.grounded && state === 'playing') player.vy = -13; if (e.key.toLowerCase() === 'r') reset(); });
addEventListener('keyup', e => { keys[e.key] = false; });
document.querySelector('#restart-button').addEventListener('click', reset);
reset(); loop();
