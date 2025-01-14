var URL = 'https://raw.githubusercontent.com/BSData/wh40k-10e/refs/heads/main/'

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

class Squad{
    name;
    count = [];
    units = [];
    min = 0;

    constructor(squadEntry){
        this.name = squadEntry.getAttribute("name")
        if(squadEntry.getAttribute("type") == "model"){
            this.count = [1]
            this.units.push(new Unit(squadEntry))
        }else{
            var unitsRaw = squadEntry.querySelectorAll('selectionEntry[type="model"]')
            //console.log(unitsRaw)
            //console.log(unitsRaw[0])
            //include all units with a minimum required count
            //continue adding units until you have hit minimum squad size
            for(var i = 0; i < unitsRaw.length; i++){
                this.units.push(new Unit(unitsRaw[i]))
            }
        }

        //check if any datasheet stats are stored in the profiles section of the squad entry

        var otherInfo = squadEntry.querySelector('profiles profile[typeName="Unit"]')
        if(otherInfo != null){
            this.units[0].updateStats(otherInfo)
        }
        

        if(squadEntry.getAttribute("type") == "model"){
            this.min = 1
        }else{
            var constraints = squadEntry.querySelector('selectionEntryGroup')
            //this.min = constraints.querySelector('constraint[type="min"]').getAttribute("value")
            //scan to get the constraints group at the base level
            constraints = constraints.children;
            for(var i = 0; i < constraints.length; i++){
                if(constraints[i].tagName == "constraints"){
                    this.min = parseInt(constraints[i].querySelector('constraint[type="min"]').getAttribute("value"))
                }
            }
        }
        
       // console.log(this.units)
        this.count = new Array(this.units.length)
        //now that we have model profiles built, build up the squad to minimum size.
        //start with the minimum required models.
        var total = 0;
        for(var i = 0; i < this.units.length; i++){
            this.count[i] = this.units[i].min
            total += this.count[i]
        }
        if(total < this.min){
            for(var i = 0; i < this.units.length; i++){
                var maxAdded = this.units[i].max - this.units[i].min
                var toAdd = Math.min(this.min - total, maxAdded)
                total+= toAdd
                this.count[i] += toAdd
                if(total >= this.min){
                    break;
                }
            }
        }
        //if that doesnt fill the squad, add models in order listed until min is hit
    }
}

class Profile{
    name;
    range;
    A;
    WS;
    S;
    AP;
    D;
    keywords;

    constructor(profileEntry){
        this.name = profileEntry.getAttribute("name")
        profileEntry = profileEntry.querySelector("characteristics")
        try{
            this.range = profileEntry.querySelector('characteristic[name="Range"]').firstChild.data
        }catch{
            this.range = null;
        }
        
        this.A = profileEntry.querySelector('characteristic[name="A"]').firstChild.data
        try{
            this.WS = profileEntry.querySelector('characteristic[name="WS"]').firstChild.data
        }catch{
            this.WS = profileEntry.querySelector('characteristic[name="BS"]').firstChild.data
        }
       
        this.S = profileEntry.querySelector('characteristic[name="S"]').firstChild.data
        this.AP = profileEntry.querySelector('characteristic[name="AP"]').firstChild.data
        this.D = profileEntry.querySelector('characteristic[name="D"]').firstChild.data
        this.keywords = profileEntry.querySelector('characteristic[name="Keywords"]').firstChild.data
    }

}

class Weapon{
    min = 0;
    max = 0;
    name;
    profiles = []

    constructor(weaponEntry){
        this.name = weaponEntry.getAttribute("name")
        var profilesRaw = weaponEntry.querySelectorAll('profile')
        for(var i = 0; i < profilesRaw.length; i++){
            if(profilesRaw[i].getAttribute("typeName") == "Abilities"){
                continue
            }
            this.profiles.push(new Profile(profilesRaw[i]))
        }
        this.min = weaponEntry.querySelector('constraint[type="min"]')
        if(this.min != null){
            this.min = parseInt(this.min.getAttribute("value"))
        }
        this.max = weaponEntry.querySelector('constraint[type="max"]')
        if(this.max != null){
            this.max = parseInt(this.max.getAttribute("value"))
        }
    }
}

class Unit{
    toughness;
    save;
    invul;
    wounds;
    modelCount;
    name;
    weapons = [];
    min = 0;
    max = 0;

