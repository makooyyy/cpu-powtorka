const fs=require('node:fs');const path=require('node:path');const Core=require('../core.js');
const file=path.join(__dirname,'../data/questions.json');const data=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));Core.validate(data.questions);
fs.writeFileSync(path.join(__dirname,'../data/questions.js'),'/* Generated from questions.json */\nwindow.CPU_DATA = '+JSON.stringify(data)+';\n');console.log(`Built ${data.questions.length} questions.`);
