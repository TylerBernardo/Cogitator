const express = require('express')
const fs = require("node:fs/promises")
const eh = require("express-handlebars")
//import {engine} from 'express-handlebars'
const app = express()
const port = 3000

//returns undefined if unitName is not in the data
async function getUnitData(unitName){
    var file = await fs.readFile('applicationData.JSON',{encoding:'utf-8'})
    var data = JSON.parse(file);
    return data.Units[unitName];
}
//potentially replace with MongoDB in future if time permits
async function setUnitData(_unitName,_attacks,_ws,_strength,_ap,_toughness,_save){
    var file = await fs.readFile('applicationData.JSON',{encoding:'utf-8'})
    var data = JSON.parse(file);
    var unitToAdd = {
        unitName:_unitName,
        attacks:_attacks,
        ws:_ws,
        strength:_strength,
        ap:_ap,
        toughness:_toughness,
        save:_save
    }
    data.Units[_unitName] = unitToAdd;
    fs.writeFile('applicationData.JSON',JSON.stringify(data),{encoding:'utf-8'})
}

app.use(express.static("public"))
app.engine('handlebars',eh.engine())
app.set('view engine','handlebars')

//TODO: Use handlebars to generate the keyword options on the server side
app.get('/', async (req, res) => {
  //res.sendFile("public/index.html");
  res.render('index.handlebars')
})
//TODO: use handlebars to prefill form data with unit info
app.get('/load', async (req,res) => {
    var data = await getUnitData(req.query.unitName)
    data["dataFilled"] = true
    res.render('index.handlebars',data)
})

app.post('/set', async (req,res) => {
    var q = req.body;
    setUnitData(q.unitName,q.attacks,q.ws,q.strength,q.ap,q.toughness,q.save)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})