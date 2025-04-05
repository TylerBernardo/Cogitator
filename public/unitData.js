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

    constructor(squadEntry,xmlDoc){
        if(typeof(squadEntry) == "string"){
            squadEntry = JSON.parse(squadEntry)
            this.name = squadEntry.name
            this.count = squadEntry.count
            this.min = squadEntry.min
            for(var unit of squadEntry.units){
                this.units.push(new Unit(JSON.stringify(unit)))
            }
        }else{
            this.name = squadEntry.getAttribute("name")
            if(squadEntry.getAttribute("type") == "model"){
                this.count = [1]
                this.units.push(new Unit(squadEntry,null,xmlDoc))
            }else{
                var unitsRaw = squadEntry.querySelectorAll('selectionEntry[type="model"]')
                //console.log(unitsRaw)
                //console.log(unitsRaw[0])
                //include all units with a minimum required count
                //continue adding units until you have hit minimum squad size
                for(var i = 0; i < unitsRaw.length; i++){
                    this.units.push(new Unit(unitsRaw[i],null,xmlDoc))
                }
            }

            if(this.units.length == 0){
                return
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
                if(constraints != null){
                    constraints = constraints.children;
                    for(var i = 0; i < constraints.length; i++){
                        if(constraints[i].tagName == "constraints"){
                            var minE = constraints[i].querySelector('constraint[type="min"]')
                            if(minE == null){
                                this.min = 0; 
                                continue;
                            }
                            this.min = parseInt(minE.getAttribute("value"))
                        }
                    }
                }else{
                    this.min = 0
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

    getAttackerStats(){
        var attackerStats = this.units[0].getAttackerStats()
        attackerStats.weaponProfiles.a = attackerStats.weaponProfiles.a * this.count[0]
        return attackerStats
    }

    getDefenderStats(){
        return this.units[0].getDefenderStats()
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
        if(typeof(profileEntry) == "string"){
            profileEntry = JSON.parse(profileEntry)
            this.name = profileEntry.name
            this.range = profileEntry.range
            this.A = parseInt(profileEntry.A)
            this.WS = profileEntry.WS
            this.S = profileEntry.S
            this.AP = profileEntry.AP
            this.D = profileEntry.D
            this.keywords = profileEntry.keywords
        }else{
            this.name = profileEntry.getAttribute("name")
            profileEntry = profileEntry.querySelector("characteristics")
            try{
                this.range = profileEntry.querySelector('characteristic[name="Range"]').firstChild.data
            }catch{
                this.range = null;
            }
            
            this.A = parseInt(profileEntry.querySelector('characteristic[name="A"]').firstChild.data)
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

    getStats(){
        return {name:this.name,a:this.A,ws:this.WS,s:this.S,ap:this.AP,d:this.D,keywords:this.keywords}
    }
}

//TODO: Figure out if weapons stored in different files are possible to include in datasheets
class Weapon{
    min = 0;
    max = 0;
    name;
    profiles = [];
    collective = false;

    constructor(weaponEntry){
        if(typeof(weaponEntry) == "string"){
            weaponEntry = JSON.parse(weaponEntry)
            this.min = weaponEntry.min
            this.max = weaponEntry.max
            this.name = weaponEntry.name
            this.collective = weaponEntry.collective
            for(var profile of weaponEntry.profiles){
                this.profiles.push(new Profile(JSON.stringify(profile)))
            }
        }else{
            this.name = weaponEntry.getAttribute("name")
            var profilesRaw = weaponEntry.querySelectorAll('profile')
            for(var i = 0; i < profilesRaw.length; i++){
                if(profilesRaw[i].getAttribute("typeName") == "Abilities" || profilesRaw[i].getAttribute("typeName") == "Unit"){
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
            this.collective = "true" == weaponEntry.getAttribute("collective")
        }
    }

    //for now just use the first profile until a smarter way is thought up
    //assume the minimum ammount of a weapon is taken
    getStats(){
        var profileStats = this.profiles[0].getStats()
        profileStats.a = profileStats.a * parseInt(this.min)
        return profileStats
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

    constructor(unitEntry,invul,xmlDoc){
        if(typeof(unitEntry) == "string"){
            unitEntry = JSON.parse(unitEntry)
            this.toughness = unitEntry.toughness
            this.save = unitEntry.save
            this.invul = unitEntry.invul
            this.wounds = unitEntry.invul
            this.modelCount = unitEntry.modelCount
            this.name = unitEntry.name
            this.min = unitEntry.min
            this.max = unitEntry.max
            for(var weapon of unitEntry.weapons){
                this.weapons.push(new Weapon(JSON.stringify(weapon)))
            }
        }else{
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
            
            //start parsing the weapon choices
            var choices = unitEntry.querySelectorAll("selectionEntryGroup")
            for(var i = 0; i < choices.length; i++){
                var defaultId = choices[i].getAttribute("defaultSelectionEntryId")
                if(defaultId == null){
                    defaultId = choices[i].querySelector('selectionEntry')
                    if(defaultId == null){
                        //HANDLE ALT WEAPON HERE
                        continue
                    }else{
                        defaultId = defaultId.getAttribute("id")
                    }
                }
                var selectionE = choices[i].querySelector('selectionEntry[id="' + defaultId + '"]')
                if(selectionE == null){
                    selectionE = choices[i].children[0]
                }
                var newWeapon = new Weapon(selectionE)
                if(newWeapon.collective){
                    newWeapon.min = 1
                }
                this.weapons.push(newWeapon)
            }

            //handle entry links TODO: Handle units with wargear options hidden in entry links
            var links = unitEntry.querySelectorAll("entryLink")
            for(var link of links){
                //handle individual link
                var linkTarget = link.getAttribute("targetId")
                //exclude selection entry groups to avoid crusade info. TODO: Investigate if this is removing any regular game rules
                if(link.getAttribute("type") == "selectionEntryGroup"){
                    continue
                }
                var target = xmlDoc.querySelector('[id="' + linkTarget + '"]')
                if(target == null){
                    console.log(link.getAttribute("name") + "(ID:" + linkTarget + ") could not be found")
                    continue
                }
                //determine which type of object the linked thing is
                if(target.querySelector("profiles") != null){
                    //assume this is a weapon
                    var newWeapon = new Weapon(target)
                    //check for constraints here
                    newWeapon.min = link.querySelector('constraint[type="min"]')
                    if(newWeapon.min != null){
                        newWeapon.min = parseInt(newWeapon.min.getAttribute("value"))
                    }
                    newWeapon.max = link.querySelector('constraint[type="max"]')
                    if(newWeapon.max != null){
                        newWeapon.max = parseInt(newWeapon.max.getAttribute("value"))
                    }
                    this.weapons.push(newWeapon)
                }
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

    getDefenderStats(){
        return {t:this.toughness,s:this.save,i:this.invul,name:this.name}
    }

    //for now just use the first weapon
    getAttackerStats(){
        return {weaponProfiles:this.weapons[0].getStats(),name:this.name}
    }

    
}

//TODO: find way of checking if the book has been updated without just fetching the whole thing
class Codex{
    name = ""
    url = "";
    units = new Object(null)

    constructor(arg,_name){
        if(typeof(arg) == "string"){
            this.url = arg
            this.name = _name
        }else{
            if(arg == null){
                arg = JSON.parse(localStorage.getItem(_name))
            }
            this.url = arg.url
            this.name = arg.name
            for(var unitName in arg.units){
                this.units[unitName] = new Squad(JSON.stringify(arg.units[unitName]))
            }
        }
        
    }


    async populateUnits(){
        var localStorageData = localStorage.getItem(this.name)
        if(localStorageData != null){
            localStorageData = JSON.parse(localStorageData)
            this.name = localStorageData.name
            this.url = localStorageData.url
            for(var unitName in localStorageData.units){
                this.units[unitName] = new Squad(JSON.stringify(localStorageData.units[unitName]))
            }
            return
        }
        var factionRes = await fetch(this.url)
        var factionText = await factionRes.text()
        xmlDoc = parser.parseFromString(factionText,"text/xml")
        //console.log(xmlDoc)
        var entries = xmlDoc.getElementsByTagName("sharedSelectionEntries")
        if(entries.length == 0){
            return
        }
        var units = entries[0].children
        //console.log(units)
        for(var i = 0; i < units.length; i++){
            if(units[i].getAttribute("type") == "model" || units[i].getAttribute("type") == "unit"){
                this.units[units[i].getAttribute("name")] = new Squad(units[i],xmlDoc)
            }
        }
    }

    getUnitNames(){
        return Object.keys(this.units)
    }

    getUnit(name){
        return this.units[name]
    }

    save(){
        localStorage.setItem(this.name,JSON.stringify(this))
    }
}

async function buildCodicies(){
    localStorage.clear();
    for(var i = 0; i < factions.length; i++){
        if(i == 39){
            console.log("doing necrons")
        }
        var newCodex = new Codex(URL + encodeURIComponent(factions[i]),factions[i].split(".")[0])
        await newCodex.populateUnits()
        newCodex.save()
    }
    console.log("done")
}

function createCombatPreview(attacker, defender,target){
    attacker = attacker.getAttackerStats()
    defender = defender.getDefenderStats()

    var data = {
        "attackerName":attacker.name,
        "defenderName":defender.name,
        "attacks":attacker.weaponProfiles.a,
        "ws":attacker.weaponProfiles.ws,
        "strength":attacker.weaponProfiles.s,
        "ap":attacker.weaponProfiles.ap,
        "toughness":defender.t,
        "save":defender.s,
        "invul":defender.i,
        "keywords":attacker.weaponProfiles.keywords
    }

    var dataCard = Handlebars.templates.dataCard(data)
    if(target == null){
        target = document.getElementById("scenarios")
    }
    target.insertAdjacentHTML("beforeend",dataCard)
}

var parser = new DOMParser()
var xmlDoc;
//console.log("test")
(async () =>{
    //var randomFaction = URL + encodeURIComponent(factions[23])//URL + encodeURIComponent(factions[Math.floor(Math.random()*factions.length)])
    //console.log(randomFaction)
    
    var factionRes = await fetch("https://raw.githubusercontent.com/BSData/wh40k-10e/refs/heads/main/Imperium%20-%20Space%20Marines.cat")
    var factionText = await factionRes.text()
    xmlDoc = parser.parseFromString(factionText,"text/xml")
    console.log(xmlDoc)
    /*
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
   //var darkAngels = new Codex(randomFaction, factions[23])
   //await darkAngels.populateUnits()
  // await buildCodicies()
   var necrons = new Codex(null,"Necrons")
   createCombatPreview(necrons.getUnit("C'tan Shard of the Void Dragon"),necrons.getUnit("C'tan Shard of the Deceiver"))
   //var darkAngels = new Codex(JSON.parse(localStorage.getItem(factions[23])))
   //console.log(darkAngels)
   //console.log(darkAngels.getUnitNames())
})()

