// Decode locally, rasterize SVG, strip metadata, and keep a small cover image.
export const MAX_IMAGE_BYTES=120000;
export function safeImage(data){return typeof data==='string'&&data.length<=160023&&/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(data);}
export async function prepareImage(file){
 if(!file||file.size>12*1024*1024)throw Error('Choose an image smaller than 12 MB.');
 const ext=file.name.split('.').pop().toLowerCase();if(!['png','jpg','jpeg','tif','tiff','svg','webp','gif','bmp','avif'].includes(ext))throw Error('Use PNG, JPG, JPEG, TIFF, SVG, WebP, GIF, BMP or AVIF.');
 let source,release=()=>{};
 if(['tif','tiff'].includes(ext)){
  const bytes=await file.arrayBuffer();const decoded=await new Promise((resolve,reject)=>{const worker=new Worker(new URL('./tiff-worker.js',import.meta.url));const finish=()=>{clearTimeout(timer);worker.terminate();};const timer=setTimeout(()=>{finish();reject(Error('TIFF conversion timed out. Export this image as PNG or JPG.'));},12000);worker.onmessage=({data})=>{finish();data.error?reject(Error(data.error)):resolve(data);};worker.onerror=()=>{finish();reject(Error('This TIFF format could not be read. Export as PNG or JPG.'));};worker.postMessage(bytes,[bytes]);});
  source=document.createElement('canvas');source.width=decoded.width;source.height=decoded.height;source.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(decoded.rgba),decoded.width,decoded.height),0,0);
 }else{
  let blob=file;
  if(ext==='svg'){
   const text=await file.text(),xml=new DOMParser().parseFromString(text,'image/svg+xml');
   if(xml.querySelector('parsererror')||xml.documentElement.localName!=='svg'||/<!DOCTYPE|<!ENTITY/i.test(text))throw Error('Invalid SVG. Export it as PNG.');
   const allowed=new Set(['svg','g','path','rect','circle','ellipse','line','polyline','polygon','defs','linearGradient','radialGradient','stop','clipPath','mask','title','desc']);
   for(const node of [...xml.querySelectorAll('*')]){if(!allowed.has(node.localName))throw Error('This SVG contains unsupported content. Export a plain SVG or PNG.');for(const attr of [...node.attributes]){if(/^on/i.test(attr.name)||/href/i.test(attr.name)||attr.name==='style'||/url\(\s*[^#]/i.test(attr.value))throw Error('SVG scripts, embedded content and external links are not accepted.');}}
   blob=new Blob([new XMLSerializer().serializeToString(xml)],{type:'image/svg+xml'});
  }
  const url=URL.createObjectURL(blob);release=()=>URL.revokeObjectURL(url);
  try{source=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('This image could not be decoded. Try PNG or JPG.'));img.src=url;});}catch(error){release();throw error;}
 }
 try{
  let w=source.naturalWidth||source.width,h=source.naturalHeight||source.height;
  if(!w||!h||w*h>40000000)throw Error('Image is too large. Resize it below 40 megapixels.');
  let scale=Math.min(1,1200/Math.max(w,h));const canvas=document.createElement('canvas');
  for(let attempt=0;attempt<7;attempt++){
   canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#f8f7f2';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(source,0,0,canvas.width,canvas.height);
   const data=canvas.toDataURL('image/webp',Math.max(.45,.82-attempt*.06));if(safeImage(data))return {data,width:canvas.width,height:canvas.height};scale*=.8;
  }throw Error('This image could not be made small enough. Use a simpler or smaller picture.');
 }finally{release();}
}
