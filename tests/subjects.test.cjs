'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../core.js'),D=require('../data/questions.json'),N=require('../data/sieci-1.json'),raw=require('../data/sieci-records.json');
test('all 922 records in 23 SIECI documents are covered once, with original keys and authors',()=>{
 assert.equal(raw.length,922);assert.equal(new Set(raw.map(r=>r.file)).size,23);
 const covered=[...N.questions.flatMap(q=>q.sources),...N.issues.flatMap(i=>i.records.map(r=>r.id))];
 assert.equal(covered.length,922);assert.equal(new Set(covered).size,922);assert.deepEqual(new Set(covered),new Set(raw.map(r=>r.id)));
 const source=new Map(raw.map(r=>[r.id,r]));C.validate(N.questions);
 for(const q of N.questions){const r=source.get(q.sourceId);assert.equal(q.options.find(o=>o.id===q.correctOptionId).text,r.answer.replace(/\s+/g,' ').trim());assert.ok(q.question.endsWith(' ('+r.author+')'));assert.equal(q.subjectId,'sieci-1');}
 for(const i of N.issues){assert.ok(i.reason.length>30);assert.equal(i.records[0].answer,source.get(i.records[0].id).answer);}
});
test('each subject supports 10/40 random unique questions with independent answer ordering',()=>{
 for(const subject of D.subjects)for(const n of [10,40]){
 const a=C.createSubjectSession(D.questions,subject.id,n),b=C.createSubjectSession(D.questions,subject.id,n);
 assert.equal(a.items.length,n);assert.equal(new Set(a.items.map(i=>i.questionId)).size,n);assert.ok(C.validSession(a,D.questions));
 const bank=C.subjectQuestions(D.questions,subject.id);assert.ok(a.items.every(i=>bank.some(q=>q.id===i.questionId)));
 assert.notDeepEqual(a.items.map(i=>i.questionId),b.items.map(i=>i.questionId));
 assert.ok(new Set(a.items.map(i=>i.optionIds.indexOf('correct'))).size>1);
 for(let i=0;i<n;i++){C.answer(a,i%2?'d1':'correct',D.questions);C.advance(a);}const score=C.score(a,D.questions);assert.equal(score.percent,50);assert.equal(score.mistakes.length,n/2);assert.ok(C.validSession(JSON.parse(JSON.stringify(a)),D.questions));
 }
});
test('cross-subject or invalid sessions are rejected, legacy CPU sessions still resume',()=>{
 const s=C.createSubjectSession(D.questions,'sieci-1',10);s.items[0]=C.createSubjectSession(D.questions,'cpu',10).items[0];assert.equal(C.validSession(s,D.questions),false);
 const old=C.createSubjectSession(D.questions,'cpu',10);delete old.subjectId;assert.ok(C.validSession(old,D.questions));assert.throws(()=>C.createSubjectSession(D.questions,'missing',10));
});
test('disputed review is subject-scoped and never intersects scored questions',()=>{
 for(const subject of D.subjects){const issues=D.issues.filter(i=>i.subjectId===subject.id),s=C.createReviewSession(issues);const ids=new Set(C.reviewRecords(issues).map(r=>r.id));assert.ok(s.ids.every(id=>ids.has(id)));assert.equal(new Set(s.ids).size,10);assert.ok(C.validReviewSession(s,issues));const playable=new Set(D.questions.flatMap(q=>q.sources));assert.ok(s.ids.every(id=>!playable.has(id)));}
});
test('numeric alternatives preserve source form and all source occurrences remain separate',()=>{
 const q=N.questions.find(q=>q.id==='net1-s04-05');assert.ok(q.options.every(o=>/bitów.*bajtów/.test(o.text)));
 assert.equal(N.sources.filter(r=>r.file==='Kacper_Nemec.docx').length,42);
 assert.equal(D.questions.length,2254);assert.equal(D.meta.sourceRecords,2614);
 const cp=require('../data/cpu.json');for(const q of cp.questions.filter(q=>cp.sources.find(s=>s.id===q.sourceId).concept==='turbo'))assert.ok(q.options.slice(1).every(o=>!/^automatycznie/.test(o.text)));
});
test('three distractors never share a first word that singles out the source answer',()=>{
 for(const q of D.questions){const words=q.options.map(o=>o.text.toLocaleLowerCase('pl').match(/[\p{L}\p{N}]+/u)?.[0]);assert.ok(!(words[1]===words[2]&&words[2]===words[3]&&words[0]!==words[1]),q.id+' has an odd-one-out prefix');}
});