    constructor(unitEntry,invul){
        //console.log(unit)
       //console.log(unitEntry)
        var unit = unitEntry.querySelector('profile[typeName="Unit"]')
        if(unit != null){
            this.updateStats(unit)
        }
        this.invul = invul
        
        //first get all weapons in selection entries, then get them from selectionEntryGroups and make use of the default selection id in the property tag
        var children = unitEntry.children
        var defaultWeapons = null//.getElementsByTagName("selectionEntries")[0]
        var constraints = null; var cFound = false;
        var found = false;
        for(var i = 0; i < children.length; i++){
            //scan to find the selection entry that is a direct child of the unitEntry
            if(children[i].tagName == "selectionEntries"){
                defaultWeapons = children[i]
                found = true;
            }
            if(children[i].tagName == "constraints"){
                constraints = children[i]
                cFound = true;
            }
        }
        if(found){
            defaultWeapons = defaultWeapons.querySelectorAll('selectionEntry[type="upgrade"]')
            for(var i = 0; i < defaultWeapons.length; i++){
                this.weapons.push(new Weapon(defaultWeapons[i]))
            }
        }
        
        //start parsing the weapon choices
        var choices = unitEntry.querySelectorAll("selectionEntryGroup")
        for(var i = 0; i < choices.length; i++){
            var defaultId = choices[i].getAttribute("defaultSelectionEntryId")
            this.weapons.push(new Weapon(choices[i].querySelector('selectionEntry[id="' + defaultId + '"]')))
        }
        //check constraints
        if(cFound){
            var minE = constraints.querySelector('constraint[type="min"]')
            if(minE != null){
                this.min = parseInt(minE.getAttribute("value"))
            }

            var maxE = constraints.querySelector('constraint[type="max"]')
            if(maxE != null){
                this.max = parseInt(maxE.getAttribute("value"))
            }
        }
    }

    updateStats(unit){
        this.name = unit.getAttribute("name")
        unit = unit.querySelector('characteristics')
        this.toughness = unit.querySelector('characteristic[name="T"]').firstChild.data
        this.save = unit.querySelector('characteristic[name="SV"]').firstChild.data
        this.wounds = unit.querySelector('characteristic[name="W"]').firstChild.data
    }
}

class Codex{
    url = "";
    units = new Object(null)

    constructor(arg){
        if(typeof(arg) == "string"){
            this.url = _url
        }else{
            this.url = arg.url
            this.units = arg.units
        }
        
    }

    async populateUnits(){
        var factionRes = await fetch(this.url)
        var factionText = await factionRes.text()
        xmlDoc = parser.parseFromString(factionText,"text/xml")
        //console.log(xmlDoc)
        var units = xmlDoc.getElementsByTagName("sharedSelectionEntries")[0].children
        console.log(units)
        for(var i = 0; i < units.length; i++){
            this.units[units[i].getAttribute("name")] = new Squad(units[i])
        }
    }

    getUnitNames(){
        return Object.keys(this.units)
    }
}

var parser = new DOMParser()
var xmlDoc;
//console.log("test")
(async () =>{
    var randomFaction = URL + encodeURIComponent(factions[23])//URL + encodeURIComponent(factions[Math.floor(Math.random()*factions.length)])
    console.log(randomFaction)
    /*
    var factionRes = await fetch(randomFaction)
    var factionText = await factionRes.text()
    xmlDoc = parser.parseFromString(factionText,"text/xml")
    //console.log(xmlDoc)
    console.log(xmlDoc)
    var units = xmlDoc.getElementsByTagName("sharedSelectionEntries")[0].children//.getElementsByTagName('selectionEntry')//.querySelectorAll('selectionEntry[type="unit"],selectionEntry[type="model"]')
    console.log(units)
    var randomIndex = Math.floor(Math.random() * units.length)
    console.log(randomIndex)
    var pickedEntry = units[randomIndex]

    console.log(pickedEntry)
    var testUnit = new Squad(pickedEntry)
    //testUnit.printUnit()
    console.log(testUnit)
    */
   var darkAngels = new Codex(randomFaction)
   await darkAngels.populateUnits()
   console.log(darkAngels)
   console.log(darkAngels.getUnitNames())
   console.log(JSON.stringify(darkAngels))
})()

