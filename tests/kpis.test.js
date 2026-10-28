const test=require('node:test');
const assert=require('node:assert/strict');
const {filter,calculate}=require('../kpis.js');
const projects=[
  {ano:2026,responsavel:'Marina',status:'Recebido',valor:240000},
  {ano:2026,responsavel:'Rafael',status:'Assinado',valor:180000},
  {ano:2026,responsavel:'Marina',status:'Em negociação',valor:320000},
  {ano:2026,responsavel:'Camila',status:'Em andamento',valor:135000},
  {ano:2026,responsavel:'Rafael',status:'Recebido',valor:165000},
  {ano:2027,responsavel:'Camila',status:'Em negociação',valor:210000}
];
test('indicadores originais de 2026',()=>{
  const result=calculate(filter(projects,{year:'2026'}),1200000);
  assert.equal(result.projects,5);
  assert.equal(result.signed,1);
  assert.equal(result.potential,1040000);
  assert.equal(result.received,405000);
  assert.equal(result.signedValue,180000);
  assert.equal(result.remaining,795000);
  assert.equal(result.progress,33.75);
});
test('alterar status para Recebido recalcula a receita',()=>{
  const updated=structuredClone(projects);
  updated[2].status='Recebido';
  const result=calculate(filter(updated,{year:'2026'}),1200000);
  assert.equal(result.received,725000);
  assert.equal(result.remaining,475000);
  assert.equal(Math.round(result.progress),60);
  assert.equal(result.potential,1040000);
});
test('filtro por responsável e ano',()=>{
  const subset=filter(projects,{year:'2026',owner:'Marina'});
  assert.equal(subset.length,2);
  assert.equal(calculate(subset,1200000).potential,560000);
  assert.equal(filter(projects,{year:'2027'}).length,1);
});
test('sem registros e meta zero não produz NaN',()=>{
  const r=calculate([],0);
  assert.equal(r.received,0);
  assert.equal(r.progress,0);
  assert.equal(r.remaining,0);
});
test('exclusão de projeto reduz receita potencial',()=>{
  const r=calculate(projects.filter((_,i)=>i!==2),1200000);
  assert.equal(r.potential,930000);
});
test('distribuição por status soma a receita potencial',()=>{
  const r=calculate(projects,1200000);
  assert.equal(Object.values(r.byStatus).reduce((a,b)=>a+b,0),r.potential);
});
