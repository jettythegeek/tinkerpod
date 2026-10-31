const IC={
coin:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#E89A00"/><circle cx="12" cy="11" r="10" fill="#FFC21A"/><circle cx="12" cy="11" r="7" fill="#FFD95A"/><path d="M12 6.8l1.4 2.9 3.1.4-2.3 2.1.6 3.1-2.8-1.5-2.8 1.5.6-3.1-2.3-2.1 3.1-.4z" fill="#E89A00"/></svg>`,
gem:`<svg viewBox="0 0 24 24"><path d="M6 3h12l5 6-11 13L1 9z" fill="#3B82F6"/><path d="M6 3h12l5 6H1z" fill="#60A5FA"/><path d="M8.5 9L12 22 15.5 9z" fill="#93C5FD" opacity=".8"/><path d="M6 3l2.5 6L12 3l3.5 6L18 3" fill="none" stroke="#DBEAFE" stroke-width=".8"/></svg>`,
flame:`<svg viewBox="0 0 24 24"><path d="M12 1c1 4 6 6.5 6 12.5A6 6 0 0 1 6 13.5c0-3 1.5-4.5 3-6 0 2 1 3 2 3 0-3-1-6 1-9.5z" fill="#FF6B35"/><path d="M12 10c.6 2.2 3.4 3.4 3.4 6.4a3.4 3.4 0 0 1-6.8 0c0-1.8 1-2.8 1.8-3.6.2 1 .8 1.5 1.3 1.5 0-1.5-.3-2.8.3-4.3z" fill="#FFC21A"/></svg>`,
flameoff:`<svg viewBox="0 0 24 24"><path d="M12 1c1 4 6 6.5 6 12.5A6 6 0 0 1 6 13.5c0-3 1.5-4.5 3-6 0 2 1 3 2 3 0-3-1-6 1-9.5z" fill="#CBD5E1"/><path d="M12 10c.6 2.2 3.4 3.4 3.4 6.4a3.4 3.4 0 0 1-6.8 0c0-1.8 1-2.8 1.8-3.6.2 1 .8 1.5 1.3 1.5 0-1.5-.3-2.8.3-4.3z" fill="#E2E8F0"/></svg>`,
xp:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#7C3AED"/><path d="M13.5 3.5L6.5 13h5l-1 7.5 7-9.5h-5z" fill="#FFD95A"/></svg>`,
trophy:`<svg viewBox="0 0 24 24"><path d="M6 3h12v5a6 6 0 0 1-12 0z" fill="#FFC21A"/><path d="M6 5H3v2a4 4 0 0 0 4 4M18 5h3v2a4 4 0 0 1-4 4" fill="none" stroke="#E89A00" stroke-width="2"/><rect x="10.5" y="13" width="3" height="4" fill="#E89A00"/><rect x="7" y="17" width="10" height="4" rx="1.5" fill="#B45309"/><path d="M9 5.5v3" stroke="#FFF3C4" stroke-width="1.6" stroke-linecap="round"/></svg>`,
lock:`<svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="12" rx="3" fill="#94A3B8"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#94A3B8" stroke-width="2.6"/><circle cx="12" cy="16" r="1.8" fill="#E2E8F0"/></svg>`,
check:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#63C132"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
star:`<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 16.8 6.1 20.1l1.3-6.6L2.5 8.9l6.6-.8z" fill="#FFB700" stroke="#E89A00" stroke-width="1" stroke-linejoin="round"/></svg>`,
staroff:`<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 16.8 6.1 20.1l1.3-6.6L2.5 8.9l6.6-.8z" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1" stroke-linejoin="round"/></svg>`,
};
function statusbar(light){return `<div class="statusbar ${light?'light':''}"><span>9:41</span><span style="display:flex;gap:6px;align-items:center"><svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.5c2.3 0 4.4.9 6 2.4l1.3-1.4A10.5 10.5 0 0 0 8 .6 10.5 10.5 0 0 0 .7 3.5L2 4.9a8.6 8.6 0 0 1 6-2.4zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.3-1.4A6.9 6.9 0 0 0 8 4.2c-1.8 0-3.4.7-4.7 1.8l1.3 1.4c.9-.8 2.1-1.3 3.4-1.3zM8 9.6l2-2a2.8 2.8 0 0 0-4 0z"/></svg><svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor"/><rect x="24.5" y="4.5" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".4"/></svg></span></div>`}
function nav(active){const it=[['home','house','Home'],['map','map','Journey'],['missions','target','Missions'],['league','trophy','League'],['me','smile','Me']];
 return `<nav class="nav">${it.map(([k,i,l])=>`<a class="${k===active?'on':''}"><i data-lucide="${i}"></i><span>${l}</span></a>`).join('')}</nav><div class="homebar"></div>`}
