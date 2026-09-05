
(()=>{
  const $$=(s,c=document)=>[...c.querySelectorAll(s)];
  function setLang(lang){
    localStorage.setItem('rvLang',lang);
    document.documentElement.lang=lang;
    $$('[data-hi][data-en]').forEach(el=>{
      const value=el.dataset[lang];
      if(value) el.textContent=value;
    });
    $$('.lang button').forEach(b=>b.classList.toggle('on',b.dataset.lang===lang));
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const top=document.querySelector('.topbar');
    if(top){
      const d=new Intl.DateTimeFormat(document.documentElement.lang==='en'?'en-IN':'hi-IN',
        {weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(new Date());
      top.innerHTML='<div class="top-panchang"><span>✦ RashiVibe · Your Stars. Your Story.</span><span>• '+d+'</span></div>';
    }
    setLang(localStorage.getItem('rvLang')||'hi');
    $$('.lang button').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
    const menu=document.querySelector('.menu-btn');
    const nav=document.querySelector('.site-nav');
    if(menu&&nav) menu.addEventListener('click',()=>nav.classList.toggle('open'));
  });
  window.RV={setLang};
})();
