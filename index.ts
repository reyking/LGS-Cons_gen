import { PrismaClient } from '@prisma/client'
import { spawnSync } from "child_process";
import { readdir, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
const latexdir = join(__dirname, 'latex')
const outDir = join(latexdir, `build`)
console.log(outDir)
const file = join(latexdir, `test.tex`)
console.log(file)
const args = `-output-directory=${outDir}`
const command = `pdflatex`
const prisma = new PrismaClient()

function executeLatex(latexString: string, name: string) {
  //crear archivo
  const infile=join(latexdir, name + '.tex');
  writeFileSync(infile, latexString);
  let latex1 = spawnSync(command, [args, infile]);
  if (latex1.status != 0) throw new Error("no se pudo ejecutar  por primera vez latex");
  let latex2 = spawnSync(command, [args, infile]);
  if (latex2.status != 0) throw new Error("no se pudo ejecutar  por primera vez latex");
  //remover aux
  let dir = readdir(outDir, (err, files) => {
    if (err) {
      console.log("no se encontraron archivos auxiliares omitir boracion");
      return;
    }
    files.forEach(file=>{
      const fileDir = join(outDir, file);
        if (file !== name + '.pdf') {
            unlinkSync(fileDir);
        }
    })
  });
  //retornar archivo
  return readFileSync(join(__dirname, 'latex/build/' + name + '.pdf'));
}

async function main() {
  const str = '\\documentclass{article} \\begin{document} hola \\end{document}'
  let pdf = executeLatex(str, 'nuevo');

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })