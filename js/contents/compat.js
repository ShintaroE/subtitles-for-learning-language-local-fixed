/* Resolve only catalog IDs associated with the active title. */
function SFLLResolve(app, response) {
  const direct=response.catalogMetadata?.catalog?.id;
  if(typeof direct==='string' && direct.length>10) return direct;
  const match=location.pathname.match(/\/(?:detail|dp)\/([A-Z0-9]{10,})(?:\/|$)/i);
  const title=response.returnedTitleRendition?.asin || match?.[1];
  if(!title) return null;
  if(title.length>10) return title;
  let result=null;
  function visit(obj,depth=0) {
    if(!obj || typeof obj!=='object' || depth>40 || result) return;
    if(obj.asin===title || obj.titleID===title || obj.titleId===title || (Array.isArray(obj.asins)&&obj.asins.includes(title))) {
      const id=obj.gti || obj.catalogId || obj.self?.gti;
      if(typeof id==='string' && id.length>10) result=id;
    }
    for(const [key,value] of Object.entries(obj)) {
      if(key===title && typeof value?.gti==='string' && value.gti.length>10) result=value.gti;
      if(!result) visit(value,depth+1);
    }
  }
  visit(app.pageJsonData);visit(app.additionalEpisodeDataArray);
  if(!result) for(const script of document.querySelectorAll('script[type="application/json"],script[type="text/template"]')) {
    if(!script.textContent.includes(title)) continue;
    try {visit(JSON.parse(script.textContent));} catch {}
    if(result) break;
  }
  if(!result) console.debug('[SFLL] No catalog ID matched active title',title);
  return result;
}
