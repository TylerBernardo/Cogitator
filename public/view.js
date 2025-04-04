function onload(){
    console.log("test")
    document.getElementById("aFaction").onchange = onFactionChange
    document.getElementById("dFaction").onchange = onFactionChange
    document.getElementById("aUnits").onchange = updatePreview
    document.getElementById("dUnits").onchange = updatePreview
}

attackerCodex = null
defenderCodex = null

function onFactionChange(e){
    var newFaction = e.target.value
    if(newFaction == ""){
        //user has selected the "Choose a Faction" option
        //TODO: set relevant global codex to null
        return
    }
    //determine which dropdown needs new choices
    if(e.target.id == "aFaction"){
        //we want to update attacker info
        attackerCodex = new Codex(null,newFaction.split(".")[0])
        updateUnitNames(document.getElementById("aUnits"),attackerCodex.getUnitNames())
    }else{
        defenderCodex = new Codex(null, newFaction.split(".")[0])
        updateUnitNames(document.getElementById("dUnits"),defenderCodex.getUnitNames())
    }
}

function updateUnitNames(target,names){
    target.innerHTML = ""
    for(var name of names){
        var option = new Option()
        option.value = name
        option.text = name
        target.appendChild(option)
    }
}

function updatePreview(){
    document.getElementById("preview").innerHTML = ""
    var aUnit = document.getElementById("aUnits").value
    var dUnit = document.getElementById("dUnits").value

    var aSquad = attackerCodex.getUnit(aUnit)
    var dSquad = defenderCodex.getUnit(dUnit)

    createCombatPreview(aSquad,dSquad,document.getElementById("preview"))
}