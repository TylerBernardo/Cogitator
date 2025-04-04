const express = require('express')
const fs = require("node:fs/promises")
const eh = require("express-handlebars")
//import {engine} from 'express-handlebars'
const app = express()
const port = 3000

var factions = [
    "Aeldari - Aeldari Library.cat",
    "Aeldari - Craftworlds.cat",
    "Aeldari - Drukhari.cat",
    "Aeldari - Ynnari.cat",
    "Chaos - Chaos Daemons Library.cat",
    "Chaos - Chaos Daemons.cat",
    "Chaos - Chaos Knights Library.cat",
    "Chaos - Chaos Knights.cat",
    "Chaos - Chaos Space Marines.cat",
    "Chaos - Death Guard.cat",
    "Chaos - Thousand Sons.cat",
    "Chaos - Titanicus Traitoris.cat",
    "Chaos - World Eaters.cat",
    "Genestealer Cults.cat",
    "Imperium - Adepta Sororitas.cat",
    "Imperium - Adeptus Custodes.cat",
    "Imperium - Adeptus Mechanicus.cat",
    "Imperium - Adeptus Titanicus.cat",
    "Imperium - Agents of the Imperium.cat",
    "Imperium - Astra Militarum - Library.cat",
    "Imperium - Astra Militarum.cat",
    "Imperium - Black Templars.cat",
    "Imperium - Blood Angels.cat",
    "Imperium - Dark Angels.cat",
    "Imperium - Deathwatch.cat",
    "Imperium - Grey Knights.cat",
    "Imperium - Imperial Fists.cat",
    "Imperium - Imperial Knights - Library.cat",
    "Imperium - Imperial Knights.cat",
    "Imperium - Iron Hands.cat",
    "Imperium - Raven Guard.cat",
    "Imperium - Salamanders.cat",
    "Imperium - Space Marines.cat",
    "Imperium - Space Wolves.cat",
    "Imperium - Ultramarines.cat",
    "Imperium - White Scars.cat",
    "Leagues of Votann.cat",
    "Library - Astartes Heresy Legends.cat",
    "Library - Titans.cat",
    "Necrons.cat",
    "Orks.cat",
    "T'au Empire.cat",
    "Tyranids.cat"
]

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
    var data = await getAllUnitData()
    data["Factions"] = factions
    res.render('viewUnits.handlebars',data)
})

app.post('/set', async (req,res) => {
    var q = req.body;
    setUnitData(q.attackerName,q.defenderName,q.fAttacks,q.fWS,q.fStrength,q.fAP,q.tToughness,q.tSave,q.tISave,q.keywords)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})