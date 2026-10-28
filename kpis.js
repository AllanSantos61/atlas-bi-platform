/* Pure, dependency-free KPI calculations shared by the UI and automated tests. */
(function(root){
  "use strict";
  const sum=(items)=>items.reduce((total,item)=>total+Number(item.valor||0),0);
  const filter=(items,{year="all",owner="all"}={})=>items.filter(p=>
    (year==="all"||String(p.ano)===String(year)) &&
    (owner==="all"||p.responsavel===owner));
  function calculate(items,meta){
    const goal=Number(meta);
    const potential=sum(items);
    const received=sum(items.filter(p=>p.status==="Recebido"));
    const signedValue=sum(items.filter(p=>p.status==="Assinado"));
    const byStatus={};
    for(const p of items)byStatus[p.status]=(byStatus[p.status]||0)+Number(p.valor||0);
    return {projects:items.length,signed:items.filter(p=>p.status==="Assinado").length,
      potential,received,signedValue,remaining:Math.max(0,goal-received),
      progress:goal>0?received/goal*100:0,byStatus};
  }
  const api=Object.freeze({filter,calculate});
  root.AtlasKPIs=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
