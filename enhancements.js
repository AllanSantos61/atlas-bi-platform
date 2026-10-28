/* Atlas BI demo enhancements — all changes remain local to the browser. */
(function(){
  const originalRender = render;
  function actionButton(label,action,id){return '<button type="button" class="btn alt" data-action="'+action+'" data-id="'+id+'" style="padding:6px 10px;margin:2px;font-size:12px">'+label+'</button>'}
  render = function(){
    originalRender();
    if(tab==="projetos"||tab==="tarefas"||tab==="clientes"){
      const list=tab==="projetos"?rows():state[tab];
      const table=document.querySelector("#view table");
      if(table){
        const th=document.createElement("th");th.textContent="Ações";table.querySelector("thead tr").append(th);
        [...table.querySelectorAll("tbody tr")].forEach((tr,i)=>{
          const td=document.createElement("td");
          td.innerHTML=actionButton("Editar","edit",list[i].id)+actionButton("Excluir","delete",list[i].id);
          tr.append(td);
        });
      }
    }
    if(tab==="visao"){
      const list=rows(),total=list.reduce((s,p)=>s+p.valor,0);
      const byStatus={};list.forEach(p=>byStatus[p.status]=(byStatus[p.status]||0)+p.valor);
      const colors=["#61e2c4","#7eaaff","#ffc978","#c5a0ff","#f38e9c"];
      const entries=Object.entries(byStatus);
      let start=0;
      const stops=entries.map(([key,value],i)=>{const a=start;start+=total?100*value/total:0;return colors[i%colors.length]+" "+a+"% "+start+"%"}).join(",");
      const panel=document.createElement("div");panel.className="panel";panel.style.marginTop="18px";
      panel.innerHTML='<h2>Distribuição da receita por status</h2><div style="display:flex;align-items:center;gap:30px;flex-wrap:wrap"><div role="img" aria-label="Gráfico de rosca de receita por status" style="width:170px;height:170px;border-radius:50%;background:conic-gradient('+(stops||"#263b52 0% 100%")+');position:relative;flex:none"><div style="position:absolute;inset:40px;border-radius:50%;background:#121f33;display:grid;place-items:center;font-weight:800">100%</div></div><div style="flex:1;min-width:190px">'+entries.map(([key,value],i)=>'<div class="row"><span><span style="color:'+colors[i%colors.length]+'">●</span> '+safe(key)+'</span><b>'+Math.round(total?100*value/total:0)+'%</b></div>').join("")+'</div></div>';
      document.querySelector("#view").append(panel);
    }
  };
  document.addEventListener("click",e=>{
    const button=e.target.closest("[data-action]");if(!button)return;
    const id=Number(button.dataset.id),key=tab,record=state[key]?.find(x=>x.id===id);if(!record)return;
    if(button.dataset.action==="delete"){
      if(!confirm("Excluir este registro fictício?"))return;
      state[key]=state[key].filter(x=>x.id!==id);
    }else{
      const fields=key==="projetos"?["nome","cliente","responsavel","ano","status","valor"]:key==="tarefas"?["nome","responsavel","status"]:["nome","setor"];
      for(const field of fields){
        const value=prompt("Editar "+field+":",record[field]);if(value===null)return;
        if(!value.trim()){alert("O campo não pode ficar vazio.");return}
        if(field==="valor"||field==="ano"){
          const n=Number(value);if(!Number.isFinite(n)||n<0){alert("Valor inválido.");return}record[field]=n;
        }else if(field==="status"&&key==="projetos"){
          const options=["Em andamento","Em negociação","Assinado","Recebido","Paralisado"];
          if(!options.includes(value)){alert("Use um destes status: "+options.join(", "));return}record[field]=value;
        }else record[field]=value.slice(0,100);
      }
    }
    save();owners();render();
  });
  render();
})();
