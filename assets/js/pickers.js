
(()=>{
  function attach(prefix){
    const d=document.getElementById(prefix+'D'),m=document.getElementById(prefix+'M'),y=document.getElementById(prefix+'Y');
    if(!d||!m||!y)return;
    const wrap=document.createElement('div');wrap.className='picker-wrap';
    const btn=document.createElement('button');btn.type='button';btn.className='btn ghost';btn.textContent='📅 Calendar से चुनें';
    y.parentElement.parentElement.appendChild(wrap);wrap.appendChild(btn);
    let pop;
    function render(){
      if(pop)pop.remove();
      pop=document.createElement('div');pop.className='calendar-pop';
      let yy=+(y.value||new Date().getFullYear()-20), mm=+(m.value||1);
      const head=document.createElement('div');head.style.display='flex';head.style.gap='8px';
      const ms=document.createElement('select');
      for(let i=1;i<=12;i++){let o=document.createElement('option');o.value=i;o.textContent=i;o.selected=i===mm;ms.appendChild(o)}
      const ys=document.createElement('input');ys.type='number';ys.min=1900;ys.max=new Date().getFullYear();ys.value=yy;ys.style.width='110px';
      head.append(ms,ys);pop.appendChild(head);
      const grid=document.createElement('div');grid.className='calendar-grid';
      const first=new Date(yy,mm-1,1).getDay(), days=new Date(yy,mm,0).getDate();
      for(let i=0;i<first;i++)grid.appendChild(document.createElement('span'));
      for(let day=1;day<=days;day++){
        const b=document.createElement('button');b.type='button';b.textContent=day;
        if(day===+d.value&&mm===+m.value&&yy===+y.value)b.className='selected';
        b.onclick=()=>{d.value=String(day).padStart(2,'0');m.value=String(mm).padStart(2,'0');y.value=yy;pop.remove();pop=null};
        grid.appendChild(b)
      }
      pop.appendChild(grid);
      ms.onchange=()=>{m.value=ms.value;render()};ys.onchange=()=>{y.value=ys.value;render()};
      wrap.appendChild(pop);
    }
    btn.onclick=()=>pop?(pop.remove(),pop=null):render();
  }
  document.addEventListener('DOMContentLoaded',()=>['k','b','g'].forEach(attach));
})();