function tpInit(){
 document.querySelectorAll('[data-side]').forEach(e=>{const [k,a]=e.dataset.side.split(':');e.outerHTML=sidebar(k,a)});
 tpEmb();
 document.querySelectorAll('[data-top]').forEach(e=>e.outerHTML=topbar(e.dataset.top));
 document.querySelectorAll('[data-ic]').forEach(e=>{e.classList.add('ic');e.innerHTML=IC[e.dataset.ic];const s=e.dataset.s||20;e.style.width=s+'px';e.style.height=s+'px'});
 document.querySelectorAll('[data-statusbar]').forEach(e=>e.outerHTML=statusbar(e.dataset.statusbar==='light'));
 document.querySelectorAll('[data-nav]').forEach(e=>e.outerHTML=nav(e.dataset.nav));
 if(window.lucide) lucide.createIcons();
 document.fonts.ready.then(()=>document.body.setAttribute('data-ready','1'));
}
const ADMIN_NAV=[['Overview',[['overview','layout-dashboard','Dashboard']]],
 ['Learning',[['packs','package','Content packs','12','t'],['tournaments','trophy','Tournaments'],['reviews','clipboard-check','Project reviews','18']]],
 ['People',[['children','baby','Children & parents'],['pods','users-round','Pods & mentors']]],
 ['Money',[['billing','credit-card','Billing']]],
 ['System',[['settings','settings','Settings']]]];
const MENTOR_NAV=[['Teach',[['home','layout-dashboard','Today'],['pods','users-round','My pods'],['classes','video','Live classes']]],
 ['Review',[['reviews','clipboard-check','Review queue','7'],['progress','line-chart','Child progress'],['attendance','calendar-check','Attendance']]],
 ['Me',[['messages','message-circle','Messages','2'],['settings','settings','Settings']]]];
function sidebar(kind,active){const light=kind==='mentor';const N=light?MENTOR_NAV:ADMIN_NAV;
 let h=`<aside class="side ${light?'light':''}"><div class="brand"><img src="../assets/${light?'logo.png':'logo.png'}" style="${light?'':'filter:brightness(0) invert(1)'}"><span class="st nodot ${light?'t':'p'}" style="margin-left:auto;${light?'':'background:rgba(255,255,255,.12);color:#fff'}">${light?'Mentor':'Admin'}</span></div>`;
 N.forEach(([g,it])=>{h+=`<div class="grp">${g}</div>`;it.forEach(([k,i,l,n,t])=>h+=`<a class="${k===active?'on':''}"><i data-lucide="${i}"></i>${l}${n?`<span class="n ${t||''}">${n}</span>`:''}</a>`)});
 h+= light?`<div class="me"><img src="../assets/av5.png" class="mini-av" style="width:34px;height:34px"><div style="line-height:1.2"><div style="font-weight:900;color:#0F172A">Mr. Femi A.</div><div style="font-size:12px;font-weight:700;color:#64748B">Mentor · 3 pods</div></div><i data-lucide="chevrons-up-down" style="margin-left:auto;width:16px"></i></div>`
 :`<div class="me"><div style="width:34px;height:34px;border-radius:99px;background:#7C3AED;color:#fff;font-weight:900;display:flex;align-items:center;justify-content:center">EX</div><div style="line-height:1.2"><div style="font-weight:900;color:#fff">Admin user</div><div style="font-size:12px;font-weight:700;color:#8F9BC6">Super admin</div></div><i data-lucide="chevrons-up-down" style="margin-left:auto;width:16px"></i></div>`;
 return h+'</aside>'}
function topbar(kind){return `<header class="topbar"><div class="search"><i data-lucide="search"></i>Search children, packs, pods…<span style="margin-left:auto;font-size:11px;font-weight:900;background:#fff;border-radius:5px;padding:1px 6px;box-shadow:0 0 0 1px #E2E8F0">⌘K</span></div><div style="flex:1"></div>
 ${kind==='mentor'?'<span class="st t">Next class in 25 min</span>':'<span class="st s nodot">Environment: <b style="margin-left:3px;color:#0F172A">Sample data</b></span>'}
 <div style="position:relative"><i data-lucide="bell" style="width:20px;color:#475569"></i><i style="position:absolute;top:-2px;right:-2px;width:8px;height:8px;border-radius:9px;background:#FF6B6B"></i></div>
 <i data-lucide="circle-help" style="width:20px;color:#475569"></i></header>`}
