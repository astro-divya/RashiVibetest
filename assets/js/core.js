
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
    setLang(localStorage.getItem('rvLang')||'hi');
    $$('.lang button').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
    const menu=document.querySelector('.menu-btn');
    const nav=document.querySelector('.site-nav');
    if(menu&&nav) menu.addEventListener('click',()=>nav.classList.toggle('open'));
  });
  window.RV={setLang};
})();
