const STORAGE_KEY = 'll_vocab_v1';

const sample = [
  {word:'hola',translation:'hello',lang:'Spanish'},
  {word:'adiós',translation:'goodbye',lang:'Spanish'},
  {word:'merci',translation:'thank you',lang:'French'},
  {word:'bonjour',translation:'hello',lang:'French'},
  {word:'hallo',translation:'hello',lang:'German'},
];

function loadData(){
  try{const raw = localStorage.getItem(STORAGE_KEY); if(raw) return JSON.parse(raw)}catch(e){}
  return sample.slice();
}

function saveData(data){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}

let data = loadData();

const resultsList = document.getElementById('resultsList');
const alphaIndex = document.getElementById('alphaIndex');
const searchInput = document.getElementById('searchInput');
const languageSelect = document.getElementById('languageSelect');

function renderList(filter=''){
  const lang = languageSelect.value;
  const q = filter.trim().toLowerCase();
  const items = data.filter(d=>d.lang===lang && (d.word.toLowerCase().includes(q) || d.translation.toLowerCase().includes(q)));
  resultsList.innerHTML = items.map(it=>`<li><div><strong>${escapeHtml(it.word)}</strong> — <span class="muted">${escapeHtml(it.translation)}</span></div><div class="meta">${escapeHtml(it.lang)}</div></li>`).join('') || '<li><em>No results</em></li>';
}

function renderIndex(){
  const lang = languageSelect.value;
  const buckets = {};
  data.filter(d=>d.lang===lang).forEach(d=>{
    const k = d.word[0].toUpperCase();
    (buckets[k] ||= []).push(d);
  });
  const letters = Object.keys(buckets).sort();
  alphaIndex.innerHTML = letters.map(l=>{
    const items = buckets[l].map(i=>`<div>${escapeHtml(i.word)} — ${escapeHtml(i.translation)}</div>`).join('');
    return `<div class="bucket"><strong>${l}</strong><div>${items}</div></div>`
  }).join('') || '<div><em>No words in this language yet.</em></div>';
}

function escapeHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

// UI
document.getElementById('showAdd').addEventListener('click',()=>document.getElementById('addPanel').hidden=false);
document.getElementById('cancelAdd').addEventListener('click',()=>document.getElementById('addPanel').hidden=true);

document.getElementById('addForm').addEventListener('submit',e=>{
  e.preventDefault();
  const w = document.getElementById('wordInput').value.trim();
  const t = document.getElementById('translationInput').value.trim();
  const l = document.getElementById('addLang').value;
  if(!w||!t) return;
  data.push({word:w,translation:t,lang:l});
  saveData(data);
  document.getElementById('addForm').reset();
  document.getElementById('addPanel').hidden=true;
  renderAll();
});

searchInput.addEventListener('input',()=>renderList(searchInput.value));
languageSelect.addEventListener('change',renderAll);

function renderAll(){renderList(searchInput.value); renderIndex();}

// initial render
renderAll();
