const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const clientSrcDir = path.join(__dirname, 'client', 'src');

function convertFile(filePath) {
  const ext = path.extname(filePath);
  if (ext !== '.ts' && ext !== '.tsx') return;

  const newExt = ext === '.tsx' ? '.jsx' : '.js';
  const newFilePath = filePath.replace(ext, newExt);

  const sourceFile = ts.createSourceFile(filePath, fs.readFileSync(filePath, 'utf8'), ts.ScriptTarget.ESNext, true, ext === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const printer = ts.createPrinter({ removeComments: false, omitTrailingSemicolon: false, newLine: ts.NewLineKind.LineFeed });
  const output = printer.printNode(ts.EmitHint.SourceFile, sourceFile, sourceFile);
  fs.writeFileSync(newFilePath, output, 'utf8');
  console.log(`Converted ${filePath} to ${newFilePath}.`);
}

function traverse(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      traverse(fullPath);
    } else {
      convertFile(fullPath);
    }
  }
}

if (fs.existsSync(clientSrcDir)) {
  traverse(clientSrcDir);
} else {
  console.error("client/src directory not found.");
} 