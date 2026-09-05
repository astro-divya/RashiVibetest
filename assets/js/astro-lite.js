
(()=>{
  const signs=['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुंभ','मीन'];
  function lifePath(dateStr){
    let v=dateStr.replace(/\D/g,''),n=[...v].reduce((a,b)=>a+(+b),0);
    while(n>9&&![11,22,33].includes(n))n=[...String(n)].reduce((a,b)=>a+(+b),0);
    return n;
  }
  function birthNumber(dateStr){
    const d=+dateStr.split('-')[2];let n=d;
    while(n>9)n=[...String(n)].reduce((a,b)=>a+(+b),0);
    return n;
  }
  window.RVAstro={lifePath,birthNumber,signs};
})();
