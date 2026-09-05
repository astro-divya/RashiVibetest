
(()=>{
  window.rvShare=async function(title,text){
    const payload={title:title||document.title,text:text||'',url:location.href};
    if(navigator.share){
      try{await navigator.share(payload);return}catch(e){}
    }
    window.open('https://wa.me/?text='+encodeURIComponent((text||title||document.title)+' '+location.href),'_blank','noopener');
  };
})();
