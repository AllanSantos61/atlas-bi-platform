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
  // Modal editor: edits are applied atomically only after successful validation.
  const modal=document.createElement("dialog");modal.id="atlas-editor";
  modal.style.cssText="background:#122139;color:#edf4ff;border:1px solid #3b526b;border-radius:16px;padding:28px;width:min(94vw,580px);box-shadow:0 25px 100px #000a";
  modal.innerHTML='<form id="atlas-edit-form"><h2 style="margin-top:0">Editar registro</h2><div id="atlas-edit-fields" style="display:grid;gap:13px"></div><div style="display:flex;justify-content:flex-end;gap:10px;margin-top:25px"><button type="button" class="btn alt" id="atlas-cancel">Cancelar</button><button class="btn" type="submit">Salvar alterações</button></div></form>';
  document.body.append(modal);
  const fields=document.getElementById("atlas-edit-fields");
  let current=null;
  const schemas={
    projetos:[["nome","Projeto","text"],["cliente","Cliente","text"],["responsavel","Responsável","text"],["ano","Ano","number"],["status","Status","select"],["valor","Valor (R$)","number"]],
    tarefas:[["nome","Tarefa","text"],["responsavel","Responsável","text"],["status","Status","select"]],
    clientes:[["nome","Cliente","text"],["setor","Setor","text"]]
  };
  const statuses={projetos:["Em andamento","Em negociação","Assinado","Recebido","Paralisado"],tarefas:["Pendente","Em andamento","Concluída"]};
  document.getElementById("atlas-cancel").onclick=()=>modal.close();
  document.addEventListener("click",e=>{
    const button=e.target.closest("[data-action]");if(!button)return;
    const id=Number(button.dataset.id),key=tab,record=state[key]?.find(x=>x.id===id);if(!record)return;
    if(button.dataset.action==="delete"){
      if(!confirm("Excluir este registro fictício?"))return;
      state[key]=state[key].filter(x=>x.id!==id);save();owners();render();return;
    }
    current={key,id};
    fields.replaceChildren();
    for(const [name,label,type] of schemas[key]){
      const wrapper=document.createElement("label");wrapper.style.cssText="display:grid;gap:5px;color:#b8c9db;font-size:13px";wrapper.textContent=label;
      const input=document.createElement(type==="select"?"select":"input");
      input.name=name;input.required=true;input.style.width="100%";
      if(type==="select"){
        for(const option of statuses[key]){
          const opt=document.createElement("option");opt.value=option;opt.textContent=option;input.append(opt);
        }
      }else{
        input.type=type;input.maxLength=100;
        if(type==="number"){input.min=name==="ano"?"2000":"0";input.max=name==="ano"?"2100":"100000000000";input.step=name==="valor"?"0.01":"1";}
      }
      input.value=record[name];wrapper.append(input);fields.append(wrapper);
    }
    modal.showModal();
  });
  document.getElementById("atlas-edit-form").addEventListener("submit",e=>{
    e.preventDefault();if(!current)return;
    const record=state[current.key].find(x=>x.id===current.id);if(!record)return;
    const next={...record};
    for(const [name,,type] of schemas[current.key]){
      const input=e.target.elements[name];
      if(!input.checkValidity()){input.reportValidity();return}
      const value=input.value.trim();
      if(!value){input.setCustomValidity("Campo obrigatório");input.reportValidity();input.setCustomValidity("");return}
      next[name]=type==="number"?Number(value):value.slice(0,100);
    }
    Object.assign(record,next);save();owners();modal.close();render();
  });
  // Monthly chart is an illustrative comparison using each project's year as grouping.
  const previousRender=render;
  render=function(){
    previousRender();
    if(tab!=="financeiro")return;
    const items=rows();
    const years=[...new Set(items.map(p=>p.ano))].sort();
    const panel=document.createElement("div");panel.className="panel";panel.style.marginTop="18px";
    panel.innerHTML="<h2>Receita por ano e situação</h2><p class='muted'>Comparação por ano do projeto. Não representa evolução mensal nem fluxo de caixa.</p>";
    for(const year of years){
      const list=items.filter(p=>p.ano===year);
      const potential=list.reduce((s,p)=>s+p.valor,0);
      const received=list.filter(p=>p.status==="Recebido").reduce((s,p)=>s+p.valor,0);
      const line=document.createElement("div");line.className="row";
      line.innerHTML="<span>"+year+"</span><strong>"+money(received)+" recebidos / "+money(potential)+" potencial</strong>";
      panel.append(line);
      const bar=document.createElement("div");bar.className="bar";
      const fill=document.createElement("span");fill.style.width=(potential?Math.min(100,received/potential*100):0)+"%";
      bar.append(fill);panel.append(bar);
    }
    document.querySelector("#view").append(panel);
  };
  render();
})();
