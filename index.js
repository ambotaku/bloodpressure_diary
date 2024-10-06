const express = require('express');
const pug = require("pug")
const path = require('path')
const csvToJson = require('convert-csv-to-json')

file = './bloodPressure.csv';
device = 1;

if (process.argv.length != 4) {
  console.error('call: node datafile.cvs [-o|-w]\n-o Omron CSV file\n-w Withings CSV file\n');
  process.exit(1);
} else {
  file = process.argv[2];

  switch (process.argv[2][1]) {
    case 'w':
      device = 2;
    default:
      device = 1;
  }
  console.log("parsing file %s from %d", file, device);
}

const app = express();

let json = csvToJson.fieldDelimiter(';').parseSubArray('*',',')
  .getJsonFromCsv(path.join(__dirname, file));

let timestamps = new Set()
let values = [];

let firstDate= ''
let lastDate= ''


for (let idx=0; idx < json.length; idx++) {
    switch(device) {
      case 2:
        firstDate = new Date(json[0].Date).toLocaleDateString();
        lastDate = new Date(json[json.length-1].Date).toLocaleDateString();
                const dt = new Date(json[idx].Date).toLocaleString();
        timestamps.add(dt)

        if (timestamps.has(dt)) continue
          values.push({
          Date: dt, 
          Sys: Number(json[idx].SYS), 
          SysFont: sysFontWeight(json[idx].SYS),
          Dia: Number(json[idx].DIA), 
          DiaFont: diaFontWeight(json[idx].DIA),
          Puls: Number(json[idx].BPM),
          Remark: json[idx].REM
        })
        break;
      default:
        firstDate = json[json.length-1].Date
        lastDate = json[0].Date

        values.push({
          Date: json[idx].Date,
          Time: json[idx].Time, 
          Sys: Number(json[idx].SYS), 
          SysFont: sysFontWeight(json[idx].SYS),
          Dia: Number(json[idx].DIA), 
          DiaFont: diaFontWeight(json[idx].DIA),
          Puls: Number(json[idx].BPM),
          Remark: json[idx].REM
        })
        break;
    }
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

app.get('/', (req, res) => res.render('table_'+device.toString(), { 
    title: 'Bloodpressure Diary', days: values, 
    firstDate: firstDate, lastDate: lastDate,
    minSys: minSys, maxSys: maxSys, avgSys: avgSys,
    minDia: minDia, maxDia: maxDia, avgDia: avgDia,
    minPuls: minPuls, maxPuls: maxPuls, avgPuls: avgPuls
}));

app.listen(8000, () => console.log('browse http://localhost:8000 for result'))

function sysFontWeight(num) {
  if (num < 130) {
    return 200
  } else if (num < 140) {
    return 400
  } else {
    return 600
  }
}

function diaFontWeight(num) {
  if (num < 85) {
    return 200
  } else if (num < 90) {
    return 400
  } else {
    return 600
  }
}
