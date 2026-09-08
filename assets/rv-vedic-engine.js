/*
  RashiVibe Vedic Engine v1
  Astronomical foundation: Astronomy Engine (MIT) loaded separately.
  Vedic layer: Lahiri-style sidereal conversion, mean lunar node, nakshatra/pada,
  navamsa, whole-sign houses, Vimshottari dasha, simple yoga and Shani checks.
*/
(function(root){
  'use strict';
  const Z_HI=['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुंभ','मीन'];
  const Z_EN=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const NAK_HI=['अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा','आर्द्रा','पुनर्वसु','पुष्य','आश्लेषा','मघा','पूर्व फाल्गुनी','उत्तर फाल्गुनी','हस्त','चित्रा','स्वाती','विशाखा','अनुराधा','ज्येष्ठा','मूल','पूर्वाषाढ़ा','उत्तराषाढ़ा','श्रवण','धनिष्ठा','शतभिषा','पूर्व भाद्रपद','उत्तर भाद्रपद','रेवती'];
  const NAK_EN=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
  const LORD_HI=['केतु','शुक्र','सूर्य','चंद्र','मंगल','राहु','गुरु','शनि','बुध'];
  const LORD_EN=['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
  const DURATION=[7,20,6,10,7,18,16,19,17];
  const P_EN=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Rahu','Ketu'];
  const P_HI=['सूर्य','चंद्र','बुध','शुक्र','मंगल','गुरु','शनि','राहु','केतु'];
  const mod=(x,n=360)=>((x%n)+n)%n;
  const rad=x=>x*Math.PI/180;
  const deg=x=>x*180/Math.PI;
  const jd=d=>d.getTime()/86400000+2440587.5;

  // Lahiri/Chitrapaksha-style working ayanamsha approximation.
  // J2000 anchor 23.85675°, annual precession ~50.285 arcsec/year.
  const ayan=j=>23.85675+0.013968*((j-2451545.0)/365.2425);

  function requireAstronomy(){
    if(!root.Astronomy) throw new Error('Astronomy Engine failed to load. Check internet/CDN connection.');
    return root.Astronomy;
  }

  function tropicalLon(bodyName,date){
    const A=requireAstronomy();
    if(bodyName==='Moon'){
      const m=A.EclipticGeoMoon(date);
      return mod(m.lon);
    }
    const B=A.Body && A.Body[bodyName] ? A.Body[bodyName] : bodyName;
    const v=A.GeoVector(B,date,true);
    const e=A.Ecliptic(v);
    return mod(e.elon);
  }

  // Mean ascending lunar node (Rahu) in tropical longitude, Meeus-style polynomial.
  function meanNodeTropical(date){
    const T=(jd(date)-2451545.0)/36525;
    return mod(125.04455501 - 1934.1361849*T + 0.0020762*T*T + (T*T*T)/467410 - (T*T*T*T)/60616000);
  }

  function positions(date){
    const j=jd(date),a=ayan(j),out={};
    for(const p of ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn']){
      out[p]=mod(tropicalLon(p,date)-a);
    }
    out.Rahu=mod(meanNodeTropical(date)-a);
    out.Ketu=mod(out.Rahu+180);
    return out;
  }

  function meanObliquity(j){
    const T=(j-2451545.0)/36525;
    const sec=21.448 - 46.8150*T - 0.00059*T*T + 0.001813*T*T*T;
    return 23 + 26/60 + sec/3600;
  }

  function localSiderealDegrees(date,lon){
    const A=requireAstronomy();
    // Astronomy.SiderealTime returns Greenwich apparent sidereal time in hours.
    if(typeof A.SiderealTime==='function') return mod(A.SiderealTime(date)*15 + (+lon||0));
    // Fallback formula only for local sidereal angle, not planetary positions.
    const j=jd(date),T=(j-2451545)/36525;
    return mod(280.46061837+360.98564736629*(j-2451545)+.000387933*T*T-T*T*T/38710000+(+lon||0));
  }

  function asc(date,lat,lon){
    const j=jd(date),theta=rad(localSiderealDegrees(date,lon)),eps=rad(meanObliquity(j)),phi=rad(+lat||0);
    // Eastern ecliptic intersection with the local horizon.
    let lam=deg(Math.atan2(-Math.cos(theta), Math.sin(theta)*Math.cos(eps)+Math.tan(phi)*Math.sin(eps)));
    return mod(lam+180-ayan(j));
  }

  function nak(lon){
    const u=mod(lon)/(360/27),i=Math.floor(u),frac=u-i;
    return {i,frac,pada:Math.floor(frac*4)+1,lordIndex:i%9};
  }
  function signIndex(lon){return Math.floor(mod(lon)/30)}
  function navamsa(lon){
    const s=signIndex(lon),part=Math.floor((mod(lon)%30)/(30/9));let start;
    if([0,3,6,9].includes(s))start=s;
    else if([1,4,7,10].includes(s))start=mod(s+8,12);
    else start=mod(s+4,12);
    return mod(start+part,12);
  }

  function toDate(y,m,d,h,min,ap,tz){
    let hh=+h;if(ap==='PM'&&hh<12)hh+=12;if(ap==='AM'&&hh===12)hh=0;
    let offsetMinutes;
    if(tz==='Asia/Kolkata') offsetMinutes=330;
    else if(typeof tz==='string' && /^UTC[+-]/i.test(tz)) offsetMinutes=parseFloat(tz.replace(/UTC/i,''))*60;
    else if(Number.isFinite(+tz)) offsetMinutes=(+tz)*60;
    else {
      const local=new Date(+y,+m-1,+d,hh,+min,0);
      offsetMinutes=-local.getTimezoneOffset();
    }
    return new Date(Date.UTC(+y,+m-1,+d,hh,+min)-offsetMinutes*60000);
  }

  function chart(date,lat,lon){
    const pos=positions(date),a=asc(date,+lat,+lon),mn=nak(pos.Moon);
    return {date,pos,asc:a,ascSign:signIndex(a),moonSign:signIndex(pos.Moon),sunSign:signIndex(pos.Sun),moonNak:mn,nav:Object.fromEntries(Object.entries(pos).map(([p,l])=>[p,navamsa(l)])),ascNav:navamsa(a),engine:'Astronomy Engine + RashiVibe Vedic layer',ayanamsha:'Lahiri/Chitrapaksha'};
  }

  function vimshottari(c,birth,at=new Date()){
    const n=c.moonNak,startLord=n.lordIndex,elapsed=n.frac*DURATION[startLord],start=new Date(birth.getTime()-elapsed*365.2425*86400000),rows=[],cur=new Date(start);
    for(let k=0;k<18;k++){
      const idx=(startLord+k)%9,end=new Date(cur.getTime()+DURATION[idx]*365.2425*86400000);
      rows.push({idx,start:new Date(cur),end:new Date(end)});cur.setTime(end.getTime());
    }
    const md=rows.find(x=>at>=x.start&&at<x.end)||rows[0];
    if(!md)return {md:null,ad:null,rows};
    const mdMs=DURATION[md.idx]*365.2425*86400000;let adStart=new Date(md.start),ad=null;
    for(let k=0;k<9;k++){
      const ai=(md.idx+k)%9,dur=mdMs*(DURATION[ai]/120),end=new Date(adStart.getTime()+dur);
      if(at>=adStart&&at<end){ad={idx:ai,start:new Date(adStart),end:new Date(end)};break}
      adStart=end;
    }
    return {md,ad,rows};
  }

  function tithi(date){const p=positions(date),diff=mod(p.Moon-p.Sun),n=Math.floor(diff/12)+1;return {n,index:(n-1)%15,paksha:n<=15?0:1,angle:diff}}
  function yoga(date){const p=positions(date);return Math.floor(mod(p.Sun+p.Moon)/(360/27))}
  function karana(date){const p=positions(date);return Math.floor(mod(p.Moon-p.Sun)/6)}
  function houseFrom(lon,ascSign){return mod(signIndex(lon)-ascSign,12)+1}
  function yogas(c){
    const h={};for(const [p,l] of Object.entries(c.pos))h[p]=houseFrom(l,c.ascSign);
    const ys=[];
    if(signIndex(c.pos.Sun)===signIndex(c.pos.Mercury))ys.push(['Budha-Aditya','बुध-आदित्य']);
    const jRel=mod(signIndex(c.pos.Jupiter)-c.moonSign,12)+1;
    if([1,4,7,10].includes(jRel))ys.push(['Gaja Kesari','गज केसरी']);
    if(signIndex(c.pos.Moon)===signIndex(c.pos.Mars))ys.push(['Chandra-Mangal','चंद्र-मंगल']);
    return {ys,manglik:[1,2,4,7,8,12].includes(h.Mars),houses:h};
  }
  function sadeSati(moonSign,date=new Date()){
    const sat=signIndex(positions(date).Saturn),rel=mod(sat-moonSign,12);
    const code=rel===11?'phase1':rel===0?'phase2':rel===1?'phase3':(rel===3||rel===7?'dhaiya':'none');
    return {sat,rel,code};
  }

  root.RVVedicEngine={
    Z_HI,Z_EN,NAK_HI,NAK_EN,LORD_HI,LORD_EN,DURATION,P_EN,P_HI,
    mod,jd,ayan,positions,asc,nak,signIndex,navamsa,toDate,chart,vimshottari,tithi,yoga,karana,houseFrom,yogas,sadeSati,
    engineName:'Astronomy Engine 2.1.19 + RashiVibe Vedic layer',
    engineReady:()=>!!root.Astronomy
  };
})(window);
