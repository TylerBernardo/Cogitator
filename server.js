const express = require('express')
const fs = require("node:fs/promises")
const eh = require("express-handlebars")
//import {engine} from 'express-handlebars'
const app = express()
const port = 3000


async function getAllUnitData(){
    var file = await fs.readFile('applicationData.JSON',{encoding:'utf-8'})
    return JSON.parse(file);
}

//returns undefined if unitName is not in the data
async function getUnitData(unitName){
    var data = await getAllUnitData()
    return data.Units[unitName];
}
//potentially replace with MongoDB in future if time permits
async function setUnitData(_attackerName,_defenderName,_attacks,_ws,_strength,_ap,_toughness,_save,_invul,_keywords){
    var file = await fs.readFile('applicationData.JSON',{encoding:'utf-8'})
    var data = JSON.parse(file);
    var unitToAdd = {
        attackerName:_attackerName,
        defenderName:_defenderName,
        attacks:_attacks,
        ws:_ws,
        strength:_strength,
        ap:_ap,
        toughness:_toughness,
        save:_save,
        invul:_invul,
        keywords:_keywords
    }
    data.Units[_attackerName + "_vs_" + _defenderName] = unitToAdd;
    fs.writeFile('applicationData.JSON',JSON.stringify(data),{encoding:'utf-8'})
}

app.use(express.static("public"))
app.use(express.json())
app.engine('handlebars',eh.engine())
app.set('view engine','handlebars')


app.get('/', async (req, res) => {
  //res.sendFile("public/index.html");
  res.render('index.handlebars')
})

app.get('/load', async (req,res) => {
    var data = await getUnitData(req.query.unitName)
    data["dataFilled"] = true
    data["toAutoFill"] = JSON.stringify(data.keywords)
    res.render('index.handlebars',data)
})

app.get('/units', async (req,res) => {
    res.render('viewUnits.handlebars',await getAllUnitData())
})

app.post('/set', async (req,res) => {
    var q = req.body;
    setUnitData(q.attackerName,q.defenderName,q.fAttacks,q.fWS,q.fStrength,q.fAP,q.tToughness,q.tSave,q.tISave,q.keywords)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})