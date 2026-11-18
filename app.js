(function(){
const TH=window.APP_THEME,D=window.APP_DATA,K='idd_v2';
const PR=[['fajr','فجر|Fajr'],['dhuhr','ظہر|Dhuhr'],['asr','عصر|Asr'],['maghrib','مغرب|Maghrib'],['isha','عشاء|Isha']];
const NF=[['ishraq','اشراق|Ishraq'],['awwabin','اوابین|Awwabin'],['tahajjud','تہجد|Tahajjud'],['chasht','چاشت|Chasht']];
const UNITS=[['page','صفحات|Pages'],['ruku','رکوع|Ruku'],['para','پارے|Juz'],['ayat','آیات|Verses']];
const NAVI={home:['home','ہوم|Home'],ibadat:['ibadat','عبادات|Worship'],adhkar:['adhkar','اذکار|Adhkar'],duas:['duas','دعائیں|Duas'],qibla:['qibla','قبلہ|Qibla'],more:['more','مزید|More']};
const MORE=[['muh','muh','محاسبہ|Muhasabah'],['notes','notes','نوٹس و روزے|Notes & Fasts'],['reports','reports','رپورٹس|Reports'],['theme','theme','ترتیبات|Settings']];
let S=load(),view='home',today=ymd(new Date()),cur=today,follow=true,editAd=false,duaCat='',stopC=null;
function load(){let s=null;try{s=JSON.parse(localStorage.getItem(K)||'null');}catch(e){}s=s||{};
 s.lang=s.lang||'ur';s.theme=s.theme||TH.defaultTheme;s.hijri=+s.hijri||0;s.city=s.city||'Lahore';s.goal=s.goal||2;
 s.notes=s.notes||[];s.days=s.days||{};s.cc=s.cc||[];s.adhkar=s.adhkar||D.adhkar.map(a=>Object.assign({},a));return migrate(s);}
function migrate(s){if(s.v>=3)return s;try{localStorage.setItem(K+'_pre_v3',JSON.stringify(s));}catch(e){}
 Object.keys(s.days).forEach(k=>{const d=s.days[k];if(!d||typeof d!=='object')return;const tl=d.tl;if(tl&&typeof tl==='object'&&tl.x&&typeof tl.x==='object'){['done','qty','unit'].forEach(f=>{if(tl[f]===undefined&&tl.x[f]!==undefined)tl[f]=tl.x[f];});delete tl.x;}
  if(tl&&tl.qty!==undefined){const q=+tl.qty;tl.qty=isFinite(q)&&q>=0?q:0;}});
 s.v=3;return s;}
function save(){try{localStorage.setItem(K,JSON.stringify(S));}catch(e){}}
const $=q=>document.querySelector(q);
const t=s=>{const i=s.indexOf('|');return i<0?s:(S.lang==='ur'?s.slice(0,i):s.slice(i+1));};
function ymd(d){const p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());}
function day(d){const x=S.days[d]||(S.days[d]={});['p','n','tl','ad','ck','mu'].forEach(k=>x[k]=x[k]||{});return x;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function hijri(d){try{const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+S.hijri);return new Intl.DateTimeFormat(S.lang==='ur'?'ur-u-ca-islamic-umalqura':'en-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}).format(x);}catch(e){return '';}}
function wk(d){try{return new Intl.DateTimeFormat(S.lang==='ur'?'ur':'en',{weekday:'long'}).format(new Date(d+'T12:00:00'));}catch(e){return '';}}
function theme(){const h=TH.themes[S.theme]||TH.themes[TH.defaultTheme],r=document.documentElement.style;
 r.setProperty('--p',h.p);r.setProperty('--p2',h.p2);r.setProperty('--a',h.a);r.setProperty('--bg',h.bg);r.setProperty('--card',h.card);r.setProperty('--tx',h.tx);r.setProperty('--mu',h.mu);r.setProperty('--r',TH.radius);document.body.style.fontFamily=TH.fontFamily;
 $('#hd').className=TH.headerPattern?'pat':'';}
function yn(g,i,f,v){return `<span class="yn" data-g="${g}" data-i="${i}" data-f="${f}"><button data-v="1" class="${v===true?'on y':''}">${t('ہاں|Yes')}</button><button data-v="0" class="${v===false?'on n':''}">${t('نہیں|No')}</button></span>`;}
function ring(p){return `<svg class="ring" viewBox="0 0 100 100"><circle class="rb" cx="50" cy="50" r="42"/><circle class="rf" cx="50" cy="50" r="42" stroke-dasharray="264" stroke-dashoffset="${264*(1-p/100)}" transform="rotate(-90 50 50)"/><text x="50" y="58" text-anchor="middle">${p}%</text></svg>`;}
function bar(p){return `<div class="bar"><i style="width:${Math.min(100,p)}%"></i></div>`;}
function shift(n){const d=new Date(cur+'T12:00:00');d.setDate(d.getDate()+n);return ymd(d);}
function dateBar(){const past=cur<today,fut=cur>today;return `<div class="card"><div class="row" style="border:0"><button class="btn o" data-dn="-1">${t('پچھلا دن|Previous')}</button><button class="btn g" data-dn="0">${t('آج|Today')}</button><button class="btn o" data-dn="1">${t('اگلا دن|Next')}</button></div><input type="date" id="dp" value="${cur}">${past?`<div class="sm">${t('آپ پرانا ریکارڈ دیکھ/ایڈٹ کر رہے ہیں۔|You are viewing/editing a past record.')}</div>`:''}${fut?`<div class="sm">${t('یہ آنے والی تاریخ ہے۔|This is a future date.')}</div>`:''}</div>`;}
function tick(){const n=ymd(new Date());if(n===today)return false;today=n;if(follow){cur=n;}render();return true;}
function farz(d){const x=day(d).p;return PR.filter(p=>x[p[0]]&&x[p[0]].done===true).length;}
function jam(d){const x=day(d).p;return PR.filter(p=>x[p[0]]&&x[p[0]].done===true&&x[p[0]].jam===true).length;}
const V={
home(){const D0=day(cur),f=farz(cur),j=jam(cur),nf=NF.filter(n=>D0.n[n[0]]&&D0.n[n[0]].done).length,tl=D0.tl.done===true;
 const ads=S.adhkar.filter(a=>(D0.ad[a.id]||0)>=a.n).length,optT=NF.length+1+S.adhkar.length,optD=nf+(tl?1:0)+ads,op=Math.round(optD/optT*100);
 const mk=cur.slice(0,7),ks=Object.keys(S.days).filter(k=>k.startsWith(mk)),mo=ks.length?Math.round(ks.reduce((a,k)=>a+farz(k),0)/ks.length/5*100):0;
 return dateBar()+`<div class="card"><h3>${ic('ibadat')}${t('فرض نمازیں|Obligatory prayers')}</h3><div class="hero">${ring(Math.round(f/5*100))}<div style="flex:1"><div class="stats"><div class="stat"><b>${f}/5</b>${t('ادا کیں|Performed')}</div><div class="stat"><b>${j}/5</b>${t('جماعت|Jamaah')}</div></div></div></div></div>
 <div class="card"><h3>${ic('check')}${t('اختیاری اعمال|Optional deeds')} · ${op}%</h3>${bar(op)}<div class="stats" style="margin-top:10px"><div class="stat"><b>${nf}/4</b>${t('نوافل|Nafl')}</div><div class="stat"><b>${tl?(D0.tl.qty||'✓'):'—'}</b>${t('تلاوت|Tilawat')}</div><div class="stat"><b>${ads}/${S.adhkar.length}</b>${t('اذکار|Adhkar')}</div><div class="stat"><b>${mo}%</b>${t('ماہانہ فرض|Month (farz)')}</div></div></div>`;},
ibadat(){const d=day(cur);let h=dateBar()+`<div class="card"><h3>${ic('ibadat')}${t('فرض نمازیں|Obligatory prayers')}</h3>`;
 PR.forEach(([id,n])=>{const x=d.p[id]||{};h+=`<div class="row"><span class="nm">${t(n)}</span>${yn('p',id,'done',x.done)}</div>`;
  if(x.done===true)h+=`<div class="row"><span class="sm">${t('جماعت کے ساتھ؟|In congregation?')}</span>${yn('p',id,'jam',x.jam)}</div>`;});
 h+=`</div><div class="card"><h3>${ic('plus')}${t('نوافل|Nafl prayers')}</h3>`;
 NF.forEach(([id,n])=>{h+=`<div class="row"><span class="nm">${t(n)}</span>${yn('n',id,'done',(d.n[id]||{}).done)}</div>`;});
 const tl=d.tl;h+=`</div><div class="card"><h3>${ic('duas')}${t('قرآن کی تلاوت|Quran recitation')}</h3><div class="row"><span class="nm">${t('تلاوت کی؟|Recited?')}</span>${yn('tl','x','done',tl.done)}</div>`;
 if(tl.done===true)h+=`<label>${t('مقدار|Amount')}<input type="number" min="0" data-g="tl" data-i="x" data-f="qty" data-k="1" value="${esc(tl.qty)}"></label><select data-g="tl" data-i="x" data-f="unit" data-k="1">${UNITS.map(u=>`<option value="${u[0]}" ${(tl.unit||'page')===u[0]?'selected':''}>${t(u[1])}</option>`).join('')}</select>`;
 return h+'</div>';},
adhkar(){const d=day(cur);let h=dateBar()+`<div style="text-align:center"><button class="btn ${editAd?'g':'o'}" id="aed">${ic('edit',18)}${t(editAd?'مکمل|Done':'تبدیل کریں|Edit')}</button></div>`;
 S.adhkar.forEach(a=>{const c=d.ad[a.id]||0;h+=`<div class="card"><div class="sm">${t(a.cat||'')}</div>`;
  if(editAd)h+=`<label>${t('عربی/متن|Text')}<textarea data-ad="${a.id}" data-f="ar">${esc(a.ar)}</textarea></label><label>${t('ترجمہ|Translation')}<textarea data-ad="${a.id}" data-f="ur">${esc(a.ur)}</textarea></label><label>${t('ہدف|Target')}<input type="number" min="1" data-ad="${a.id}" data-f="n" value="${a.n}"></label><button class="btn o" data-del="${a.id}">${ic('trash',18)}${t('حذف|Delete')}</button>`;
  else h+=`<div class="ar">${esc(a.ar)}</div><div class="sm" style="text-align:center">${esc(S.lang==='ur'?a.ur:(a.en||a.ur))}</div><div class="sm" style="text-align:center">${esc(a.ref||'')}</div><button class="tap" data-inc="${a.id}">${c}</button><div style="text-align:center" class="sm">${t('ہدف|Target')}: ${a.n}</div>${bar(c/a.n*100)}<div style="text-align:center"><button class="btn o" data-rst="${a.id}">${ic('reset',18)}${t('صفر|Reset')}</button></div>`;
  h+='</div>';});
 if(editAd)h+=`<div class="card"><h3>${ic('plus')}${t('نیا ذکر|New dhikr')}</h3><textarea id="nar" placeholder="${t('ذکر کا متن|Dhikr text')}"></textarea><input type="number" id="nn" placeholder="${t('ہدف|Target')}" value="33"><button class="btn" id="nadd">${t('شامل کریں|Add')}</button><button class="btn o" id="nrs">${t('ڈیفالٹ بحال|Restore defaults')}</button></div>`;
 return h;},
duas(){const cs=[...new Set(D.duas.map(x=>x.c))];let h=`<div class="chips"><button class="chip ${duaCat?'':'on'}" data-dc="">${t('سب|All')}</button>${cs.map(c=>`<button class="chip ${duaCat===c?'on':''}" data-dc="${esc(c)}">${t(c)}</button>`).join('')}</div>`;
 D.duas.filter(x=>!duaCat||x.c===duaCat).forEach(x=>{h+=`<div class="card"><div class="sm">${t(x.c)}</div><div class="ar">${esc(x.ar)}</div><div>${esc(S.lang==='ur'?x.ur:x.en)}</div><div class="sm">${esc(x.ref)}</div></div>`;});
 return h+`<p class="sm">${t('حوالہ جات کسی عالم سے تصدیق کروا لیں۔|Please verify references with a scholar.')}</p>`;},
qibla(){const c=D.cities[S.city]||(S.gps?[S.gps.lat,S.gps.lng,'GPS']:D.cities.Lahore),q=qb(c[0],c[1]);
 return `<div class="card"><h3>${ic('qibla')}${t('سمتِ قبلہ|Qibla direction')}</h3><select id="cty">${Object.keys(D.cities).map(k=>`<option value="${k}" ${S.city===k?'selected':''}>${D.cities[k][2]} / ${k}</option>`).join('')}</select><div style="text-align:center"><button class="btn o" id="gps">${ic('gps',18)}${t('میرا مقام (GPS)|Use my location')}</button></div>
 <svg class="compass" viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" fill="var(--card)" stroke="var(--p)" stroke-width="4"/><circle cx="100" cy="100" r="80" fill="none" stroke="var(--a)" stroke-width="1.5"/><text x="100" y="26" text-anchor="middle" font-size="14" fill="var(--tx)">N</text><g id="needle" style="transform-origin:100px 100px;transform:rotate(${q}deg)"><path d="M100 28L110 100H90z" fill="var(--p)"/><rect x="92" y="14" width="16" height="16" rx="2" fill="var(--a)"/><circle cx="100" cy="100" r="7" fill="var(--p2)"/></g></svg>
 <div style="text-align:center"><b style="font-size:24px">${q.toFixed(1)}°</b><div class="sm">${t('شمال سے گھڑی کی سمت میں|clockwise from true North')}</div><button class="btn" id="cmp">${t('کمپاس چلائیں|Start compass')}</button><div class="sm" id="cst"></div></div><p class="sm">${t('کمپاس کے لیے فون کو سیدھا رکھیں اور 8 کی شکل میں گھمائیں۔ احتیاطاً کسی معتبر کمپاس سے بھی تصدیق کریں۔|Hold the phone flat and move it in a figure 8. Cross-check with a trusted compass.')}</p></div>`;},
more(){return `<div class="grid">`+MORE.filter(m=>m[0]!=='theme'||TH.allowUserThemePicker).map(m=>`<button class="tile" data-go="${m[0]}">${ic(m[1],32)}<div>${t(m[2])}</div></button>`).join('')+'</div>';},
muh(){const d=day(cur);let h=dateBar()+'<div class="card">';
 D.muhQ.forEach(([ty,q],i)=>{const k='q'+(i+1),x=d.mu[k]||{};
  if(ty==='y')h+=`<div class="row"><span style="flex:1">${i+1}. ${t(q)}</span>${yn('mu',k,'v',x.v)}</div>`;
  else h+=`<label>${i+1}. ${t(q)}<input type="${ty==='n'?'number':'text'}" data-g="mu" data-i="${k}" data-f="t" data-k="1" value="${esc(x.t)}"></label>`;});
 h+='</div><div class="card">'+[['ach','آج کی کامیابیاں|Achievements'],['sho','کوتاہیاں|Shortcomings'],['mis','غلطیاں|Mistakes'],['rep','توبہ|Repentance'],['gra','شکر|Gratitude'],['les','سیکھے اسباق|Lessons'],['tom','کل کے اہداف|Tomorrow goals']].map(([k,l])=>`<label>${t(l)}<textarea data-g="mu" data-i="${k}" data-f="t" data-k="1">${esc((d.mu[k]||{}).t)}</textarea></label>`).join('')+'</div>';
 h+=`<div class="card"><h3>${ic('check')}${t('نیک اعمال|Good deeds')}</h3>`+[...D.checks,...S.cc].map((c,i)=>`<div class="row"><span style="flex:1">${t(c)}</span>${yn('ck','c'+i,'v',(d.ck['c'+i]||{}).v)}</div>`).join('')+`<input type="text" id="cc" placeholder="${t('اپنا عمل|Custom deed')}"><button class="btn" id="ccadd">${t('شامل کریں|Add')}</button></div>`;return h;},
notes(){const d=day(cur);return dateBar()+`<div class="card"><h3>${ic('notes')}${t('نوٹ|Note')}</h3><textarea id="nt"></textarea><button class="btn" id="nadd">${t('شامل کریں|Add')}</button><input type="text" id="ns" placeholder="${t('تلاش|Search')}"><div id="nl"></div></div><div class="card"><h3>${t('روزہ|Fasting')}</h3><select data-g="fast" data-i="x" data-f="t" data-k="1"><option></option>${[['Ramadan','رمضان|Ramadan'],['Mon','پیر|Monday'],['Thu','جمعرات|Thursday'],['Beed','ایام بیض|Ayyam-e-Beed'],['Shawwal','شوال|Shawwal'],['Nafl','نفلی|Nafl'],['Qaza','قضا|Qaza']].map(o=>`<option value="${o[0]}" ${(d.fast&&d.fast.t)===o[0]?'selected':''}>${t(o[1])}</option>`).join('')}</select></div>`;},
reports(){return `<div class="card"><button class="btn" data-rep="week">${t('ہفتہ|Week')}</button><button class="btn" data-rep="month">${t('مہینہ|Month')}</button><button class="btn" data-rep="year">${t('سال|Year')}</button><div id="rp"></div></div><div class="card"><button class="btn" id="bcsv">CSV</button><button class="btn" id="bjson">${t('بیک اپ|Backup')}</button><label class="btn g" style="margin:3px">${t('بحالی|Restore')}<input type="file" id="rf" accept=".json" hidden></label><button class="btn o" onclick="window.print()">PDF</button></div>`;},
theme(){return `<div class="card"><h3>${ic('theme')}${t('رنگ/تھیم|Theme')}</h3>`+Object.keys(TH.themes).map(k=>`<button class="sw ${S.theme===k?'on':''}" data-th="${k}" style="background:${TH.themes[k].p}" aria-label="${k}"></button>`).join('')+`</div><div class="card"><label>${t('ہجری تاریخ ایڈجسٹ (دن)|Hijri adjustment (days)')}<input type="number" id="hadj" min="-2" max="2" value="${S.hijri}"></label><p class="sm">${t('ہجری تاریخ حسابی (ام القریٰ) ہے، سرکاری رویت ہلال کا اعلان نہیں؛ مقامی رویت کے مطابق ±1 دن ایڈجسٹ کریں۔|Hijri date is calculated (Umm al-Qura), not an official moon-sighting announcement; adjust ±1 day for local sighting.')}</p><label>${t('روزانہ تلاوت کا ہدف|Daily Quran goal')}<input type="number" id="goal" value="${S.goal}"></label></div>`;}
};
function qb(la,lo){const r=Math.PI/180,kl=21.4225*r,kg=39.8262*r,p=la*r,dl=kg-lo*r;return (Math.atan2(Math.sin(dl)*Math.cos(kl),Math.cos(p)*Math.sin(kl)-Math.sin(p)*Math.cos(kl)*Math.cos(dl))/r+360)%360;}
function range(kind){const d=new Date(cur+'T12:00:00');let a,b;if(kind==='week'){const s=new Date(d);s.setDate(d.getDate()-d.getDay());const e=new Date(s);e.setDate(s.getDate()+6);a=ymd(s);b=ymd(e);}else if(kind==='month'){a=cur.slice(0,7)+'-01';b=cur.slice(0,7)+'-31';}else{a=cur.slice(0,4)+'-01-01';b=cur.slice(0,4)+'-12-31';}return [a,b];}
function report(kind){const [a,b]=range(kind);const ks=Object.keys(S.days).filter(k=>k>=a&&k<=b).sort();let f=0,j=0,nf=0,td=0,ad=0,mu=0;const q={};
 ks.forEach(k=>{const x=day(k);f+=farz(k);j+=jam(k);nf+=NF.filter(n=>x.n[n[0]]&&x.n[n[0]].done).length;if(x.tl.done===true){td++;const u=x.tl.unit||'page';q[u]=(q[u]||0)+(+x.tl.qty||0);}Object.values(x.ad).forEach(v=>ad+=v);if(Object.keys(x.mu).length)mu++;});
 const row=(l,v)=>`<tr><td>${t(l)}</td><td>${v}</td></tr>`;let chart='';
 if(kind==='week'){const s=new Date(a+'T12:00:00');let bars='';for(let i=0;i<7;i++){const e=new Date(s);e.setDate(s.getDate()+i);const v=S.days[ymd(e)]?farz(ymd(e)):0;bars+=`<rect x="${10+i*40}" y="${80-v*14}" width="26" height="${v*14}" rx="5" fill="var(--p)"/><text x="${23+i*40}" y="95" text-anchor="middle" font-size="10" fill="var(--mu)">${e.getDate()}</text>`;}chart=`<svg viewBox="0 0 290 100" width="100%">${bars}</svg>`;}
 return `<h3>${a} → ${b}</h3>${chart}<table>${row('فرض نمازیں ادا|Prayers performed',f)}${row('جماعت سے|In congregation',j)}${row('نفل|Nafl',nf)}${row('تلاوت کے دن|Tilawat days',td)}${row('تلاوت کی مقدار|Tilawat amount',UNITS.map(u=>q[u[0]]?q[u[0]]+' '+t(u[1]):'').filter(Boolean).join(' · ')||0)}${row('اذکار کی گنتی|Dhikr count',ad)}${row('محاسبہ کے دن|Muhasabah days',mu)}</table>`;}
function validBackup(o){if(!o||typeof o!=='object'||Array.isArray(o)||!o.days||typeof o.days!=='object'||Array.isArray(o.days))return false;return Object.keys(o.days).every(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&o.days[k]&&typeof o.days[k]==='object');}
function dl(n,x,ty){const u=URL.createObjectURL(new Blob([x],{type:ty})),a=document.createElement('a');a.href=u;a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(u),3000);}
function setv(g,i,f,v){const d=day(cur);if(g==='tl'){d.tl[f]=f==='qty'?Math.max(0,+v||0):v;save();return;}const o=d[g]&&typeof d[g]==='object'?d[g]:(d[g]={});const x=o[i]||(o[i]={});x[f]=v;save();}
function renderNotes(){const q=($('#ns')||{}).value||'';$('#nl').innerHTML=S.notes.filter(n=>n.date===cur&&(!q||n.text.includes(q))).map(n=>`<div class="row"><span>${esc(n.text)}</span><button class="btn o" data-nd="${n.id}">${ic('trash',16)}</button></div>`).join('');}
function bind(){const a=$('#app'),dp=$('#dp');if(dp)dp.onchange=()=>{cur=dp.value||cur;follow=(cur===today);render();};
 a.querySelectorAll('[data-dn]').forEach(e=>e.onclick=()=>{const n=+e.dataset.dn;cur=n===0?today:shift(n);follow=(cur===today);render();});
 a.querySelectorAll('.yn').forEach(e=>e.onclick=ev=>{const b=ev.target.closest('button');if(!b)return;const v=b.dataset.v==='1';setv(e.dataset.g,e.dataset.i,e.dataset.f,v);if(e.dataset.f==='done'&&!v&&e.dataset.g==='p')setv('p',e.dataset.i,'jam',false);const y=scrollY;render();scrollTo(0,y);});
 a.querySelectorAll('[data-k]').forEach(e=>e.onchange=()=>{if(e.dataset.g==='fast'){const d=day(cur);d.fast={t:e.value};save();return;}setv(e.dataset.g,e.dataset.i,e.dataset.f,e.value);});
 a.querySelectorAll('[data-inc]').forEach(e=>e.onclick=()=>{const d=day(cur);d.ad[e.dataset.inc]=(d.ad[e.dataset.inc]||0)+1;save();try{navigator.vibrate&&navigator.vibrate(12);}catch(_){}e.textContent=d.ad[e.dataset.inc];});
 a.querySelectorAll('[data-rst]').forEach(e=>e.onclick=()=>{day(cur).ad[e.dataset.rst]=0;save();render();});
 a.querySelectorAll('[data-ad]').forEach(e=>e.onchange=()=>{const x=S.adhkar.find(z=>z.id===e.dataset.ad);if(x){x[e.dataset.f]=e.dataset.f==='n'?Math.max(1,+e.value||1):e.value;save();}});
 a.querySelectorAll('[data-del]').forEach(e=>e.onclick=()=>{if(confirm(t('حذف کریں؟|Delete?'))){S.adhkar=S.adhkar.filter(z=>z.id!==e.dataset.del);save();render();}});
 const ae=$('#aed');if(ae)ae.onclick=()=>{editAd=!editAd;render();};
 const na=$('#nadd');if(na&&$('#nar'))na.onclick=()=>{const v=$('#nar').value.trim();if(v){S.adhkar.push({id:'u'+Date.now(),cat:'میرے اذکار|My dhikr',ar:v,ur:'',en:'',ref:'',n:+$('#nn').value||33});save();render();}};
 const nr=$('#nrs');if(nr)nr.onclick=()=>{if(confirm(t('ڈیفالٹ اذکار بحال کریں؟ آپ کی تبدیلیاں مٹ جائیں گی۔|Restore defaults? Your edits will be lost.'))){S.adhkar=D.adhkar.map(x=>Object.assign({},x));save();render();}};
 a.querySelectorAll('[data-dc]').forEach(e=>e.onclick=()=>{duaCat=e.dataset.dc;render();});
 a.querySelectorAll('[data-go]').forEach(e=>e.onclick=()=>{view=e.dataset.go;render();});
 a.querySelectorAll('[data-th]').forEach(e=>e.onclick=()=>{S.theme=e.dataset.th;save();render();});
 const hj=$('#hadj');if(hj)hj.onchange=()=>{S.hijri=Math.max(-2,Math.min(2,Math.round(+hj.value||0)));save();render();};const gl=$('#goal');if(gl)gl.onchange=()=>{S.goal=+gl.value||1;save();};
 const ct=$('#cty');if(ct)ct.onchange=()=>{S.city=ct.value;save();render();};
 const gp=$('#gps');if(gp)gp.onclick=()=>{if(!navigator.geolocation){alert('GPS N/A');return;}navigator.geolocation.getCurrentPosition(p=>{S.gps={lat:p.coords.latitude,lng:p.coords.longitude};S.city='GPS';save();render();},()=>alert(t('مقام نہیں ملا؛ شہر خود چنیں۔|Location unavailable; choose a city.')),{timeout:15000});};
 const cm=$('#cmp');if(cm)cm.onclick=startC;
 const cc=$('#ccadd');if(cc)cc.onclick=()=>{const v=$('#cc').value.trim();if(v){S.cc.push(v+'|'+v);save();render();}};
 if($('#nl')&&$('#nt')){renderNotes();$('#ns').oninput=renderNotes;$('#nadd').onclick=()=>{const v=$('#nt').value.trim();if(v){S.notes.push({id:Date.now(),date:cur,text:v});save();render();}};$('#nl').onclick=e=>{const b=e.target.closest('[data-nd]');if(b&&confirm(t('حذف کریں؟|Delete?'))){S.notes=S.notes.filter(n=>n.id!=b.dataset.nd);save();renderNotes();}};}
 a.querySelectorAll('[data-rep]').forEach(e=>e.onclick=()=>{$('#rp').innerHTML=report(e.dataset.rep);});
 const bc=$('#bcsv');if(bc){bc.onclick=()=>{const r=['date,prayer,performed,jamaah'];Object.keys(S.days).sort().forEach(k=>PR.forEach(p=>{const x=day(k).p[p[0]];if(x&&x.done!==undefined)r.push([k,p[0],+(x.done===true),+(x.jam===true)].join(','));}));dl('diary.csv','\ufeff'+r.join('\n'),'text/csv');};
  $('#bjson').onclick=()=>dl('diary-backup.json',JSON.stringify(S),'application/json');
  $('#rf').onchange=e=>{const f=e.target.files[0];if(f)f.text().then(x=>{try{const o=JSON.parse(x);if(!validBackup(o))throw 0;if(confirm(t('موجودہ ڈیٹا بدل دیں؟ (پہلے محفوظ کاپی بنے گی)|Replace current data? (a safety copy is kept first)'))){try{localStorage.setItem(K+'_before_restore',JSON.stringify(S));}catch(_){}S=migrate(Object.assign({},o));save();S=load();render();}}catch(_){alert(t('بیک اپ فائل درست نہیں؛ ڈیٹا نہیں بدلا۔|Invalid backup file; nothing was changed.'));}});};}}
function startC(){const st=$('#cst'),n=$('#needle');if(!n)return;const c=D.cities[S.city]||(S.gps?[S.gps.lat,S.gps.lng]:D.cities.Lahore),q=qb(c[0],c[1]);let got=false;
 const h=e=>{let hd=null;if(e.webkitCompassHeading!=null)hd=e.webkitCompassHeading;else if(e.alpha!=null&&(e.absolute||e.type==='deviceorientationabsolute'))hd=(360-e.alpha)%360;if(hd==null)return;got=true;n.style.transform='rotate('+(q-hd)+'deg)';st.textContent='';};
 const go=()=>{window.addEventListener('deviceorientationabsolute',h,true);window.addEventListener('deviceorientation',h,true);st.textContent=t('اگر سوئی نہ ہلے تو فون کمپاس سپورٹ نہیں کرتا؛ اوپر دیے گئے زاویے سے سمت لیں۔|If the needle does not move, use the angle above.');};
 stopC=()=>{window.removeEventListener('deviceorientationabsolute',h,true);window.removeEventListener('deviceorientation',h,true);};
 if(window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission)DeviceOrientationEvent.requestPermission().then(r=>{if(r==='granted')go();}).catch(()=>{});else go();}
function render(){if(stopC){stopC();stopC=null;}document.documentElement.lang=S.lang;document.documentElement.dir=S.lang==='ur'?'rtl':'ltr';theme();
 $('#title').textContent=S.lang==='ur'?TH.nameUr:TH.nameEn;$('#lang').textContent=S.lang==='ur'?'EN':'اردو';$('#date').textContent=wk(cur)+' · '+new Date(cur+'T12:00:00').toDateString()+' · '+hijri(cur)+(S.hijri?' ('+(S.hijri>0?'+':'')+S.hijri+')':'');
 const sub=['muh','notes','reports','theme'].includes(view);
 $('#nav').innerHTML=TH.tabs.map(k=>`<button data-v="${k}" class="${(k===view||(k==='more'&&sub))?'on':''}">${ic(NAVI[k][0],23)}<span>${t(NAVI[k][1])}</span></button>`).join('');
 $('#nav').querySelectorAll('button').forEach(b=>b.onclick=()=>{view=b.dataset.v;render();scrollTo(0,0);});
 $('#app').innerHTML=(sub?`<button class="btn o" data-go="more">‹ ${t('واپس|Back')}</button>`:'')+V[view]();bind();}
$('#lang').onclick=()=>{S.lang=S.lang==='ur'?'en':'ur';save();render();};
render();
setInterval(tick,20000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});window.addEventListener('focus',tick);window.addEventListener('resume',tick);
window.__IDD__={S:()=>S,setv:(g,i,f,v)=>setv(g,i,f,v),day,tick,setCur:d=>{cur=d;follow=(d===today);},cur:()=>cur,today:()=>today,migrate,load,valid:validBackup};})();
