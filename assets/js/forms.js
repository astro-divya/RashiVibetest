
(()=>{
  const pad=n=>String(n).padStart(2,'0');

  function validDate(prefix){
    const d=+document.getElementById(prefix+'D').value;
    const m=+document.getElementById(prefix+'M').value;
    const y=+document.getElementById(prefix+'Y').value;
    const now=new Date();
    const x=new Date(y,m-1,d);
    const ok=y>=1900&&y<=now.getFullYear()&&
      x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d&&x<=now;
    return ok?`${y}-${pad(m)}-${pad(d)}`:'';
  }

  function valueTime(prefix){
    let h=+document.getElementById(prefix+'H').value;
    const m=+document.getElementById(prefix+'Min').value;
    const ap=document.getElementById(prefix+'AP').value;
    if(ap==='PM'&&h<12)h+=12;
    if(ap==='AM'&&h===12)h=0;
    return `${pad(h)}:${pad(m)}`;
  }

  function setupPlace(input){
    const box=document.getElementById(input.dataset.box);
    const lat=document.getElementById(input.dataset.lat);
    const lon=document.getElementById(input.dataset.lon);
    const tz=document.getElementById(input.dataset.tz);
    let timer;

    input.addEventListener('input',()=>{
      input.dataset.ok='';
      clearTimeout(timer);
      box.innerHTML='';
      const q=input.value.trim();
      if(q.length<3)return;
      timer=setTimeout(async()=>{
        try{
          const r=await fetch('https://photon.komoot.io/api/?q='+encodeURIComponent(q)+'&limit=6');
          const j=await r.json();
          box.innerHTML='';
          (j.features||[]).forEach(f=>{
            const p=f.properties||{};
            const c=f.geometry.coordinates;
            const b=document.createElement('button');
            b.type='button';
            b.textContent=[p.name,p.city||p.town||p.village,p.state,p.country]
              .filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(', ');
            b.addEventListener('click',()=>{
              input.value=b.textContent;
              input.dataset.ok='1';
              lat.value=(+c[1]).toFixed(6);
              lon.value=(+c[0]).toFixed(6);
              tz.value=(c[1]>=6&&c[1]<=38&&c[0]>=68&&c[0]<=98)?'Asia/Kolkata':'';
              box.innerHTML='';
            });
            box.appendChild(b);
          });
          if(!box.children.length){
            box.innerHTML='<div class="hint" style="padding:10px">कोई स्थान नहीं मिला।</div>';
          }
        }catch(e){
          box.innerHTML='<div class="hint" style="padding:10px">स्थान सुझाव अभी उपलब्ध नहीं हैं।</div>';
        }
      },360);
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('[data-place]').forEach(setupPlace);
    document.querySelectorAll('[data-year]').forEach(el=>{
      el.addEventListener('input',()=>el.value=el.value.replace(/\D/g,'').slice(0,4));
    });
    document.querySelectorAll('[data-day],[data-month]').forEach(el=>{
      el.addEventListener('input',()=>el.value=el.value.replace(/\D/g,'').slice(0,2));
    });
  });

  window.RVForms={validDate,valueTime};
})();
