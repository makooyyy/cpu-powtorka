'use strict';
const fs=require('node:fs'),path=require('node:path'),dir=path.join(__dirname,'../data');
const subjects=JSON.parse(fs.readFileSync(path.join(dir,'subjects.json'),'utf8'));
const banks=subjects.map(s=>JSON.parse(fs.readFileSync(path.join(dir,s.file),'utf8')));
const d={meta:{version:4},subjects:subjects.map((s,i)=>({...s,meta:banks[i].meta})),questions:banks.flatMap((b,i)=>b.questions.map(q=>({...q,subjectId:subjects[i].id}))),issues:banks.flatMap((b,i)=>b.issues.map(q=>({...q,subjectId:subjects[i].id}))),sources:banks.flatMap((b,i)=>b.sources.map(q=>({...q,subjectId:subjects[i].id})))};
for(const k of ['sourceFiles','sourceRecords','readyQuestions','reviewRecords','reviewGroups','mergedRecords'])d.meta[k]=banks.reduce((n,b)=>n+(b.meta[k]||0),0);
require('../core.js').validate(d.questions);
fs.writeFileSync(path.join(dir,'questions.json'),JSON.stringify(d,null,2));
require('./build-data.cjs');
console.log(d.meta);