const EMB={
league:`<svg viewBox="0 0 64 72"><path d="M32 2l28 10v22c0 18-12 30-28 36C16 64 4 52 4 34V12z" fill="#5B21B6"/><path d="M32 7l23 8v19c0 15-10 25-23 30C19 59 9 49 9 34V15z" fill="#7C3AED"/><path d="M32 18l4.3 8.8 9.7 1.4-7 6.8 1.6 9.6L32 40.1l-8.6 4.5 1.6-9.6-7-6.8 9.7-1.4z" fill="#FFC21A"/><rect x="18" y="50" width="28" height="6" rx="3" fill="#A78BFA"/></svg>`,
ucl:`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#101B4D"/><circle cx="32" cy="32" r="24" fill="none" stroke="#3B4C8F" stroke-width="2"/>${[...Array(8)].map((_,i)=>{const a=i/8*Math.PI*2-Math.PI/2,x=32+24*Math.cos(a),y=32+24*Math.sin(a);return `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(.32)" d="M0 -12l3.5 7.3 8 1.1-5.8 5.6 1.4 8L0 6.2-7.1 10l1.4-8-5.8-5.6 8-1.1z" fill="#fff"/>`}).join('')}<circle cx="32" cy="32" r="13" fill="#00BFAE"/><path d="M32 23.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="#FFD95A"/></svg>`,
cup:`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#00A396"/><circle cx="32" cy="32" r="30" fill="url(#cg)" opacity=".0"/><path d="M20 14h24v10c0 7-5 13-12 13s-12-6-12-13z" fill="#FFC21A"/><path d="M20 17h-6v3a7 7 0 0 0 7 7M44 17h6v3a7 7 0 0 1-7 7" fill="none" stroke="#FFE08A" stroke-width="3"/><rect x="29" y="37" width="6" height="7" fill="#E89A00"/><rect x="22" y="44" width="20" height="7" rx="2.5" fill="#B45309"/><path d="M25 18v6" stroke="#FFF3C4" stroke-width="3" stroke-linecap="round"/></svg>`,
wc:`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#2563EB"/><circle cx="32" cy="32" r="21" fill="#60A5FA"/><path d="M18 26c6 2 8-4 13-2s3 8 9 7 6-5 6-5M14 38c6-1 9 4 15 2s9-6 15-4" fill="none" stroke="#2563EB" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="32" rx="9" ry="21" fill="none" stroke="#DBEAFE" stroke-width="1.6"/><path d="M11 32h42" stroke="#DBEAFE" stroke-width="1.6"/><circle cx="48" cy="14" r="9" fill="#FFB700"/><path d="M48 9l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#fff"/></svg>`};
function tpEmb(){document.querySelectorAll('[data-emb]').forEach(e=>{e.innerHTML=EMB[e.dataset.emb];e.style.width=(e.dataset.s||56)+'px';e.style.display='inline-block';e.style.flex='none';e.querySelector('svg').style.width='100%';e.querySelector('svg').style.height='auto'})}
/* ---- v2 additions (Learn/Compete set, screens 33+). Additive only: older screens keep data-nav. ---- */
// Founder decision Oct 2026: kid bottom nav = Home, Learn, Build, Rewards, Me
function kidnav(active){const it=[['home','house','Home'],['learn','book-open','Learn'],['build','hammer','Build'],['rewards','trophy','Rewards'],['me','smile','Me']];
 return `<nav class="nav">${it.map(([k,i,l])=>`<a class="${k===active?'on':''}"><i data-lucide="${i}"></i><span>${l}</span></a>`).join('')}</nav><div class="homebar"></div>`}
// Pods are tracks. Colour + Lucide icon per pod.
const PODS={coding:['Coding','code-xml','#7C3AED','#F3EEFF'],ai:['AI','brain-circuit','#2563EB','#EAF1FF'],design:['Design','palette','#FF6B6B','#FFEDED'],robotics:['Robotics','bot','#007A70','#E6F9F7'],founder:['Founder','rocket','#B45309','#FFF6DB']};
// Pod switcher chip, only rendered when a kid has 2+ pods. data-podchip="coding,design"
function podchip(list){const p=list.split(',');const a=PODS[p[0]];
 return `<span class="podchip"><span class="pi" style="background:${a[2]}"><i data-lucide="${a[1]}"></i></span><b>${a[0]} Pod</b>${p.slice(1).map(k=>`<span class="pi sm" style="background:${PODS[k][2]}"><i data-lucide="${PODS[k][1]}"></i></span>`).join('')}<i data-lucide="chevrons-up-down" class="cv"></i></span>`}
function podicon(k,s){const a=PODS[k];s=s||40;return `<span style="width:${s}px;height:${s}px;border-radius:${Math.round(s*.32)}px;background:${a[3]};color:${a[2]};display:inline-flex;align-items:center;justify-content:center;flex:none"><i data-lucide="${a[1]}" style="width:${Math.round(s*.5)}px;height:${Math.round(s*.5)}px"></i></span>`}
(function(){const o=tpInit;tpInit=function(){
 document.querySelectorAll('[data-kidnav]').forEach(e=>e.outerHTML=kidnav(e.dataset.kidnav));
 document.querySelectorAll('[data-podchip]').forEach(e=>e.outerHTML=podchip(e.dataset.podchip));
 document.querySelectorAll('[data-podicon]').forEach(e=>{const [k,s]=e.dataset.podicon.split(':');e.outerHTML=podicon(k,+s||40)});
 o();}})();
