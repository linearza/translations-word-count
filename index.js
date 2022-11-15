const args = process.argv.slice(2);
const DIRECTORY = args[0];
const EXCLUDE_PATTERNS = args.slice(1);

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function textFromJson(json) {
  if (json === null || json === undefined) return "";
  if (
    !Array.isArray(json) &&
    !Object.getPrototypeOf(json).isPrototypeOf(Object)
  )
    return "" + json;

  const obj = {};

  for (const key of Object.keys(json)) {
    obj[key] = textFromJson(json[key]);
  }

  return Object.values(obj).join(" ");
}

function stripWhitespace(wordArray) {
  return wordArray.split(/(\s+)/).filter((e) => e.trim().length > 0);
}

function excludeVariables(wordArray) {
  const variableRegex = /{([^}]+)}/;
  return wordArray.filter((w) => !w.match(variableRegex));
}

function getJsonWordCount(json) {
  const wordArray = textFromJson(json);
  const trimmedWordArray = stripWhitespace(wordArray);
  const noVariableWordArray = excludeVariables(trimmedWordArray);
  return noVariableWordArray.length;
}

function* walkSync(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(dir, file.name));
    } else {
      yield {
        path: path.join(dir, file.name),
        source: file,
        extension: path.extname(file.name),
      };
    }
  }
}

let totalCount = 0;
let fileCount = 0;

async function processFiles() {
  for (const file of walkSync(DIRECTORY)) {
    if (EXCLUDE_PATTERNS.some((pattern) => file.path.includes(pattern))) continue;

    fileCount += 1;

    if (file.extension === ".json") {
      try {
        const fileData = fs.readFileSync(file.path, "utf8");
        const count = getJsonWordCount(JSON.parse(fileData));

        totalCount += count;

        console.log(file.path, `\t`, count);
      } catch (e) {
        console.log(e);
      }
    } else if (file.extension === ".yml") {
      try {
        const fileData = yaml.load(fs.readFileSync(file.path, "utf8"));
        const count = getJsonWordCount(fileData);

        totalCount += count;

        console.log(file.path, `\t`, count);
      } catch (e) {
        console.log(e);
      }
    } else {
      console.error(file.path, "Unsupported file type!");
    }
  }
}

async function run() {
  if (!DIRECTORY) {
    return console.error('Please provide a directory: npm start [directory] [exclude pattern [optional]]')
  }

  await processFiles();
  console.log("Total words:", totalCount, `\nFiles:`, fileCount);
}

run();
