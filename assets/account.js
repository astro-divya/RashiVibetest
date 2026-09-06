(()=>{
'use strict';
const PROFILE_KEY='rvProfilesV1',ACTIVE_KEY='rvActiveProfileId',SESSION_KEY='rvAccountSession';
const $=id=>document.getElementById(id);
const safeJSON=(s,f)=>{try{return JSON.parse(s)}catch(e){return f}};
const now=()=>new Date().toISOString();
function uid(){return 'p_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)}
function clean(p={}){return {
 id:String(p.id||uid()),name:String(p.name||'').trim(),place:String(p.place||'').trim(),
 d:String(p.d||''),m:String(p.m||''),y:String(p.y||''),h:String(p.h||''),min:String(p.min||''),ap:String(p.ap||'AM'),
 lat:String(p.lat||''),lon:String(p.lon||''),tz:String(p.tz||'5.5'),phone:String(p.phone||''),
 moonSign:(p.moonSign!==null&&p.moonSign!==undefined&&p.moonSign!==''&&Number.isInteger(+p.moonSign))?+p.moonSign:null,nakshatra:(p.nakshatra!==null&&p.nakshatra!==undefined&&p.nakshatra!==''&&Number.isInteger(+p.nakshatra))?+p.nakshatra:null,
 ascSign:(p.ascSign!==null&&p.ascSign!==undefined&&p.ascSign!==''&&Number.isInteger(+p.ascSign))?+p.ascSign:null,nameRashi:(p.nameRashi!==null&&p.nameRashi!==undefined&&p.nameRashi!==''&&Number.isInteger(+p.nameRashi))?+p.nameRashi:null,
 whatsappDaily:!!p.whatsappDaily,updatedAt:p.updatedAt||now()
}}
function getProfiles(){const a=safeJSON(localStorage.getItem(PROFILE_KEY),[]);return Array.isArray(a)?a.map(clean):[]}
function setProfiles(a){localStorage.setItem(PROFILE_KEY,JSON.stringify(a.map(clean)))}
function getActiveId(){return localStorage.getItem(ACTIVE_KEY)||''}
function getActiveProfile(){const a=getProfiles(),id=getActiveId();return a.find(p=>p.id===id)||a[0]||null}
function legacyFrom(p){if(!p)return;localStorage.setItem('rvKundliProfile',JSON.stringify({name:p.name,place:p.place,d:p.d,m:p.m,y:p.y,h:p.h,min:p.min,ap:p.ap,lat:p.lat,lon:p.lon,tz:p.tz}))}
function setActiveProfile(id){const p=getProfiles().find(x=>x.id===id);if(!p)return null;localStorage.setItem(ACTIVE_KEY,p.id);legacyFrom(p);document.dispatchEvent(new CustomEvent('rv-profile-change',{detail:{profile:p}}));updateHeader();return p}
function saveProfile(p,makeActive=true){p=clean(p);let a=getProfiles();const i=a.findIndex(x=>x.id===p.id);if(i>=0)a[i]={...a[i],...p,updatedAt:now()};else a.push({...p,updatedAt:now()});setProfiles(a);if(makeActive)setActiveProfile(p.id);return p}
function deleteProfile(id){let a=getProfiles().filter(p=>p.id!==id);setProfiles(a);if(getActiveId()===id){if(a[0])setActiveProfile(a[0].id);else localStorage.removeItem(ACTIVE_KEY)}updateHeader()}
function getSession(){return safeJSON(localStorage.getItem(SESSION_KEY),null)}
function setSession(s){s?localStorage.setItem(SESSION_KEY,JSON.stringify(s)):localStorage.removeItem(SESSION_KEY);updateHeader()}
function val(id,v){const e=$(id);if(e&&v!==undefined&&v!==null&&String(v)!=='')e.value=v}
function to24(h,ap){h=+h||0;if(ap==='PM'&&h<12)h+=12;if(ap==='AM'&&h===12)h=0;return String(h).padStart(2,'0')}
function fill(prefix,p){if(!p)return;
 const map={Name:'name',Place:'place',D:'d',M:'m',Y:'y',H:'h',Min:'min',AP:'ap',Lat:'lat',Lon:'lon',Tz:'tz'};
 Object.entries(map).forEach(([s,k])=>val(prefix+s,p[k]));
 const d=$(prefix+'D');if(d)d.dispatchEvent(new Event('input',{bubbles:true}));
}
function read(prefix){const g=s=>$(prefix+s)?.value??'';return clean({name:g('Name'),place:g('Place'),d:g('D'),m:g('M'),y:g('Y'),h:g('H'),min:g('Min'),ap:g('AP'),lat:g('Lat'),lon:g('Lon'),tz:g('Tz')})}
function updateHeader(){const nav=document.querySelector('header .nav');if(!nav)return;let a=document.getElementById('rvProfilePill');if(!a){a=document.createElement('a');a.id='rvProfilePill';a.className='rv-profile-pill';a.href=(location.pathname.includes('/rashifal/')?'../':'')+'profile.html';const lang=document.getElementById('langBtn');nav.insertBefore(a,lang||nav.lastChild)}const p=getActiveProfile(),s=getSession();a.innerHTML=`<span class="rv-profile-dot">●</span><span>${p?.name|| (s?.verified?'मेरी प्रोफाइल':'लॉगिन')}</span>`;a.title=p?`${p.name} की प्रोफाइल`:'RashiVibe account'}
function fillPageFromActive(){const p=getActiveProfile();if(!p)return;
 if($('kName'))fill('k',p);
 if($('numName')){val('numName',p.name);val('numD',p.d);val('numM',p.m);val('numY',p.y)}
 if($('mbName')){val('mbName',p.name);val('mbD',p.d);val('mbM',p.m);val('mbY',p.y);val('mbPlace',p.place);val('mbLat',p.lat);val('mbLon',p.lon);val('mbTz',p.tz);if($('mbTime'))$('mbTime').value=`${to24(p.h,p.ap)}:${String(p.min||'0').padStart(2,'0')}`}
 if($('pPlace')){val('pPlace',p.place);val('pLat',p.lat);val('pLon',p.lon);val('pTz',p.tz)}
 if($('sadeSign') && p.moonSign!==null)$('sadeSign').value=String(p.moonSign);
 const rashiBtn=document.querySelector('.zodiac-card[data-sign=\"'+p.moonSign+'\"]');if(rashiBtn&&p.moonSign!==null)setTimeout(()=>rashiBtn.click(),0);
}
function populateMatchingSelectors(){const bs=$('bProfileSelect'),gs=$('gProfileSelect');if(!bs||!gs)return;const ps=getProfiles();const opts=['<option value="">— मैनुअल विवरण —</option>',...ps.map(p=>`<option value="${p.id}">${escapeHTML(p.name||'प्रोफाइल')}</option>`)].join('');bs.innerHTML=opts;gs.innerHTML=opts;const active=getActiveProfile();if(active){bs.value=active.id;fill('b',active)}const apply=(sel,prefix)=>sel.addEventListener('change',()=>{const q=getProfiles().find(x=>x.id===sel.value);if(q)fill(prefix,q)});apply(bs,'b');apply(gs,'g')}
function escapeHTML(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
async function cloudSaveProfile(p){try{if(!window.firebase?.apps?.length||!firebase.auth().currentUser||!firebase.firestore)return false;await firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('profiles').doc(p.id).set(p,{merge:true});return true}catch(e){console.warn('RashiVibe cloud save:',e);return false}}
async function cloudLoadProfiles(){try{if(!window.firebase?.apps?.length||!firebase.auth().currentUser||!firebase.firestore)return [];const snap=await firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('profiles').get();const remote=snap.docs.map(d=>clean({id:d.id,...d.data()}));if(remote.length){let a=getProfiles();for(const p of remote){const i=a.findIndex(x=>x.id===p.id);if(i>=0)a[i]=p;else a.push(p)}setProfiles(a);updateHeader()}return remote}catch(e){console.warn('RashiVibe cloud load:',e);return []}}
window.RVAccount={getProfiles,getActiveProfile,getActiveId,setActiveProfile,saveProfile,deleteProfile,getSession,setSession,fill,read,cloudSaveProfile,cloudLoadProfiles,clean};
document.addEventListener('DOMContentLoaded',()=>{updateHeader();fillPageFromActive();populateMatchingSelectors()});
})();
