import { getGames } from '../api.js';
import { applyTranslations, getLocale, localize, t } from '../i18n.js';
import { getHistory } from '../store.js';
import { categoryLabel, dailyPick, escapeHtml, gameCard, icons, initShell, recentGames, sessionLabel } from '../ui.js';

await initShell();
const hero=document.querySelector('#hero'), categoryHost=document.querySelector('#categoryPills'), continueSection=document.querySelector('#continueSection'), continueRail=document.querySelector('#continueRail'), editorial=document.querySelector('#editorialGrid'), moodGrid=document.querySelector('#moodGrid');
try{
  const {games=[]}=await getGames();
  const playable=games.filter(game=>game.status==='published');
  const pick=dailyPick(playable) || playable[0];
  if(pick){
    hero.innerHTML=`<div class="hero__media"><img src="${escapeHtml(pick.heroUrl)}" alt="" fetchpriority="high"/><span></span></div><div class="hero__shade"></div><div class="hero__content shell"><div class="hero__copy"><span class="hero__kicker">${escapeHtml(t('home.heroKicker'))}</span><div class="hero__tags"><span>${escapeHtml(categoryLabel(pick.category))}</span><span>${escapeHtml(pick.ageRating)}</span><span>${escapeHtml(sessionLabel(pick))}</span></div><h1>${escapeHtml(localize(pick.title))}</h1><p>${escapeHtml(localize(pick.shortDescription))}</p><div class="hero__actions"><a class="button button--primary button--large" href="/NADR-v1-A3-/games/${encodeURIComponent(pick.slug)}?autoplay=1">${icons.play}<span>${escapeHtml(t('home.heroPlay'))}</span></a><a class="button button--glass button--large" href="/NADR-v1-A3-/games/${encodeURIComponent(pick.slug)}">${escapeHtml(t('home.heroMore'))}</a></div><div class="hero__proof"><span>${pick.editorialChoice?'✓ '+(getLocale()==='ru'?'Выбор редакции':'Editor choice'):''}</span><span>${pick.community?.rating?.count?`★ ${Number(pick.community.rating.average).toFixed(1)}`:(getLocale()==='ru'?'Без выдуманных оценок':'No fabricated ratings')}</span></div></div><a class="hero__peek" href="/NADR-v1-A3-/games/${encodeURIComponent(pick.slug)}" aria-label="${escapeHtml(localize(pick.title))}"><img src="${escapeHtml(pick.coverUrl)}" alt=""/><span><b>${escapeHtml(localize(pick.title))}</b><small>${escapeHtml(sessionLabel(pick))}</small></span>${icons.arrow}</a></div>`;
  }
  const categories=[...new Set(playable.map(game=>game.category))];
  categoryHost.innerHTML=categories.map(category=>`<a class="category-pill" href="/NADR-v1-A3-/games/?category=${encodeURIComponent(category)}"><span>${escapeHtml(categoryLabel(category))}</span><b>${playable.filter(game=>game.category===category).length}</b></a>`).join('');
  const recent=recentGames(playable).slice(0,4);
  if(recent.length){continueSection.hidden=false;continueRail.innerHTML=recent.map(game=>gameCard(game)).join('')}
  const editorialGames=playable.filter(game=>game.slug!==pick?.slug).sort((a,b)=>Number(b.editorialChoice)-Number(a.editorialChoice)||b.editorialRank-a.editorialRank).slice(0,4);
  editorial.innerHTML=editorialGames.map((game,index)=>gameCard(game,{wide:index===0&&editorialGames.length>2})).join('');
  const moodDefs=[
    {key:'fast',title:getLocale()==='ru'?'Быстро и напряжённо':'Fast & focused',text:getLocale()==='ru'?'Короткие попытки, реакция и рекорд.':'Short runs, reactions and scores.',cats:['arcade','puzzle']},
    {key:'calm',title:getLocale()==='ru'?'Спокойно':'Take it easy',text:getLocale()==='ru'?'Без таймера, можно отвлечься и вернуться.':'No pressure, easy to leave and return.',cats:['cozy','idle']},
    {key:'flow',title:getLocale()==='ru'?'Поймать поток':'Find the flow',text:getLocale()==='ru'?'Движение, музыка города и атмосфера.':'Motion, city rhythm and atmosphere.',cats:['driving']}
  ];
  moodGrid.innerHTML=moodDefs.map((mood,index)=>{const count=playable.filter(game=>mood.cats.includes(game.category)).length;const href=`/NADR-v1-A3-/games/?mood=${encodeURIComponent(mood.key)}`;return `<a class="mood-card mood-card--${index+1}" href="${href}"><span>${String(index+1).padStart(2,'0')}</span><div><h3>${escapeHtml(mood.title)}</h3><p>${escapeHtml(mood.text)}</p></div><b>${count} ${getLocale()==='ru'?'игр':'games'} ${icons.arrow}</b></a>`}).join('');
  applyTranslations();
}catch(error){console.error(error);hero.innerHTML='<div class="shell error-banner"><h1>NADR</h1><p>Не удалось загрузить каталог. Проверьте соединение.</p></div>'}