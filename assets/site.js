(function(){
  const root=document.documentElement;
  const getLang=()=>localStorage.getItem('rashiVibeSiteLang')||localStorage.getItem('rashiVibeLang')||'hi';
  window.rvGetLang=getLang;
  window.rvSetLang=function(lang){
    localStorage.setItem('rashiVibeSiteLang',lang);
    localStorage.setItem('rashiVibeLang',lang);
    root.lang=lang;
    document.querySelectorAll('[data-hi][data-en]').forEach(el=>{
      el.textContent=el.dataset[lang]||el.textContent
    });
    document.querySelectorAll('[data-ph-hi][data-ph-en]').forEach(el=>{
      el.placeholder=el.dataset[lang==='hi'?'phHi':'phEn']||el.placeholder
    });
    document.querySelectorAll('.lang button').forEach(b=>b.classList.toggle('on',b.dataset.lang===lang));
    document.dispatchEvent(new CustomEvent('rv:language',{
      detail:{
        lang
      }
    }));
  };
  document.addEventListener('DOMContentLoaded',()=>{
    rvSetLang(getLang());
    const menu=document.querySelector('.menu-btn'),nav=document.querySelector('.site-nav');
    if(menu&&nav)menu.addEventListener('click',()=>nav.classList.toggle('open'));
    const io='IntersectionObserver'in window?new IntersectionObserver(es=>es.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible');
        io.unobserve(e.target)
      }
    }),{
      threshold:.10
    }):null;
    document.querySelectorAll('.reveal').forEach(el=>io?io.observe(el):el.classList.add('visible'));
    document.querySelectorAll('[data-location-autocomplete]').forEach(setupLocation);
    document.querySelectorAll('[data-year-4]').forEach(el=>el.addEventListener('input',()=>{
      el.value=el.value.replace(/\D/g,'').slice(0,4)
    }));
    injectTopbar();
    rvEnhancePickers();
  });
  function setupLocation(input){
    const box=document.getElementById(input.dataset.suggestions),status=document.getElementById(input.dataset.status),lat=document.getElementById(input.dataset.lat),lon=document.getElementById(input.dataset.lon),tz=document.getElementById(input.dataset.tz);
    let timer;
    input.addEventListener('input',()=>{
      clearTimeout(timer);
      const q=input.value.trim();
      input.dataset.validPlace='';
      if(q.length<3){
        box?.classList.remove('show');
        return
      }
      timer=setTimeout(()=>lookup(q),360)
    });
    async function lookup(q){
      try{
        status&&(status.textContent=getLang()==='hi'?'स्थान खोज रहे हैं…':'Searching place…');
        const r=await fetch('https://photon.komoot.io/api/?q='+encodeURIComponent(q)+'&limit=7&lang=en');
        const d=await r.json();
        if(!box)return;
        box.innerHTML='';
        (d.features||[]).forEach(f=>{
          const p=f.properties||{
          },coords=f.geometry.coordinates,label=[p.name,p.city||p.town||p.village,p.state,p.country].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(', '),el=document.createElement('div');
          el.className='suggestion';
          el.textContent=label;
          el.addEventListener('click',async()=>{
            input.value=label;
            input.dataset.validPlace='1';
            lat&&(lat.value=(+coords[1]).toFixed(6));
            lon&&(lon.value=(+coords[0]).toFixed(6));
            input.dataset.selectedLat=coords[1];
            input.dataset.selectedLon=coords[0];
            box.classList.remove('show');
            status&&(status.textContent='✓ '+label);
            if(tz){
              tz.value=await timezone(+coords[1],+coords[0])||''
            }
            saveLocation(label,+coords[1],+coords[0],tz?tz.value:'')
          });
          box.appendChild(el)
        });
        box.classList.toggle('show',box.children.length>0);
        if(!box.children.length&&status)status.textContent=getLang()==='hi'?'कोई स्थान नहीं मिला।':'No matching place found.'
      }catch(e){
        status&&(status.textContent=getLang()==='hi'?'स्थान सुझाव अभी उपलब्ध नहीं हैं।':'Place suggestions are unavailable right now.')
      }
    }
    document.addEventListener('click',e=>{
      if(e.target!==input&&!box?.contains(e.target))box?.classList.remove('show')
    });
  }
  async function timezone(lat,lon){
    try{
      const r=await fetch(`https://www.timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lon}`);
      const d=await r.json();
      return d.timeZone||d.timeZoneId||d.timeZoneName||d.iana||d.id||''
    }catch(e){
      if(lat>=6&&lat<=38&&lon>=68&&lon<=98)return'Asia/Kolkata';
      return''
    }
  }
  window.rvTimezone=timezone;
  window.rvRunReportAction=async function(type,fn){
    try{
      if(typeof window.RASHIVIBE_AD_GATE==='function'){
        await window.RASHIVIBE_AD_GATE({
          type
        })
      }
      fn&&fn()
    }catch(e){
      fn&&fn()
    }
  };
  function saveLocation(label,lat,lon,tz){
    try{
      localStorage.setItem('rvLocation',JSON.stringify({
        label,lat:+lat,lon:+lon,tz:tz||''
      }))
    }catch(e){
    }
    document.dispatchEvent(new CustomEvent('rv:location'))
  }
  window.rvSaveLocation=saveLocation;
  function pad2(n){
    return String(n).padStart(2,'0')
  }
  function solarTimes(date,lat,lon){
    function c(r){
      const R=Math.PI/180,D=180/Math.PI,N=Math.floor((date-Date.UTC(date.getUTCFullYear(),0,0))/86400000),lh=lon/15,t=N+((r?6:18)-lh)/24,M=.9856*t-3.289,L=(M+1.916*Math.sin(M*R)+.020*Math.sin(2*M*R)+282.634)%360,RA0=Math.atan(.91764*Math.tan(L*R))*D;
      let RA=(RA0+360)%360;
      RA+=(Math.floor(L/90)*90-Math.floor(RA/90)*90);
      RA/=15;
      const sd=.39782*Math.sin(L*R),cd=Math.cos(Math.asin(sd)),ch=(Math.cos(90.833*R)-sd*Math.sin(lat*R))/(cd*Math.cos(lat*R));
      if(Math.abs(ch)>1)return null;
      const H=(r?360-Math.acos(ch)*D:Math.acos(ch)*D)/15,T=H+RA-.06571*t-6.622;
      let u=(T-lh)%24;
      if(u<0)u+=24;
      return u
    }
    return{
      rise:c(true),set:c(false)
    }
  }
  function fmtSolar(ut,tz){
    if(ut==null)return'—';
    const d=new Date(),h=Math.floor(ut),m=Math.round((ut-h)*60),x=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),h,m));
    return new Intl.DateTimeFormat(getLang()==='hi'?'hi-IN':'en-IN',{
      hour:'numeric',minute:'2-digit',hour12:true,timeZone:tz||'Asia/Kolkata'
    }).format(x)
  }
  function injectTopbar(){
    if(document.querySelector('.rv-topbar'))return;
    let loc={
      label:'नई दिल्ली',lat:28.6139,lon:77.209,tz:'Asia/Kolkata'
    };
    try{
      loc={
        ...loc,...JSON.parse(localStorage.getItem('rvLocation')||'{}')
      }
    }catch(e){
    };
    const bar=document.createElement('div'),now=new Date(),sol=solarTimes(now,loc.lat,loc.lon);
    bar.className='rv-topbar';
    bar.innerHTML=`<div class="rv-topbar-inner"><div><strong>${new Intl.DateTimeFormat(getLang()==='hi'?'hi-IN':'en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(now)}</strong> · ${loc.label||''}</div><div>${getLang()==='hi'?'सूर्योदय':'Sunrise'} ${fmtSolar(sol.rise,loc.tz)} · ${getLang()==='hi'?'सूर्यास्त':'Sunset'} ${fmtSolar(sol.set,loc.tz)}</div></div>`;
    document.body.insertBefore(bar,document.body.firstChild)
  }
  function enhanceDate(input){
    if(!input||input.dataset.rvDone)return;
    input.dataset.rvDone=1;
    input.classList.add('rv-picker-host');
    input.type='hidden';
    const w=document.createElement('div');
    w.className='rv-date-picker';
    w.innerHTML='<div class="rv-date-fields"><input class="rv-dd" inputmode="numeric" maxlength="2" placeholder="DD"><input class="rv-mm" inputmode="numeric" maxlength="2" placeholder="MM"><input class="rv-yyyy" inputmode="numeric" maxlength="4" placeholder="YYYY"><button type="button" class="rv-calendar-btn">▦</button></div><div class="rv-picker-error"></div><div class="rv-calendar-pop"><div class="rv-cal-head"><select class="rv-cal-month"></select><select class="rv-cal-year"></select></div><div class="rv-cal-grid"></div></div>';
    input.after(w);
    const dd=w.querySelector('.rv-dd'),mm=w.querySelector('.rv-mm'),yy=w.querySelector('.rv-yyyy'),err=w.querySelector('.rv-picker-error'),pop=w.querySelector('.rv-calendar-pop'),ms=w.querySelector('.rv-cal-month'),ys=w.querySelector('.rv-cal-year'),grid=w.querySelector('.rv-cal-grid'),now=new Date(),maxY=now.getFullYear();
    ms.innerHTML=Array.from({
      length:12
    },(_,i)=>`<option value="${i+1}">${new Intl.DateTimeFormat(getLang()==='hi'?'hi-IN':'en-IN',{month:'short'}).format(new Date(2024,i,1))}</option>`).join('');
    ys.innerHTML=Array.from({
      length:maxY-1899
    },(_,i)=>maxY-i).map(y=>`<option>${y}</option>`).join('');
    function sync(){
      const d=+dd.value,m=+mm.value,y=+yy.value;
      err.textContent='';
      if(yy.value.length===4&&(y<1900||y>maxY)){
        err.textContent=`वर्ष 1900 से ${maxY} के बीच रखें।`;
        input.value='';
        return
      }
      if(dd.value.length===2&&mm.value.length===2&&yy.value.length===4){
        const dt=new Date(y,m-1,d);
        if(dt.getFullYear()===y&&dt.getMonth()===m-1&&dt.getDate()===d&&dt<=now){
          input.value=`${y}-${pad2(m)}-${pad2(d)}`;
          input.dispatchEvent(new Event('change',{
            bubbles:true
          }))
        }else{
          err.textContent='सही जन्म तिथि दर्ज करें।';
          input.value=''
        }
      }
    }
    [dd,mm,yy].forEach((x,i)=>x.addEventListener('input',()=>{
      x.value=x.value.replace(/\D/g,'').slice(0,i===2?4:2);
      sync()
    }));
    function draw(){
      const y=+ys.value,m=+ms.value,first=new Date(y,m-1,1).getDay(),days=new Date(y,m,0).getDate();
      grid.innerHTML=['र','सो','मं','बु','गु','शु','श'].map(x=>`<b>${x}</b>`).join('')+'<i></i>'.repeat(first);
      for(let d=1;
      d<=days;
      d++){
        const b=document.createElement('button');
        b.type='button';
        b.textContent=d;
        if(+yy.value===y&&+mm.value===m&&+dd.value===d)b.className='sel';
        b.onclick=()=>{
          dd.value=pad2(d);
          mm.value=pad2(m);
          yy.value=y;
          sync();
          pop.classList.remove('show')
        };
        grid.appendChild(b)
      }
    }
    w.querySelector('.rv-calendar-btn').onclick=()=>{
      if(!yy.value)yy.value=maxY;
      if(!mm.value)mm.value=now.getMonth()+1;
      ys.value=yy.value;
      ms.value=+mm.value;
      draw();
      pop.classList.toggle('show')
    };
    ms.onchange=draw;
    ys.onchange=draw;
    document.addEventListener('click',e=>{
      if(!w.contains(e.target))pop.classList.remove('show')
    });
    if(input.value){
      const [y,m,d]=input.value.split('-');
      yy.value=y;
      mm.value=m;
      dd.value=d
    }
  }
  function enhanceTime(input){
    if(!input||input.dataset.rvDone)return;
    input.dataset.rvDone=1;
    input.classList.add('rv-picker-host');
    input.type='hidden';
    const w=document.createElement('div');
    w.className='rv-time-picker';
    w.innerHTML='<button class="rv-time-display" type="button">06 : 35 AM</button><div class="rv-time-pop"><select class="h"></select><select class="m"></select><select class="a"><option>AM</option><option>PM</option></select></div>';
    input.after(w);
    const h=w.querySelector('.h'),m=w.querySelector('.m'),a=w.querySelector('.a'),d=w.querySelector('.rv-time-display'),p=w.querySelector('.rv-time-pop');
    h.innerHTML=Array.from({
      length:12
    },(_,i)=>`<option>${pad2(i+1)}</option>`).join('');
    m.innerHTML=Array.from({
      length:60
    },(_,i)=>`<option>${pad2(i)}</option>`).join('');
    function sync(){
      let H=+h.value;
      if(a.value==='PM'&&H<12)H+=12;
      if(a.value==='AM'&&H===12)H=0;
      input.value=`${pad2(H)}:${m.value}`;
      d.textContent=`${h.value} : ${m.value} ${a.value}`;
      input.dispatchEvent(new Event('change',{
        bubbles:true
      }))
    }
    [h,m,a].forEach(x=>x.onchange=sync);
    d.onclick=()=>p.classList.toggle('show');
    document.addEventListener('click',e=>{
      if(!w.contains(e.target))p.classList.remove('show')
    });
    sync()
  }
  function enhanceLegacy(){
    const h=document.getElementById('hour12'),m=document.getElementById('minute12'),a=document.getElementById('ampm');
    if(!h||h.dataset.rvDone)return;
    h.dataset.rvDone=1;
    h.parentElement.style.display='none';
    const x=document.createElement('input');
    x.type='time';
    h.parentElement.after(x);
    enhanceTime(x);
    x.addEventListener('change',()=>{
      const [H,M]=x.value.split(':').map(Number);
      h.value=(H%12)||12;
      m.value=M;
      a.value=H>=12?'PM':'AM'
    })
  }
  window.rvEnhancePickers=function(){
    document.querySelectorAll('[data-premium-date]').forEach(enhanceDate);
    document.querySelectorAll('[data-premium-time]').forEach(enhanceTime);
    enhanceLegacy()
  };
  window.RASHIVIBE_AD_GATE=window.RASHIVIBE_AD_GATE||function(meta){
    return new Promise(ok=>{
      const b=document.createElement('div');
      b.className='rv-ad-backdrop';
      b.innerHTML='<div class="rv-ad-card"><small>ADVERTISEMENT / PARTNER SPACE</small><h3>आपकी रिपोर्ट तैयार है ✨</h3><div class="rv-ad-slot">यह स्थान अधिकृत विज्ञापन नेटवर्क के लिए तैयार है।</div><button class="btn btn-primary" disabled>2 सेकंड…</button></div>';
      document.body.appendChild(b);
      const bt=b.querySelector('button');
      setTimeout(()=>{
        bt.disabled=false;
        bt.textContent='रिपोर्ट जारी रखें'
      },2000);
      bt.onclick=()=>{
        b.remove();
        ok(meta)
      }
    })
  };
  window.rvShare=function(title,text){
    const t=(text||title||document.title)+' '+location.href;
    if(navigator.share)navigator.share({
      title:title||document.title,text:text||'',url:location.href
    }).catch(()=>{
    });
    else window.open('https://wa.me/?text='+encodeURIComponent(t),'_blank','noopener')
  };
  window.rvInjectShare=function(c,title,text){
    if(!c||c.querySelector('.share-row'))return;
    c.innerHTML='<div class="share-row"><button class="share-btn">WhatsApp ↗</button><button class="share-btn">शेयर करें</button></div>';
    c.children[0].children[0].onclick=()=>window.open('https://wa.me/?text='+encodeURIComponent((text||title||document.title)+' '+location.href),'_blank','noopener');
    c.children[0].children[1].onclick=()=>rvShare(title,text)
  };
})();
