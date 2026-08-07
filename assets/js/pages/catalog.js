import { getGames } from '../api.js';
import { applyTranslations, getLocale, localize, localizeList, t } from '../i18n.js';
import { getFavorites, getHistory } from '../store.js';
import { categoryLabel, escapeHtml, gameCard, initShell } from '../ui.js';

await initShell();
const grid=document.querySelector('#catalogGrid'), search=document.querySelector('#catalogSearch'), sort=document.querySelector('#catalogSort'), count=document.querySelector('#catalogCount'), empty=document.querySelector('#emptyState'), categoriesHost=document.querySelector('#categoryFilters');
let games=[],category='all',mood='';
const params=new URLSearchParams(location.search);
category=params.get('category')||'all';mood=params.get('mood')||'';search.value=params.get('q')||'';if(params.get('sort'))sort.value=params.get('sort');document.querySelector('#onlyFavorites').checked=params.get('favorites')==='1';
function countLabel(value){if(getLocale()==='en')return `${value} games`;const n=Math.abs(value)%100,last=n%10;return `${value} ${n>10&&n<20?'игр':last===1?'игра':last>1&&last<5?'игры':'игр'}`}
function render(){
  const query=search.value.trim().toLocaleLowerCase();const available=document.querySelector('#availableFilter').checked,upcoming=document.querySelector('#upcomingFilter').checked,favoritesOnly=document.querySelector('#onlyFavorites').checked,favorites=new Set(getFavorites());
  const moodMap={fast:['arcade','puzzle'],calm:['cozy','idle'],flow:['driving']};
  let result=games.filter(game=>(category==='all'||game.category===category)&&(!mood||moodMap[mood]?.includes(game.category))&&((available&&game.status==='published')||(upcoming&&game.status==='upcoming'))&&(!favoritesOnly||favorites.has(game.slug)));
  if(query)result=result.filter(game=>[localize(game.title),localize(game.shortDescription),categoryLabel(game.category),...localizeList(game.tags)].join(' ').toLocaleLowerCase().includes(query));
  if(sort.value==='new')result.sort((a,b)=>Date.parse(b.releaseDate)-Date.parse(a.releaseDate));else if(sort.value==='recent'){const recent=new Map(getHistory().map((item,index)=>[item.slug,index]));result.sort((a,b)=>(recent.get(a.slug)??1e9)-(recent.get(b.slug)??1e9)||b.editorialRank-a.editorialRank)}else if(sort.value==='title')result.sort((a,b)=>localize(a.title).localeCompare(localize(b.title),getLocale()));else if(sort.value==='rating')result.sort((a,b)=>(b.community?.rating?.average||0)-(a.community?.rating?.average||0)||(b.community?.rating?.count||0)-(a.community?.rating?.count||0));else result.sort((a,b)=>b.editorialRank-a.editorialRank);
  grid.innerHTML=result.map(game=>gameCard(game)).join('');count.textContent=countLabel(result.length);empty.hidden=result.length>0;
  const next=new URLSearchParams();if(category!=='all')next.set('category',category);if(mood)next.set('mood',mood);if(search.value.trim())next.set('q',search.value.trim());if(sort.value!=='editorial')next.set('sort',sort.value);if(favoritesOnly)next.set('favorites','1');history.replaceState(null,'',`${location.pathname}${next.size?`?${next}`:''}`)
}
try{
  ({games=[]}=await getGames());
  const categories=['all',...new Set(games.map(game=>game.category))];
  categoriesHost.innerHTML=categories.map(value=>`<button type="button" class="filter-option${value===category?' is-active':''}" data-category="${escapeHtml(value)}"><span>${escapeHtml(value==='all'?(getLocale()==='ru'?'Все жанры':'All genres'):categoryLabel(value))}</span><b>${value==='all'?games.length:games.filter(game=>game.category===value).length}</b></button>`).join('');
  categoriesHost.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;mood='';categoriesHost.querySelectorAll('[data-category]').forEach(node=>node.classList.toggle('is-active',node===button));render()}));
  [search,sort,document.querySelector('#availableFilter'),document.querySelector('#upcomingFilter'),document.querySelector('#onlyFavorites')].forEach(node=>node.addEventListener(node===search?'input':'change',render));
  document.querySelector('#resetFilters').addEventListener('click',()=>{category='all';mood='';search.value='';sort.value='editorial';document.querySelector('#availableFilter').checked=true;document.querySelector('#upcomingFilter').checked=true;document.querySelector('#onlyFavorites').checked=false;categoriesHost.querySelectorAll('[data-category]').forEach(node=>node.classList.toggle('is-active',node.dataset.category==='all'));render()});
  render();applyTranslations();
}catch(error){console.error(error);grid.innerHTML='<div class="error-banner"><h2>Каталог недоступен</h2></div>'}