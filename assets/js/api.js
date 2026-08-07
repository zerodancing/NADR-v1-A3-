import { enrichCommunity,recordPlay,setServerRating } from './community.js';
export {recordPlay,setServerRating};
export {getComments,postComment,voteComment,reportComment} from './comments-api.js';
const BASE='/NADR-v1-A3-/';let catalogPromise;
async function catalog(){if(!catalogPromise)catalogPromise=fetch(`${BASE}data/games.json`).then(r=>{if(!r.ok)throw new Error('catalog');return r.json()});return catalogPromise}
export async function getGames(){const data=await catalog();return {games:await enrichCommunity(data.games||[])}}
export async function getGame(slug){const {games}=await getGames();const game=games.find(g=>g.slug===slug);if(!game)throw Object.assign(new Error('not_found'),{status:404});return game}
export async function reportRuntimeError(){return {ok:true}}
export async function api(){throw new Error('api_unavailable_on_pages')}