// ─── Mentenanță PWA — Teste automate ─────────────────────────
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const scriptStart = html.lastIndexOf('<script>');
const scriptEnd   = html.lastIndexOf('</script>');
const js = html.slice(scriptStart + 8, scriptEnd);

let passed = 0;
let failed = 0;
const errors = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch(e) {
    console.log(`  ❌ ${name}: ${e.message}`);
    errors.push({ name, error: e.message });
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

// ─── 1. SINTAXĂ JS ───────────────────────────────────────────
console.log('\n📋 1. Sintaxă JavaScript');

test('Acolade echilibrate', () => {
  const diff = (js.match(/\{/g)||[]).length - (js.match(/\}/g)||[]).length;
  assert(diff === 0, `Diferență acolade: ${diff}`);
});

test('Backticks echilibrate', () => {
  const count = (js.match(/`/g)||[]).length % 2;
  assert(count === 0, `Backticks impare detectate`);
});

test('Paranteze rotunde echilibrate', () => {
  const diff = (js.match(/\(/g)||[]).length - (js.match(/\)/g)||[]).length;
  assert(diff === 0, `Diferență paranteze: ${diff}`);
});

// ─── 2. FUNCȚII DUPLICATE ───────────────────────────────────
console.log('\n📋 2. Funcții duplicate');

const criticalFns = [
  'showView','openUat','closeDrawer','switchTab',
  'renderList','renderStats','filteredUats',
  'loadCorespondenta','renderCorespondenta',
  'loadAudioTab','renderAudio',
  'loadGlobalData','renderGlobalAudio','renderGlobalMail',
  'norm','getDaysUntil','getContractExpiry',
  'toggleExpand','loadFullTranscr','loadFullSumar',
  'swipeToTab','checkForUpdates','applyUpdates',
  'syncData','initSetari','setThemeMode','toggleTheme'
];

criticalFns.forEach(fn => {
  test(`${fn} definit o singură dată`, () => {
    const count = (js.match(new RegExp(`function\\s+${fn}\\s*\\(`, 'g'))||[]).length;
    assert(count === 1, `Găsit de ${count} ori`);
  });
});

// ─── 3. FUNCȚII CRITICE PREZENTE ────────────────────────────
console.log('\n📋 3. Funcții critice prezente');

test('APP_VERSION definit', () => {
  assert(js.includes('const APP_VERSION'), 'APP_VERSION lipsește');
});

test('CHANGELOG definit', () => {
  assert(js.includes('const CHANGELOG'), 'CHANGELOG lipsește');
});

test('API_URL definit', () => {
  assert(js.includes('const API_URL'), 'API_URL lipsește');
});

test('TAB_ORDER definit', () => {
  assert(js.includes('const TAB_ORDER'), 'TAB_ORDER lipsește');
});

// ─── 4. HTML STRUCTURĂ ──────────────────────────────────────
console.log('\n📋 4. Structură HTML');

test('manifest.json referit', () => {
  assert(html.includes('manifest.json'), 'Link manifest.json lipsește din <head>');
});

test('icon.svg referit', () => {
  assert(html.includes('icon.svg'), 'icon.svg lipsește din <head>');
});

test('Drawer prezent', () => {
  assert(html.includes('id="drawer"'), 'Div drawer lipsește');
});

test('Tab Audio prezent', () => {
  assert(html.includes('id="tab-audio"'), 'Tab audio lipsește');
});

test('Tab Mail prezent', () => {
  assert(html.includes('id="tab-corespondenta"'), 'Tab mail lipsește');
});

test('Update banner prezent', () => {
  assert(html.includes('id="update-banner"'), 'Update banner lipsește');
});

test('Stats view prezent', () => {
  assert(html.includes('id="stats-view"'), 'Stats view lipsește');
});

test('Setari view prezent', () => {
  assert(html.includes('id="setari-view"'), 'Setari view lipsește');
});

// ─── 5. VERSIONARE ──────────────────────────────────────────
console.log('\n📋 5. Versionare');

test('CHANGELOG are cel puțin 3 versiuni', () => {
  const versions = (js.match(/version:\s*'v\d+\.\d+'/g)||[]).length;
  assert(versions >= 3, `Doar ${versions} versiuni în CHANGELOG`);
});

test('APP_VERSION format corect', () => {
  const match = js.match(/const APP_VERSION\s*=\s*'(v[\d.]+)'/);
  assert(match, 'APP_VERSION format invalid');
  assert(/^v\d+\.\d+$/.test(match[1]), `Format incorect: ${match[1]}`);
});

test('APP_VERSION prezent în CHANGELOG', () => {
  const vMatch = js.match(/const APP_VERSION\s*=\s*'(v[\d.]+)'/);
  if (!vMatch) throw new Error('APP_VERSION negăsit');
  const version = vMatch[1];
  assert(js.includes(`version: '${version}'`), `${version} nu e în CHANGELOG`);
});

// ─── REZULTAT FINAL ─────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`✅ Trecute: ${passed}  ❌ Eșuate: ${failed}  📊 Total: ${passed+failed}`);

if (failed > 0) {
  console.log('\n🔴 ERORI:');
  errors.forEach(e => console.log(`  • ${e.name}: ${e.error}`));
  process.exit(1);
} else {
  console.log('\n🟢 Toate testele au trecut!');
  process.exit(0);
}
