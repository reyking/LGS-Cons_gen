import { Personas } from "@prisma/client";
import { GetResult } from "@prisma/client/runtime/library";
import { spawnSync } from "child_process";
import { readdir, readFileSync, unlinkSync, writeFileSync, } from 'fs';
import moment from "moment";
import { join } from 'path';
const latexdir = join('./', 'latex')
const outDir = join(latexdir, `build`)
const args = `-output-directory=${outDir}`
const command = `pdflatex`
const inicio = `\\documentclass{article}
\\usepackage[margin=2cm]{geometry}
\\usepackage{hhline} % For highlighting table borders
\\usepackage{hyperref}
\\usepackage{array}
\\usepackage{xcolor}
\\usepackage{longtable,makecell,multirow}
\\begin{document}`
const fin = `\\end{document}`
const finTabla = `\n    \\end{tabular}\n\\end{table} \n `
const finLongTable = `\n    \\end{longtable} \n `



function createLinkLtx(donde:string | null,nombre?:string):string{
    if(!donde)return '\nNo label\n'
    return ` \\label{${donde}}${nombre?nombre:donde} `
}
function linkToLtx(donde:string | null,nombre?:string):string{
    if(!donde)return '\nNo label\n'
    return ` \\hyperref[${donde}]{\\color{blue}${nombre?nombre:donde}} `
}

function roudUp(val: number) {
    let ret = Math.ceil(val * 100);
    return ret / 100;
}
function sanitizar(str: string) {
    return str.split('_').join('\\_')
}
export function abreviacion(str: string) {
    return str.toUpperCase().split(' ').flatMap(c => c[0]).join('')
}


