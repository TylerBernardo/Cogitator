//Tyler Bernardo, September 2024


var currentCdfGraph = null;

function createChartFromData(data1,data2,element,type1,type2,subdivisions){
    var barChartData = []
    data2[1].forEach(element => {barChartData.push(element);for(var i = 0; i < subdivisions - 1; i++){barChartData.push(0);};})
    var toReturn = new Chart(
        element,
        {
            data:{
                datasets: [{
                    type:type2,
                    data:barChartData,//data2[1],
                    label:"PDF"
                },{
                    label:"CDF",
                    type:type1,
                    data: data1[1],
                    pointRadius: data1[0].map(x => ((x * subdivisions) % subdivisions == 0) ? 5 : 0),
                    pointHitRadius: data1[0].map(x => ((x * subdivisions) % subdivisions == 0) ? 20 : 0)
                }],

                labels: data1[0]
            },
            options:{
                interaction: {
                    intersect: true,
                    mode: 'index',
                },
                maintainAspectRatio: false,
                scales:{
                    x:{
                        //min:0,
                        //max:24,
                        //labels:Array.from(Array(25).keys())
                        //stepSize:1
                        beginAtZero: true,
                        ticks:{
                            callback: function(value,index,ticks) {
                                if(value % subdivisions == 0){
                                    return (value/subdivisions)
                                }
                                return "";
                            }
                        }
                    }
                },
                legend:{
                    display:false
                },
               plugins:{
                tooltip: {
                    position:'nearest',
                    filter: function (tooltipItem, tooltipIndex, tooltipItems, data) {
                        return  tooltipItem.dataIndex % subdivisions == 0;
                    },

                    callbacks:{
                        label: function (context){
                            let label = context.dataset.label || '';
    
                            if(label == "CDF"){
                                return context.label + "+" + ": " + Math.round(context.raw * 1000)/10 + "%"
                            }
                            return context.label + ": " + Math.round(context.raw * 1000)/10 + "%"
                        },
                        title(context){
                            return ""
                        }
                    }
                    
                 }
               }
            }
            
        }
    )
    return toReturn
}

function createGraph(){
    //if a graph already exists, destroy it
    var formData = new FormData(document.getElementById("simDataForm"))
    var data = Object.fromEntries(formData.entries());
    if(data.fAP == "" || data.fAttacks == "" || data.fStrength == "" || data.fWS == "" || data.tSave == "" || data.tToughness == ""){
        alert("Please fill out all required fields")
        return;
    }
    if(currentCdfGraph != null){
        currentCdfGraph.destroy()
    }
    var attacks = parseInt(data.fAttacks)
    var ws = parseInt(data.fWS)
    var armorSave = Math.min(parseInt(data.tSave) + parseInt(data.fAP), (data.tISave != "") ? parseInt(data.tISave) : 7)
    var toWound = woundRoll(parseInt(data.fStrength),parseInt(data.tToughness))
    //figure out which keywords were selected
    var keywords = []
    for(var k of KEYWORDS){
        if(data.hasOwnProperty(k)){
            keywords.push(k)
        }
    }
    //set iterations = 5000* number of attacks. The required number of iterations seems to grow non-linearally, but this linear function gives accurate results up to 100s of attacks
    var distToGraph = createCombatDist(attacks,6,ws,toWound,armorSave,5000 * attacks,keywords)
    var cdfData = distToGraph.sampleCdf(.25);
    var pdfData = distToGraph.samplePdf()
    //create a chart for the CDF of this distribution
    var cdfChart = createChartFromData(cdfData,pdfData,document.getElementById("cdfGraph"),"line","bar",4)
    //create a chart for the PDF of this distribution
    
    //var pdfChart = createChartFromData(pdfData,document.getElementById("pdfGraph"),"bar",1)
    //update the internal variables tracking the current graph
    currentCdfGraph = cdfChart;
}

function saveUnit(){
    var formData = new FormData(document.getElementById("simDataForm"))
    var data = Object.fromEntries(formData.entries());
    if(data.fAP == "" || data.fAttacks == "" || data.fStrength == "" || data.fWS == "" || data.tSave == "" || data.tToughness == ""){
        alert("Please fill out all required fields")
        return;
    }
    data["attackerName"] = prompt("What is the name of the attacking unit?")
    data["defenderName"] = prompt("What is the name of the defending unit?")
    var keywords = []
    for(var k of KEYWORDS){
        if(data.hasOwnProperty(k)){
            keywords.push(k)
        }
    }
    data["keywords"] = keywords
    fetch("/set",{
        method:"POST",
        body:JSON.stringify(data),
        headers:{
            "content-type": "application/json",
        },
    })
}

function onload(){
    console.log("setup")
    //set submit button onclick
    document.getElementById("submit").onclick = (e) => {
        e.preventDefault();
        console.time("makeGraph")
        createGraph()
        console.timeEnd("makeGraph")
    }

    //generate form based on keywords
    var keywordDiv = document.getElementById("keywords")
    var toAutoFill = keywordDiv.dataset.toautofill;
    console.log(toAutoFill)
    if(toAutoFill != ''){
        toAutoFill = JSON.parse(toAutoFill)
    }else{
        toAutoFill = []
    }
    for(var k of KEYWORDS){
        var div = document.createElement('div')
        div.classList.add("modifierInput")
        var radio = document.createElement("input")
        radio.type = "checkbox";
        radio.name = k;
        radio.value = k;
        if(toAutoFill.includes(k)){
            radio.checked = true;
        }
        var label = document.createElement("label")
        label.for = k
        label.textContent = k;
        div.appendChild(label);
        div.appendChild(radio);
        keywordDiv.appendChild(div)
    }
    if(document.getElementById("simDataForm").dataset.autofilled == "true"){
        createGraph();
    }
    //set save button onclick
    document.getElementById("save").onclick = (e) =>{
        e.preventDefault();
        saveUnit();
    }
}

