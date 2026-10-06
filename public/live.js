import {fromOSM,readLocal,writeLocal,coordinates} from './core.js';
import {buildNearbyQuery} from './food.js';
let lastRequest=0,pending=false,cooldownUntil=0;
export function liveCacheKey(city,radius,query=''){return `v3:${city.lat.toFixed(4)},${city.lon.toFixed(4)}:${radius}:nearby`;}
export function cachedLive(city,radius,query=''){const saved=readLocal(liveCacheKey(city,radius,query),null);return saved&&Array.isArray(saved.places)?saved:null;}
async function providerRequest(endpoint,query,signal){const url=new URL(endpoint);if(url.protocol!=='https:')throw Error('The search provider must use HTTPS.');url.searchParams.set('data',query);const controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)controller.abort();const timer=setTimeout(()=>controller.abort(),19000);try{const response=await fetch(url,{signal:controller.signal});if(!response.ok){const e=Error('Search service temporarily unavailable.');e.status=response.status;throw e;}const data=await response.json();if(data.remark||!Array.isArray(data.elements))throw Error('The search service did not finish this request.');return data;}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}}
export async function findLive(city,config,{refresh=false,query='',radius=config.radiusMeters||5000,onProgress=()=>{},signal}={}){
 if(!coordinates(city.lat,city.lon))throw Error('Choose a valid location first.');radius=Math.min(160934.4,Math.max(1000,Number(radius)||5000));const key=liveCacheKey(city,radius,query),saved=cachedLive(city,radius,query);
 if(!refresh&&saved&&Date.now()-saved.at<86400000)return {...saved,cached:true};
 if(!config.liveSearchEnabled)throw Error('Live search is paused. You can still browse the saved directory or search in Google Maps.');
 while(pending||Date.now()<cooldownUntil||Date.now()-lastRequest<15000){if(signal?.aborted)throw new DOMException('Cancelled','AbortError');await new Promise(r=>setTimeout(r,100));}
 if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
 pending=true;lastRequest=Date.now();const limit=Math.min(2000,config.resultLimit||2000),ql=buildNearbyQuery(city,{radius,limit});const endpoints=[...new Set(config.overpassEndpoints||[config.overpassEndpoint])].filter(Boolean).slice(0,2);let data,lastError;
 try{
  for(let i=0;i<endpoints.length;i++){
   try{onProgress(i?'Trying the backup search service…':'Searching nearby food places…');data=await providerRequest(endpoints[i],ql,signal);break;}catch(e){if(signal?.aborted)throw e;lastError=e;if([403,406,429].includes(e.status)){cooldownUntil=Date.now()+30000;break;}if(i<endpoints.length-1)await new Promise(r=>setTimeout(r,1000));}
  }
  if(!data)throw lastError||Error('No search provider is configured.');
  const places=[...new Map(data.elements.map(e=>fromOSM(e,city)).filter(Boolean).map(p=>[p.id,p])).values()];
  const result={places,at:Date.now(),limited:data.elements.length>=limit,radius,query:''};writeLocal(key,result);const keys=readLocal('cacheKeys',[]).filter(x=>x!==key);keys.push(key);while(keys.length>6){try{localStorage.removeItem('ff:'+keys.shift());}catch{break;}}writeLocal('cacheKeys',keys);return result;
 }catch(e){if(signal?.aborted)throw new DOMException('Cancelled','AbortError');if(saved)return {...saved,cached:true,stale:true};const error=Error([403,406,429].includes(e?.status)?'The search provider asked us to pause. Wait at least 30 seconds, or use Google Maps.':'The live food service could not be reached. Check your connection, try again later, or search this food in Google Maps.');error.status=e?.status;throw error;}finally{pending=false;}
}
