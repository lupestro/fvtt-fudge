
const Datastore  = require("nedb");
const fs = require("fs");
const path = require("path");

const packname=process.argv[2];

const PACK_DIR='packs';
const packFilename = path.join(PACK_DIR, `${packname}.db`);
console.log("Packfile:", packFilename);

const realDB = new Datastore({filename: packFilename, autoload: true});
//  realDB.findOne({name: data.name}, (err, entry) => {
//    if ( entry ) {
//      return entry._id);
//    } else {
//      return realDB.createNewId());
//    }
//  });
  
//const db = fs.createWriteStream(packFilename, {flags: "a", mode: 0o664});
const files = fs.readdirSync(path.join(PACK_DIR, 'src', packname), {withFileTypes: true})
    .filter((file) => file.name.endsWith('.json')).map(dirent => dirent.name);
console.log('Files:',files);
for (const file of files) {
  const filedata = JSON.parse(fs.readFileSync(path.join(PACK_DIR,'src',packname,file),{encoding:'utf-8'}));
  filedata._id = realDB.createNewId();
  filedata.folder = "";
  realDB.insert(filedata);
  //console.log(filedata);
  //break;
  //db.write(`${JSON.stringify(filedata)}\n`)
}




