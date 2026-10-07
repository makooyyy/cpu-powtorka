'use strict';
// Editorial alternatives only. Source questions and answer keys are never rewritten.
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),file=path.join(root,'data/questions.json');
const d=JSON.parse(fs.readFileSync(file,'utf8'));
const map=new Map(fs.readFileSync(path.join(root,'data/distractors-v3.txt'),'utf8').trim().split(/\r?\n/).map(line=>{const [key,...choices]=line.split('|');if(choices.length!==3)throw Error(key);return[key,choices];}));
const sources=new Map(d.sources.map(s=>[s.id,s]));
const compact=new Map(fs.readFileSync(path.join(root,'data/compact-distractors-v3.txt'),'utf8').trim().split(/\r?\n/).map(line=>{const [key,...choices]=line.split('|');if(choices.length!==3)throw Error(key);return[key,choices];}));
let changed=0;
for(const q of d.questions){
 const key=sources.get(q.sourceId).concept;
 let choices=map.get(key);
 if(!choices)continue;
 if(!q.legacyOptions)q.legacyOptions=q.options.map(o=>({...o}));
 const answer=q.options.find(o=>o.id===q.correctOptionId);
 // Short source answers need short alternatives, not three paragraph-length decoys.
 if(answer.text.length<45&&compact.has(key))choices=compact.get(key);
 const incorrect=choices.map((text,i)=>({id:'d'+(i+1),text}));
 if(new Set([answer.text,...choices].map(t=>t.trim().toLowerCase())).size!==4)throw Error('Duplicate '+q.id);
 q.options=[answer,...incorrect];changed++;
}
d.meta.version=3;
d.meta.distractorRevision=3;
d.meta.refinedQuestions=changed;
require('../core.js').validate(d.questions);
fs.writeFileSync(file,JSON.stringify(d,null,2));
require('./build-data.cjs');
console.log(`Refined ${changed} source questions across ${map.size} concepts; original answer keys preserved.`);
