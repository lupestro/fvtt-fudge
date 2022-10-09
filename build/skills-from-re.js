const fs = require('fs');
const process = require('process');

const SKILL_REGEX = /([^:]*):([^\[\(]*)(\[([^]]*])\])?\(([^)]*)\)/;
const templateFilename = process.argv[2];
const itemFilename = process.argv[3];
const base = process.argv[4] ?? 'ff-skills';

const ROOTDIR = `packs/src/${base}/`;

console.log("Using ", itemFilename, "to build skills based on template", templateFilename, "...");

const templateBuffer = fs.readFileSync(ROOTDIR+templateFilename,{encoding:'utf-8'});
const items = fs.readFileSync(ROOTDIR+itemFilename, {encoding:'utf-8'});

let broken = [];
let rows = items.split('\n');
console.log("Rows: ", rows.length);
let id = 0;
for (let row of rows) {
    if (row.length === 0) continue;
    let lastParen = row.lastIndexOf('(');
    let lastBracket = row.lastIndexOf('[');
    let firstColon = row.indexOf(':');
    if (firstColon === -1 || lastParen === -1) {
        broken.push(row);
        continue;
    }
    let name = row.substring(0, firstColon).trim();
    let grouplist = row.substring(lastParen+1).split(')')[0].trim();
    let level = lastBracket === -1 ? 'Poor' : row.substring(lastBracket+1).split(']')[0].trim();
    let description = lastBracket === -1 ? row.substring(firstColon+1, lastParen) : row.substring(firstColon+1, lastBracket);
    description = description.trim();
    console.log('Row:', row);
    // console.log('Raw Name:', name);
    // console.log('Raw Description:', description);
    // console.log('Raw Level:', level);
    // console.log('Raw Groups:', grouplist);
    groups = grouplist.split(',').map(item => item ? item.trim() : "");
    if (groups.length === 1) {
        groups[1] = "";
    }
    let filename=name.replace(/[\/\s\(\)]/g,'-').toLowerCase().replace("--","-");
    if (filename[filename.length-1] === '-') {
        filename = filename.substring(0, filename.length-1);
    }
    description = description[0].toUpperCase() + description.slice(1);
    const numericLevel = ['Terrible','Poor','Mediocre','Fair','Good','Great','Superb'].indexOf(level) - 3;
    console.log('Name:', name);
    console.log('Description:', description);
    console.log('Filename:', filename);
    console.log('NumericLevel:', numericLevel);
    console.log('Groups: ', groups);
    let idString = "000000000000" + id.toString(16);
    idString = idString.substring(idString.length - 4);
    id++;
    const skilljson = templateBuffer
        .replace('{name}',name)
        .replace('{description}',description)
        .replace('{level}', numericLevel)
        .replace('{group1}', groups[0])
        .replace('{group2}', groups[1])
        .replace('{idprefix}', idString);
    fs.writeFileSync(ROOTDIR+filename + '.json', skilljson, {encoding:'utf-8'});    
}
console.log("Broken Rows:", broken);
