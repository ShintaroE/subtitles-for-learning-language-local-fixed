(() => {
  function typeFor(url) {
    try {const p=new URL(url,location.href).pathname;return ['/GetPlaybackResources','/GetVodPlaybackResources','/getDetailPage'].find(t=>p.endsWith(t));} catch {}
  }
  function publish(type,url,body) {
    if(type==='/getDetailPage') window.postMessage({type,url,data:typeof body==='string'?JSON.parse(body):body},window.origin);
    else window.postMessage({type,url,body:typeof body==='string'?body:JSON.stringify(body)},window.origin);
  }
  const open=XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open=function(method,url,...args) {
    const type=typeFor(url);
    if(type) this.addEventListener('load',()=>{try {if(this.status>=200&&this.status<300) publish(type,String(url),this.response);} catch(e){console.debug('[SFLL] XHR inspection failed',e);}}, {once:true});
    return open.call(this,method,url,...args);
  };
  const originalFetch=window.fetch;
  window.fetch=function(input,...args) {
    const url=typeof input==='string'?input:input instanceof URL?input.href:input?.url;
    const type=typeFor(url);
    return originalFetch.call(this,input,...args).then(response=>{
      if(type&&response.ok) response.clone().text().then(body=>publish(type,url,body)).catch(e=>console.debug('[SFLL] fetch inspection failed',e));
      return response;
    });
  };
})();
