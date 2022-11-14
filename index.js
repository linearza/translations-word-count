// const translationsDir = '../dentally/config/locales';
const translationsDir = '../dentally/spec/fixtures/locales';
const fs = require('fs');
const path = require('path');

function textFromJson(json) {
  if (json === null || json === undefined) return '';
  if (!Array.isArray(json) && !Object.getPrototypeOf(json).isPrototypeOf(Object)) return '' + json;
  
  const obj = {};

  for (const key of Object.keys(json)) {
      obj[key] = textFromJson(json[key]);
  }

  return Object.values(obj).join(' ');
}

function stripWhitespace(wordArray){
  return wordArray.split(/(\s+)/).filter( e => e.trim().length > 0)
}

function excludeVariables(wordArray){
   const variableRegex = /{([^}]+)}/
   return wordArray.filter( w => !w.match(variableRegex) )
}

function getJsonWordCount(json) {
  const wordArray = textFromJson(json)
  const trimmedWordArray = stripWhitespace(wordArray)
  const noVariableWordArray = excludeVariables(trimmedWordArray)
  return noVariableWordArray.length
}

function *walkSync(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(dir, file.name));
    } else {
      yield {
        path: path.join(dir, file.name),
        source: file,
        extension: path.extname(file.name)
      };
    }
  }
}

for (const file of walkSync(translationsDir)) {


  if (file.extension === '.json') {
    fs.readFile(file.path, "utf8", (err, jsonString) => {
      if (err) {
        console.log("File read failed:", err);
        return;
      }

      const count = getJsonWordCount(JSON.parse(jsonString))

      console.log(file.path, count)
    });
  } 
}