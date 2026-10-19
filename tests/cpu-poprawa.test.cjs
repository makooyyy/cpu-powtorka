'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../data/cpu-poprawa.json'),raw=require('../data/cpu-poprawa-records.json'),all=require('../data/questions.json'),old=require('../data/cpu.json');
test('CPU poprawa accounts for all 907 source pairs in 23 files without changing original answers',()=>{
 assert.equal(raw.length,907);assert.equal(new Set(raw.map(r=>r.file)).size,23);
 const covered=[...D.questions.map(q=>q.sourceId),...D.issues.flatMap(i=>i.records.map(r=>r.id))];
 assert.equal(covered.length,907);assert.equal(new Set(covered).size,907);assert.deepEqual(new Set(covered),new Set(raw.map(r=>r.id)));
 const src=new Map(raw.map(r=>[r.id,r]));for(const q of D.questions){const r=src.get(q.sourceId);assert.equal(q.options.find(o=>o.id===q.correctOptionId).text,r.answer.replace(/\s+/g,' ').trim());assert.ok(q.question.endsWith(' ('+r.author+')'));assert.equal(q.subjectId,'cpu-poprawa');}
 for(const issue of D.issues){assert.ok(issue.reason.length>30);assert.equal(issue.records[0].answer,src.get(issue.records[0].id).answer);}
});
test('CPU poprawa preserves short documents, source duplicates and the original CPU bank',()=>{
 const counts=Array.from({length:23},(_,i)=>raw.filter(r=>r.id.startsWith('cpur-s'+String(i).padStart(2,'0')+'-')).length);
 assert.deepEqual(counts,[40,40,40,38,40,40,40,40,40,39,40,40,40,40,40,40,40,30,40,40,40,40,40]);
 assert.deepEqual(all.questions.filter(q=>q.subjectId==='cpu'),old.questions.map(q=>({...q,subjectId:'cpu'})));
 assert.ok(all.subjects.some(s=>s.id==='cpu-poprawa'&&s.title==='CPU poprawa'));
});
test('core count and vendor distractors preserve answer form without broken inflections',()=>{
 for(const id of ['cpur-s00-33','cpur-s02-32']){const q=D.questions.find(q=>q.id===id);assert.ok(q.options.every(o=>/^Procesor .*rdzeniowy/.test(o.text)));}
 const q=D.questions.find(q=>q.id==='cpur-s21-20');assert.ok(q.options.every(o=>/core/i.test(o.text)));
 for(const q of D.questions)for(const o of q.options.slice(1)){assert.ok(!/AMDa|AMDu|IBMa|IBMu|To do |To na |To jest wykonany|aLU|iR,|dEK,/.test(o.text),q.id);}
});
