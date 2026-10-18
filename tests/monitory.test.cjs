'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const C=require('../core.js'),M=require('../data/monitory.json'),raw=require('../data/monitory-records.json');
test('Monitory preserves all 654 entries from 21 files, including repeats and an unanswered question',()=>{
 assert.equal(raw.length,654);assert.equal(new Set(raw.map(r=>r.file)).size,21);
 const covered=[...M.questions.flatMap(q=>q.sources),...M.issues.flatMap(i=>i.records.map(r=>r.id))];
 assert.equal(covered.length,654);assert.equal(new Set(covered).size,654);assert.deepEqual(new Set(covered),new Set(raw.map(r=>r.id)));
 assert.equal(M.questions.length,524);assert.equal(M.issues.length,130);
 const missing=M.issues.find(i=>i.records.some(r=>r.id==='mon-s16-32'));assert.equal(missing.records[0].answer,'');assert.match(missing.reason,/brakuje odpowiedzi/);
 C.validate(M.questions);
 for(const q of M.questions){const r=raw.find(r=>r.id===q.sourceId);assert.equal(q.options.find(o=>o.id===q.correctOptionId).text,r.answer.replace(/\s+/g,' ').trim());assert.equal(q.question,r.question.replace(/\s+/g,' ').trim()+' ('+r.author+')');assert.equal(q.subjectId,'monitory');}
});
test('Monitory document coverage matches each source file, with no silent empty-row questions',()=>{
 const expected=[29,30,28,31,30,40,30,30,30,30,30,33,30,32,30,29,32,40,30,30,30];
 expected.forEach((count,i)=>assert.equal(raw.filter(r=>r.id.startsWith('mon-s'+String(i).padStart(2,'0')+'-')).length,count));
 const keys=fs.readFileSync(require('node:path').join(__dirname,'../data/monitory-concepts.txt'),'utf8').trim().split(/\s+/);assert.equal(keys.length,654);
 for(const i of M.issues){assert.ok(i.reason.length>30);assert.deepEqual(i.records[0].answer,raw.find(r=>r.id===i.records[0].id).answer);}
});
test('Monitory source-shaped alternatives keep units and grammatical forms without mutating keys',()=>{
 for(const id of ['mon-s06-10','mon-s13-07','mon-s12-06']){const q=M.questions.find(q=>q.id===id);assert.ok(q.options.slice(1).every(o=>o.text.length>5));}
 assert.deepEqual(M.questions.find(q=>q.id==='mon-s10-26').options.map(o=>o.text),['1','2','3','4']);
 assert.ok(M.questions.find(q=>q.id==='mon-s06-22').options.slice(1).every(o=>o.text.includes('działa elektronowe')));
});
