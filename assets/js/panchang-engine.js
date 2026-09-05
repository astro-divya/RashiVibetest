
(()=>{
const TITHI_NAMES=['प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी','षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी','एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','पूर्णिमा/अमावस्या'];
const YOGA=['विष्कम्भ','प्रीति','आयुष्मान','सौभाग्य','शोभन','अतिगण्ड','सुकर्मा','धृति','शूल','गण्ड','वृद्धि','ध्रुव','व्याघात','हर्षण','वज्र','सिद्धि','व्यतीपात','वरीयान','परिघ','शिव','सिद्ध','साध्य','शुभ','शुक्ल','ब्रह्म','इन्द्र','वैधृति'];
function details(date){
 let j=RVVedic.jd(date), ml=RVVedic.sidereal(RVVedic.moonLon(j),j), nk=RVVedic.nak(ml),t=RVVedic.tithi(date);
 return {tithi:`${t.paksha} ${TITHI_NAMES[t.index-1]}`,nak:nk.name,yoga:YOGA[RVVedic.yoga(date)-1],karana:RVVedic.karana(date)};
}
function muhurat(type,year,month){
 const goodNak={
 marriage:['रोहिणी','मृगशिरा','मघा','उत्तर फाल्गुनी','हस्त','स्वाती','अनुराधा','मूल','उत्तराषाढ़ा','उत्तर भाद्रपद','रेवती'],
 vehicle:['अश्विनी','रोहिणी','मृगशिरा','पुनर्वसु','पुष्य','हस्त','चित्रा','स्वाती','अनुराधा','श्रवण','धनिष्ठा','रेवती'],
 griha:['रोहिणी','मृगशिरा','उत्तर फाल्गुनी','चित्रा','अनुराधा','उत्तराषाढ़ा','श्रवण','धनिष्ठा','उत्तर भाद्रपद','रेवती'],
 naming:['अश्विनी','रोहिणी','मृगशिरा','पुनर्वसु','पुष्य','हस्त','चित्रा','स्वाती','अनुराधा','श्रवण','रेवती']
 };
 const key=type||'marriage', out=[],days=new Date(year,month,0).getDate();
 for(let d=1;d<=days;d++){
   let dt=new Date(year,month-1,d,12),x=details(dt),wd=dt.getDay();
   if(goodNak[key].includes(x.nak)&&![0,6].includes(wd)&&!x.tithi.includes('अमावस्या')) out.push({date:dt,...x});
 }
 return out.slice(0,10);
}
window.RVPanchang={details,muhurat};
})();
