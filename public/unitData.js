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

var parser = new DOMParser()
var xmlDoc;
//console.log("test")
(async () =>{
    var randomFaction = URL + encodeURIComponent(factions[23])//URL + encodeURIComponent(factions[Math.floor(Math.random()*factions.length)])
    console.log(randomFaction)
    
    var factionRes = await fetch(randomFaction)
    var factionText = await factionRes.text()
    xmlDoc = parser.parseFromString(factionText,"text/xml")
    console.log(xmlDoc)
    console.log(xmlDoc)
    var units = xmlDoc.querySelectorAll('selectionEntry[type="unit"]')
    console.log(units[Math.floor(Math.random() * units.length)])
})()
