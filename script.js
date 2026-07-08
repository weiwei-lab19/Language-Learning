const STORAGE_KEY = 'll_vocab_v1';

const sample = [
  {word:'안녕하세요',translation:'hello',pronunciation:'annyeonghaseyo',lang:'Korean'},
  {word:'감사합니다',translation:'thank you',pronunciation:'gamsahamnida',lang:'Korean'},
  {word:'你好',translation:'hello',pronunciation:'nǐ hǎo',lang:'Chinese'},
  {word:'谢谢',translation:'thank you',pronunciation:'xièxie',lang:'Chinese'},
  {word:'こんにちは',translation:'hello',pronunciation:'konnichiwa',lang:'Japanese'},
  {word:'ありがとう',translation:'thank you',pronunciation:'arigatou',lang:'Japanese'},
];

function loadData(){
  try{const raw = localStorage.getItem(STORAGE_KEY); if(raw) return JSON.parse(raw)}catch(e){}
  return sample.slice();
}

function saveData(data){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}

let data = loadData();
let currentIndex = 0;
let showAnswer = false;

const resultsList = document.getElementById('resultsList');
const alphaIndex = document.getElementById('alphaIndex');
const searchInput = document.getElementById('searchInput');
const languageSelect = document.getElementById('languageSelect');
const flashCard = document.getElementById('flashCard');
const flashWord = document.getElementById('flashWord');
const flashPronunciation = document.getElementById('flashPronunciation');
const flashHint = document.getElementById('flashHint');

function getFilteredItems(){
  const lang = languageSelect.value;
  const q = searchInput.value.trim().toLowerCase();
  return data.filter(item => item.lang === lang && (item.word.toLowerCase().includes(q) || item.translation.toLowerCase().includes(q) || (item.pronunciation || '').toLowerCase().includes(q)));
}

function renderList(){
  const items = getFilteredItems();
  resultsList.innerHTML = items.map(it=>`<li><div><strong>${escapeHtml(it.word)}</strong> ${it.pronunciation ? `<span class="pron">[${escapeHtml(it.pronunciation)}]</span>` : ''} — <span class="muted">${escapeHtml(it.translation)}</span></div><div class="meta">${escapeHtml(it.lang)}</div></li>`).join('') || '<li><em>No results</em></li>';
}

function renderIndex(){
  const lang = languageSelect.value;
  const buckets = {};
  data.filter(d=>d.lang===lang).forEach(d=>{
    const k = (d.word || '').trim()[0]?.toUpperCase() || '#';
    (buckets[k] ||= []).push(d);
  });
  const letters = Object.keys(buckets).sort();
  alphaIndex.innerHTML = letters.map(l=>{
    const items = buckets[l].map(i=>`<div>${escapeHtml(i.word)}${i.pronunciation ? ` · ${escapeHtml(i.pronunciation)}` : ''}</div>`).join('');
    return `<div class="bucket"><strong>${l}</strong><div>${items}</div></div>`
  }).join('') || '<div><em>No words in this language yet.</em></div>';
}

function renderFlashCard(){
  const items = getFilteredItems();
  if(!items.length){
    flashCard.innerHTML = '<div class="flash-face"><p class="flash-label">No cards</p><h3>No cards available</h3><p class="flash-pronunciation">Try adding a new card.</p></div>';
    flashHint.textContent = 'No matching cards for this language and search yet.';
    return;
  }
  if(currentIndex >= items.length) currentIndex = 0;
  const item = items[currentIndex];
  if(showAnswer){
    flashCard.innerHTML = `<div class="flash-face flash-back"><p class="flash-label">Meaning</p><h3>${escapeHtml(item.translation)}</h3><p class="flash-pronunciation">${escapeHtml(item.pronunciation || 'No pronunciation added')}</p></div>`;
    flashHint.textContent = `Card ${currentIndex + 1} of ${items.length} — this side shows the meaning.`;
  } else {
    flashCard.innerHTML = `<div class="flash-face"><p class="flash-label">Word</p><h3>${escapeHtml(item.word)}</h3><p class="flash-pronunciation">${escapeHtml(item.pronunciation || 'No pronunciation added')}</p></div>`;
    flashHint.textContent = `Card ${currentIndex + 1} of ${items.length} — flip to reveal the translation.`;
  }
}

function escapeHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function renderAll(){
  currentIndex = 0;
  showAnswer = false;
  renderList();
  renderIndex();
  renderFlashCard();
}

// UI
document.getElementById('showAdd').addEventListener('click',()=>document.getElementById('addPanel').hidden=false);
document.getElementById('cancelAdd').addEventListener('click',()=>document.getElementById('addPanel').hidden=true);

document.getElementById('addForm').addEventListener('submit',e=>{
  e.preventDefault();
  const w = document.getElementById('wordInput').value.trim();
  const p = document.getElementById('pronunciationInput').value.trim();
  const t = document.getElementById('translationInput').value.trim();
  const l = document.getElementById('addLang').value;
  if(!w||!t) return;
  data.push({word:w,translation:t,pronunciation:p,lang:l});
  saveData(data);
  document.getElementById('addForm').reset();
  document.getElementById('addPanel').hidden=true;
  renderAll();
});

document.getElementById('flipCard').addEventListener('click',()=>{showAnswer = !showAnswer; renderFlashCard();});
document.getElementById('nextCard').addEventListener('click',()=>{currentIndex = (currentIndex + 1) % Math.max(getFilteredItems().length, 1); showAnswer = false; renderFlashCard();});
document.getElementById('prevCard').addEventListener('click',()=>{const total = Math.max(getFilteredItems().length, 1); currentIndex = (currentIndex - 1 + total) % total; showAnswer = false; renderFlashCard();});

searchInput.addEventListener('input',()=>{currentIndex = 0; showAnswer = false; renderAll();});
languageSelect.addEventListener('change',renderAll);

// initial render
renderAll();
