import {json,requireAdmin} from '../_shared.js';
const TYPES=new Set(['image/jpeg','image/png','image/webp','image/gif']);
function cleanName(s){return String(s||'image').replace(/[\\/\x00-\x1f\x7f]/g,'_').slice(0,180)||'image'}
export async function onRequestPost({request,env}){const denied=await requireAdmin(request,env);if(denied)return denied;if(!env.IMAGES||!env.DB)return json({error:'R2 or D1 binding is missing.'},503);const maxMb=Math.max(1,Math.min(25,Number(env.MAX_UPLOAD_MB)||10));let form;try{form=await request.formData()}catch{return json({error:'Invalid upload form.'},400)}const file=form.get('file');if(!file||typeof file.arrayBuffer!=='function')return json({error:'Choose an image file.'},400);if(file.size<1||file.size>maxMb*1024*1024)return json({error:`Image must be smaller than ${maxMb} MB.`},413);if(!TYPES.has(file.type))return json({error:'Only JPG, PNG, WEBP, and GIF are allowed.'},415);const id=crypto.randomUUID(),key=`images/${id}`,filename=cleanName(file.name),createdAt=new Date().toISOString();await env.IMAGES.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type,cacheControl:'public, max-age=31536000, immutable'},customMetadata:{id,filename}});try{await env.DB.prepare('INSERT INTO images (id, object_key, filename, content_type, size_bytes, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id,key,filename,file.type,file.size,createdAt).run()
} catch (e) {
  console.error("D1 metadata insert failed:", e?.message || e);

  try {
    await env.IMAGES.delete(key);
  } catch (cleanupError) {
    console.error("R2 cleanup failed:", cleanupError?.message || cleanupError);
  }

  return json({
    error: "Could not save image metadata.",
    detail: e?.message || String(e)
  }, 500);
},500)}const origin=new URL(request.url).origin;return json({ok:true,image:{id,filename,sizeBytes:file.size,createdAt,viewerUrl:`${origin}/i/${id}`,directUrl:`${origin}/img/${id}`}})}
