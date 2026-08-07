const FAVORITES='nadr.favorites.v2', HISTORY='nadr.history.v2', NICK='nadr.nickname.v1', SAVE_PREFIX='nadr.save.v1.';
function read(key,fallback){try{const value=JSON.parse(localStorage.getItem(key));return value??fallback}catch{return fallback}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
export function getFavorites(){return read(FAVORITES,[]).filter(value=>typeof value==='string').slice(0,500)}
export function isFavorite(slug){return getFavorites().includes(slug)}
export function toggleFavorite(slug){const set=new Set(getFavorites());if(set.has(slug))set.delete(slug);else set.add(slug);write(FAVORITES,[...set]);return set.has(slug)}
export function getHistory(){return read(HISTORY,[]).filter(item=>item&&typeof item.slug==='string').sort((a,b)=>Date.parse(b.lastPlayedAt)-Date.parse(a.lastPlayedAt)).slice(0,100)}
export function markPlayed(slug){const now=new Date().toISOString(),list=getHistory();const current=list.find(item=>item.slug===slug);const next=current?{...current,lastPlayedAt:now,launches:(Number(current.launches)||0)+1}:{slug,lastPlayedAt:now,launches:1,totalSeconds:0};write(HISTORY,[next,...list.filter(item=>item.slug!==slug)].slice(0,100));return next}
export function addPlaytime(slug,seconds){if(!Number.isFinite(seconds)||seconds<=0)return;const list=getHistory();const item=list.find(row=>row.slug===slug);if(!item)return;item.totalSeconds=Math.min(365*24*3600,(Number(item.totalSeconds)||0)+Math.round(seconds));write(HISTORY,list)}
export function clearHistory(){localStorage.removeItem(HISTORY)}
export function getNickname(){return String(localStorage.getItem(NICK)||'').slice(0,32)}
export function setNickname(value){const nick=String(value||'').trim().slice(0,32);if(nick)localStorage.setItem(NICK,nick);return nick}
export function getGameSave(slug,key){const data=read(`${SAVE_PREFIX}${slug}`,{});return data&&typeof data==='object'?data[key]??null:null}
export function setGameSave(slug,key,value){const data=read(`${SAVE_PREFIX}${slug}`,{});if(!data||typeof data!=='object'||Array.isArray(data))return false;data[key]=value;const serialized=JSON.stringify(data);if(serialized.length>64*1024)throw new Error('save_too_large');try{localStorage.setItem(`${SAVE_PREFIX}${slug}`,serialized);return true}catch{throw new Error('save_failed')}}
export function removeGameSave(slug,key){const data=read(`${SAVE_PREFIX}${slug}`,{});if(data&&typeof data==='object'){delete data[key];write(`${SAVE_PREFIX}${slug}`,data)}}