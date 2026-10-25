/* Learning, filtered sessions, review scheduling and analytics. No browser dependencies. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./core.js'):root.QuizCore);if(typeof module==='object'&&module.exports)module.exports=api;else root.StudyCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(C){
'use strict';
const DAY=86400000,MODES=['learn','review','exam','custom'];
function filter(questions,f={}){return questions.filter(q=>(!f.subjectIds?.length||f.subjectIds.includes(q.subjectId||'cpu'))&&(!f.authors?.length||f.authors.includes(q.author))&&(!f.categories?.length||f.categories.includes(q.category)));}
function progress(history,questions){const map=new Map(),lookup=new Map(questions.map(q=>[q.id,q]));const seen=new Set();for(const s of [...history].filter(s=>s.finishedAt).sort((a,b)=>a.finishedAt-b.finishedAt)){if(seen.has(s.id))continue;seen.add(s.id);for(const item of s.items){const q=lookup.get(item.questionId);if(!q||item.selectedId===null)continue;const p=map.get(q.id)||{attempts:0,correct:0,streak:0,lastWrong:0,lastAt:0,dueAt:0};const correct=item.selectedId===q.correctOptionId;p.attempts++;p.correct+=Number(correct);p.streak=correct?p.streak+1:0;p.lastAt=s.finishedAt;if(!correct)p.lastWrong=s.finishedAt;p.dueAt=s.finishedAt+(correct?[1,3,7,14,30][Math.min(p.streak-1,4)]*DAY:0);map.set(q.id,p);}}return map;}
function reviewPool(questions,history,ratings={},now=Date.now()){const p=progress(history,questions);return questions.filter(q=>{const x=p.get(q.id);return ratings[q.id]==='hard'||(x&&((x.lastWrong&&x.streak<2)||x.dueAt<=now));});}
function reviewSelect(pool,count,history,questions,ratings={},rng=Math.random,now=Date.now()){const p=progress(history,questions);return pool.map(q=>{const x=p.get(q.id);const weight=(ratings[q.id]==='hard'?4:0)+(x?.lastWrong&&x.streak<2?6:0)+(x?.dueAt<=now?2:0)+1;return{q,rank:-Math.log(Math.max(Number.EPSILON,rng()))/weight};}).sort((a,b)=>a.rank-b.rank).slice(0,count).map(x=>x.q);}
function create(questions,config,history=[],ratings={},rng=Math.random,now=Date.now()){
 if(!MODES.includes(config.mode))throw Error('Nieznany tryb');
 const ids=config.subjectIds;if(!Array.isArray(ids)||!ids.length||ids.some(id=>!questions.some(q=>(q.subjectId||'cpu')===id)))throw Error('Wybierz temat');
 let pool=filter(questions,config);if(config.mode==='review')pool=reviewPool(pool,history,ratings,now);
 if(!Number.isInteger(config.count)||config.count<1||config.count>200||config.count>pool.length)throw Error('Za mało pytań dla wybranych filtrów');
 if(config.mode==='exam'&&(!Number.isInteger(config.minutes)||config.minutes<1||config.minutes>180))throw Error('Nieprawidłowy czas egzaminu');
 const chosen=config.mode==='review'?reviewSelect(pool,config.count,history,questions,ratings,rng,now):pool;
 const s=C.createSession(chosen,config.count,rng);s.startedAt=now;s.schema=2;s.mode=config.mode;s.subjectIds=[...ids];s.subjectId=ids.length===1?ids[0]:'mixed';s.filters={authors:[...(config.authors||[])],categories:[...(config.categories||[])]};s.deadline=config.mode==='exam'?now+config.minutes*60000:null;s.minutes=config.mode==='exam'?config.minutes:null;s.items.forEach(i=>i.locked=false);return s;
}
function valid(s,questions){
 if(!s||s.schema!==2||!MODES.includes(s.mode)||!Number.isInteger(s.count)||s.count<1||s.count>200||!Array.isArray(s.items)||s.items.length!==s.count||!Number.isInteger(s.index)||s.index<0||s.index>=s.count||typeof s.id!=='string'||!Number.isFinite(s.startedAt)||!(s.finishedAt===null||Number.isFinite(s.finishedAt)))return false;
 if(!Array.isArray(s.subjectIds)||!s.subjectIds.length||new Set(s.subjectIds).size!==s.subjectIds.length||s.subjectId!==(s.subjectIds.length===1?s.subjectIds[0]:'mixed')||!s.filters||!Array.isArray(s.filters.authors)||!Array.isArray(s.filters.categories))return false;
 if(s.mode==='exam'&&(!Number.isInteger(s.minutes)||s.minutes<1||s.minutes>180||s.deadline!==s.startedAt+s.minutes*60000))return false;
 if(s.mode!=='exam'&&s.deadline!==null)return false;
 const lookup=new Map(filter(questions,{subjectIds:s.subjectIds,...s.filters}).map(q=>[q.id,q])),seen=new Set();
 return s.items.every((i,n)=>{if(!i||typeof i!=='object')return false;const q=lookup.get(i.questionId);if(!q||seen.has(q.id)||!Array.isArray(i.optionIds)||i.optionIds.length!==4||new Set(i.optionIds).size!==4||!i.optionIds.every(id=>q.options.some(o=>o.id===id))||!(i.selectedId===null||i.optionIds.includes(i.selectedId))||typeof i.locked!=='boolean')return false;
 if(s.mode!=='exam'&&(n<s.index||s.finishedAt)&&i.selectedId===null)return false;
 if(['learn','review'].includes(s.mode)&&((n<s.index||s.finishedAt)&&!i.locked||i.locked&&i.selectedId===null))return false;
 if(i.optionsSnapshot&&(!Array.isArray(i.optionsSnapshot)||i.optionsSnapshot.length!==4||new Set(i.optionsSnapshot.map(o=>o?.id)).size!==4||!i.optionsSnapshot.every(o=>o&&i.optionIds.includes(o.id)&&typeof o.text==='string')))return false;seen.add(q.id);return true;});
}
function expired(s,now=Date.now()){return s?.mode==='exam'&&!s.finishedAt&&now>=s.deadline;}
function remaining(s,now=Date.now()){return Math.max(0,Math.ceil((s.deadline-now)/1000));}
function finish(s,now=Date.now(),reason='manual'){if(s.finishedAt)return false;if(s.mode!=='exam'&&s.items.some(i=>!i.selectedId||(['learn','review'].includes(s.mode)&&!i.locked)))return false;s.finishedAt=s.mode==='exam'&&now>=s.deadline?s.deadline:now;s.finishReason=s.mode==='exam'&&now>=s.deadline?'timeout':reason;return true;}
function choose(s,id,questions,now=Date.now()){if(expired(s,now)){finish(s,now);return false;}if(s.finishedAt||s.items[s.index].locked)return false;C.answer(s,id,questions);return true;}
function check(s,now=Date.now()){if(s.finishedAt||!['learn','review'].includes(s.mode))return false;const i=s.items[s.index];if(!i.selectedId||i.locked)return false;i.locked=true;return true;}
function advance(s,now=Date.now()){if(expired(s,now)){finish(s,now);return true;}if(s.finishedAt)return false;const i=s.items[s.index];if(s.mode!=='exam'&&(!i.selectedId||(['learn','review'].includes(s.mode)&&!i.locked)))return false;if(s.index===s.count-1)return finish(s,now);s.index++;return true;}
function analytics(history,questions,subjects){const scored=history.filter(s=>!['learn','review'].includes(s.mode));const lookup=new Map(questions.map(q=>[q.id,q]));const rows=subjects.map(s=>({id:s.id,title:s.title,answered:0,correct:0,unanswered:0,seen:new Set()}));const bySubject=new Map(rows.map(r=>[r.id,r]));for(const s of scored){for(const i of s.items){const q=lookup.get(i.questionId),r=q&&bySubject.get(q.subjectId||'cpu');if(!r)continue;if(i.selectedId===null){r.unanswered++;continue;}r.answered++;r.correct+=Number(i.selectedId===q.correctOptionId);r.seen.add(q.id);}}return rows.map(r=>({...r,seen:r.seen.size,percent:r.answered?Math.round(r.correct/r.answered*100):null}));}
return{filter,progress,reviewPool,reviewSelect,create,valid,expired,remaining,finish,choose,check,advance,analytics};
});
