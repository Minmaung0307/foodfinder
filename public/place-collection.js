import {coordinates,distance,normalize} from './core.js';
const compact=s=>normalize(s).replace(/[^\p{L}\p{N}]/gu,'');
// Prefer the official record for the same branch, never merge a chain across towns.
export function mergePlaces(items){
 const records=[...new Map(items.map(p=>[p.id,p])).values()];
 const official=records.filter(p=>p.sourceType==='Official business website');
 return records.filter(p=>official.includes(p)||!official.some(o=>{
  if(!coordinates(p.lat,p.lon)||!coordinates(o.lat,o.lon)||distance(p,o)>.5)return false;
  const phone=compact(p.phone),samePhone=phone&&phone===compact(o.phone);
  const names=[o.name,o.searchNames].filter(Boolean).map(compact);
  return samePhone||[p.name,p.localName].filter(Boolean).some(n=>names.includes(compact(n)));
 }));
}
