const languageData = window.VOCABULARY || {};
const languageOrder = window.LANGUAGE_ORDER || Object.keys(languageData);
let data = [];
let currentIndex = 0;
let revealed = 'word';

const languageSelect = document.getElementById('languageSelect');
const flashCard = document.getElementById('flashCard');
const flashHint = document.getElementById('flashHint');

function getAllEntries(){
  const entries = [];
  languageOrder.forEach((lang) => {
    (languageData[lang] || []).forEach((item) => entries.push({ ...item, lang }));
  });
  return entries;
}

function syncData(){
  data = getAllEntries();
  const currentLang = languageSelect.value;
  const languages = languageOrder.filter((lang) => (languageData[lang] || []).length > 0);
  const selectedLang = languages.includes(currentLang) ? currentLang : (languages[0] || '');

  languageSelect.innerHTML = languages.map((lang) => `<option value="${escapeHtml(lang)}">${escapeHtml(lang)}</option>`).join('');
  languageSelect.value = selectedLang;
}

function getFilteredItems(){
  const lang = languageSelect.value;
  return data.filter(item => item.lang === lang);
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
  if(revealed === 'pronunciation'){
    flashCard.innerHTML = `<div class="flash-face"><p class="flash-label">Pronunciation</p><h3>${escapeHtml(item.pronunciation || 'No pronunciation added')}</h3><p class="flash-pronunciation">${escapeHtml(item.word)}</p></div>`;
    flashHint.textContent = `Card ${currentIndex + 1} of ${items.length} — pronunciation is shown.`;
  } else if(revealed === 'translation'){
    flashCard.innerHTML = `<div class="flash-face flash-back"><p class="flash-label">Translation</p><h3>${escapeHtml(item.translation)}</h3><p class="flash-pronunciation">${escapeHtml(item.word)}</p></div>`;
    flashHint.textContent = `Card ${currentIndex + 1} of ${items.length} — translation is shown.`;
  } else {
    flashCard.innerHTML = `<div class="flash-face"><p class="flash-label">Word</p><h3>${escapeHtml(item.word)}</h3></div>`;
    flashHint.textContent = `Card ${currentIndex + 1} of ${items.length} — word is shown. Use the buttons to reveal more.`;
  }
}

function goToRandomCard(){
  const items = getFilteredItems();
  if(!items.length) return;

  if(items.length === 1){
    currentIndex = 0;
    revealed = 'word';
    renderFlashCard();
    return;
  }

  let nextIndex = Math.floor(Math.random() * items.length);
  while(nextIndex === currentIndex){
    nextIndex = Math.floor(Math.random() * items.length);
  }

  currentIndex = nextIndex;
  revealed = 'word';
  renderFlashCard();
}

function escapeHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function renderAll(){
  syncData();
  currentIndex = 0;
  revealed = 'word';
  renderFlashCard();
}

// UI
document.getElementById('showPronunciation').addEventListener('click',()=>{revealed = 'pronunciation'; renderFlashCard();});
document.getElementById('showTranslation').addEventListener('click',()=>{revealed = 'translation'; renderFlashCard();});
document.getElementById('randomCard').addEventListener('click',goToRandomCard);

languageSelect.addEventListener('change',renderAll);

// initial render
renderAll();
