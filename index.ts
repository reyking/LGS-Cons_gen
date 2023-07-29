import { PrismaClient } from '@prisma/client'
import { exec } from "child_process";
const outDir = `build`
const auxDir = `aux`
const file = `test.tex`
const command= `pdflatex -aux-directory=${auxDir} -output-directory=${outDir} ${file}`
const prisma = new PrismaClient()



async function main() {
  exec(command,(error,stdout,stderr)=>{
    if (error) {
      console.log(`error: ${error.message}`);
      return;
  }
  if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
  }
  console.log(`stdout: ${stdout}`);
  })
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