import {createHmac,timingSafeEqual,randomBytes} from 'node:crypto';
const localSecret=randomBytes(32).toString('hex');
const equal=(a,b)=>{let x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)};
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 const password=process.env.EVENT_PASSWORD||(process.env.VERCEL?'':'event2026');
 const secret=process.env.SESSION_SECRET||(process.env.VERCEL?'':localSecret);
 if(!password||!secret)return res.status(503).json({error:'Event access is not configured yet.'});
 const sign=s=>createHmac('sha256',secret).update(s).digest('hex');
 const secure=process.env.VERCEL?'; Secure':'';
 if(req.method==='DELETE'){res.setHeader('Set-Cookie','event_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'+secure);return res.status(200).json({ok:true})}
 if(req.method==='POST'){
 let body=req.body;try{if(typeof body==='string')body=JSON.parse(body)}catch{return res.status(400).json({error:'Invalid request'})}
 if(typeof body?.password!=='string'||!equal(body.password,password))return res.status(401).json({error:'That code isn’t right. Please try again.'});
 const exp=String(Date.now()+28800000);res.setHeader('Set-Cookie',`event_session=${exp}.${sign(exp)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure}`);return res.status(200).json({ok:true});
 }
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const cookie=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('event_session='))?.slice(14)||'';
 const [exp,sig]=cookie.split('.');if(!exp||!sig||!/^\d+$/.test(exp)||Number(exp)<Date.now()||!equal(sig,sign(exp)))return res.status(401).json({error:'Access code required'});
 const url=process.env.STREAM_EMBED_URL||'';if(url){try{if(new URL(url).protocol!=='https:')throw Error()}catch{return res.status(503).json({error:'An HTTPS player embed URL is required.'})}}
 return res.status(200).json({url,demo:!url});
}
