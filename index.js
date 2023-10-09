const express = require('express');
const pug = require("pug")
const path = require('path')
const csvToJson = require('convert-csv-to-json')

const app = express();

let json = csvToJson.fieldDelimiter(',').parseSubArray('*',',')
  .getJsonFromCsv(path.join(__dirname, './data/bp3.csv'));

let timestamps = new Set()
let values = [];

const firstDate = new Date(json[0].Date).toLocaleDateString();
const lastDate = new Date(json[json.length-1].Date).toLocaleDateString();

for (let idx=0; idx < json.length; idx++) {
    
    const dt = new Date(json[idx].Date).toLocaleString();
    if (timestamps.has(dt)) continue

    timestamps.add(dt)

    values.push({
      Time: dt, 
      Sys: Number(json[idx].SYS), 
      Dia: Number(json[idx].DIA), 
      Puls: Number(json[idx].BPM)})
}

let sumSys = 0, sumDia = 0, sumPuls = 0
let minSys = 1000, minDia = 1000, minPuls = 1000
let maxSys = 0, maxDia = 0, maxPuls = 0
let avgSys = 0, avgdia = 0, avgPuls = 0

for (let idx=0; idx<values.length; idx++) {
  sumSys += values[idx].Sys
  sumDia += values[idx].Dia
  sumPuls += values[idx].Puls

  if (values[idx].Sys < minSys) minSys = values[idx].Sys
  if (values[idx].Sys > maxSys) maxSys = values[idx].Sys

  if (values[idx].Dia < minDia) minDia = values[idx].Dia
  if (values[idx].Dia > maxDia) maxDia = values[idx].Dia

  if (values[idx].Puls < minPuls) minPuls = values[idx].Puls
  if (values[idx].Puls > maxPuls) maxPuls = values[idx].Puls
}

avgSys = Math.round(sumSys/values.length)
avgDia = Math.round(sumDia/values.length)
avgPuls = Math.round(sumPuls/values.length)

app.set(path.join(__dirname, './views'))
app.set('view engine', 'pug')
app.use(express.static(__dirname));

app.get('/', (req, res) => res.render('table', { 
    title: 'Bloodpressure Diary', days: values, 
    firstDate: firstDate, lastDate: lastDate,
    minSys: minSys, maxSys: maxSys, avgSys: avgSys,
    minDia: minDia, maxDia: maxDia, avgDia: avgDia,
    minPuls: minPuls, maxPuls: maxPuls, avgPuls: avgPuls
}));

app.listen(8000, () => console.log('Test running'))