export function genLtexString(compañias: ({
    Tarifas: (GetResult<{ Id: number; Empresa_id: number; Nombre: string; Valor: number; Valor_id: number; }, never> & {})[]; Historias: ({
        Trabajos: ({ Tarifas: GetResult<{ Id: number; Empresa_id: number; Nombre: string; Valor: number; Valor_id: number; }, never> & {}; Personas_trabajo: ({ Personas: GetResult<{ Id: number; Nombre: string; Nombre_corto: string | null; Empresa_id: number; Correo: string | null; }, never> & {}; } & GetResult<{ Id: number; Persona_id: number; Trabajo_id: number; }, never> & {})[]; } & GetResult<{
            Id: number; Descripcion: string | null; //solo personas unicas
            //solo personas unicas
            Empresa_id: number; Fecha_inicio: Date; Fecha_fin: Date | null; Tarifa_id: number; Historia_id: number | null;
        }, never> & {})[];
    } & GetResult<{ Id: number; Empresa_id: number; Nombre: string; Descripcion: string; }, never> & {})[];
} & GetResult<{ Id: number; Nombre: string; }, never> & {})[]): { name: string, data: string }[] {


    let archivos: { name: string, data: string }[] = [];
    for (const num in compañias) {
        const comp = compañias[num];
        let personas: Personas[] = []

        let latex = {
            tablaHistorias: `
\\section{Historias desarrolladas}
En la siguiente tablas se presentan las historias realizadas y su tiempo total por cada tipo de tarifa

\\begin{table}[htbp]
    \\centering
    \\begin{tabular}{|c|p{3cm}|p{5.8cm}|c|}
        \\hline
        \\textbf{N°} & \\centering{\\textbf{Nombre Historia}} & \\centering{\\textbf{Detalle}} & \\textbf{Tiempo Total [hrs]}
        \\\\ \\hline`,
            tablaTrabajos: `
\\section{Tareas y detalles}
A continuacion se presentan las tareas relizadas con su respectiva explicacion, numero de historia, un acronimo de o las personas involucradas en la realizacion de la tarea si aplica y finalmente un detalle de horas totales trabajadas separado por cada tipo de tarifa.

\\begin{longtable}{|m{0.5cm}|m{1.2cm}|p{6cm}|m{1.5cm}||c|c|c|c||}
        \\hline
        \\multirow{2}{=}{\\centering{\\textbf{N°}}} & \\multirow{2}{=}{\\centering{\\textbf{N°Hist}}} & \\multirow{2}{=}{\\centering{\\textbf{Detalle Tarea}}}  & \\multirow{2}{=}{\\textbf{Personas}} &   
        \\multicolumn{4}{c|}{
            \\textbf{Horas trabajadas[hrs]}
        } \\\\ 
        \\hhline{~~~~----}
        &&&`,
            tablaPersonas: `
\\section{Personas}
Listado de personas y su abreviacion para tareas en las que estubieron involucrados.
\\begin{table}[htbp]
    \\centering
    \\begin{tabular}{|p{6cm}|c|}
        \\hline
        \\centering{\\textbf{Nombre}} & \\textbf{abreviacion} \\\\ \\hline`,
            tablaTarifas: `
\\section{Tarifas}
    en la siguiente tabla se presentan las abreviaciones de cada tarifa.
\\begin{table}[htbp]
    \\centering
    \\begin{tabular}{|p{6cm}|c|}
        \\hline
        \\centering{\\textbf{Nombre}} & \\textbf{abreviacion} \\\\ \\hline `
        }

        let tarifas = `\\begin{tabular}{c}\n`
        comp.Tarifas.forEach((t, ind) => {
            tarifas += ind ? `\\hline ${t.Nombre} \\\\ \n` : `${t.Nombre} \\\\ \n`;
            latex.tablaTarifas += ` ${t.Nombre} & ${createLinkLtx(abreviacion(t.Nombre))} \\\\ \\hline \n`;
            latex.tablaTrabajos += `& ${linkToLtx(abreviacion(t.Nombre))} \n`
        })
        tarifas += `\\end{tabular}`;
        latex.tablaTrabajos += `\\\\ \\hline \\hline`


        for (const hnum in comp.Historias) {
            const hist = comp.Historias[hnum];
            latex.tablaHistorias += `\n ${createLinkLtx(hnum)} & ${sanitizar(hist.Nombre)} & ${sanitizar(hist.Descripcion)} &
            \\begin{tabular}{m{4cm}}\n`;
            let tiempos = new Map<string, number>();

            for (const tnum in hist.Trabajos) {
                const trab = hist.Trabajos[tnum];
                latex.tablaTrabajos += `
                ${createLinkLtx(tnum)} & ${linkToLtx(hnum)} & ${sanitizar(trab.Descripcion as string)} &  
                `
                let n =0;
                for (const pnum in trab.Personas_trabajo) {
                    const pers = trab.Personas_trabajo[pnum].Personas;
                    if (pers) personas.push(pers)
                    if(n > 0) latex.tablaTrabajos += '\\newline'
                    latex.tablaTrabajos += ` ${linkToLtx(pers.Nombre_corto)}`
                    n++;
                }
                const horaInicio = moment(trab.Fecha_inicio);
                const duracion = roudUp(moment(trab.Fecha_fin).diff(horaInicio, "hours", true));
                const texto = trab.Tarifas.Id < 50 ? duracion + ' hrs' : `${horaInicio.format("DD/MM/YY HH:MM")} = ${duracion} hrs`;
                // latex.tablaTrabajos += ` &
                // \\begin{tabular}{m{3cm}}
                //     ${trab.Tarifas.Nombre} \\\\
                //     `+ texto + `
                // \\end{tabular}
                // \\\\ \\hline`
                // latex.tablaTrabajos += `
                // &${duracion}&${duracion}&${duracion}&${duracion}
                // \\\\ \\hline`
                comp.Tarifas.forEach((t, ind) => {
                    latex.tablaTrabajos += ' & '
                    if (t.Id == trab.Tarifa_id)
                    latex.tablaTrabajos += +duracion
                })
                latex.tablaTrabajos += `\\\\ \\hline \n`


                const tiempoTrabajo = tiempos.get(trab.Tarifas.Nombre)
                tiempos.set(trab.Tarifas.Nombre, tiempoTrabajo ? tiempoTrabajo + duracion : duracion);


            }
            let nhh=0;
            for (let [keyt, value] of tiempos) {
                if(nhh)latex.tablaHistorias +='\\hline \\hline\n'
                latex.tablaHistorias += `${keyt} = ${roudUp(value)} \\\\ \n`;
                nhh++;
            }
            latex.tablaHistorias += `
            \\end{tabular} 
            \\\\ \\hline`

        }
        //solo personas unicas
        personas = personas.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.Id === value.Id
            ))
        )
        for (const num in personas) {
            const pers = personas[num];
            latex.tablaPersonas += `
        ${pers.Nombre} & ${createLinkLtx(pers.Nombre_corto)} \\\\ \\hline`
        }
        archivos.push({ name: comp.Nombre, data: inicio + latex.tablaHistorias + finTabla + latex.tablaTrabajos + finLongTable +'\\newpage'+ latex.tablaPersonas + finTabla + latex.tablaTarifas + finTabla + fin })
    }
    return archivos
}

export function executeLatex(latexString: string, name: string) {
    //crear archivo
    const infile = join(latexdir, name + '.tex');
    writeFileSync(infile, latexString, { flag: "w+" });


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
        files.forEach(file => {
            const fileDir = join(outDir, file);
            if (file !== name + '.pdf') {
                unlinkSync(fileDir);
            }
        })
    });
    //retornar archivo


    return readFileSync(join(outDir, name + '.pdf'));

}