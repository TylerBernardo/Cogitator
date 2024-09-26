//Tyler Bernardo, September 2024

//create a distribution for a warhammer combat where you roll *numDice* dice that hit on *toHit*, wound on *toWound* versus an armor save of *armorSave*
class DiceDistribution{
    constructor(numDice,diceSides,toHit,toWound,armorSave){
        this.numDice = numDice;
        this.diceSides = diceSides;
        this.hitChance = (diceSides-toHit+1)/diceSides;
        this.woundChance = (diceSides-toWound+1)/diceSides;
        this.armorFailChance = (armorSave-1)/diceSides;
        this.combinedChance = this.hitChance * this.woundChance * this.armorFailChance;
        this.f = [];
    }
    //compute the factorial of a number, indexing the result to use later
    factorial(n){
    if (n == 0 || n == 1){
        return 1;
    }
    if (this.f[n] > 0)
        return this.f[n];
    return this.f[n] = this.factorial(n-1) * n;
    }
    //calcualte N Choose R
    nCr(n,r){
        return this.factorial(n)/(this.factorial(r) * this.factorial(n-r))
    }
    //calculate the average number of succesful wounds
    average(){
        return this.numDice * this.combinedChance
    }
    //calculate the probability of getting a specific number of succesful wounds
    pdf(x){
        if(x < 0 || x > this.numDice){
            return 0;
        }
        return this.nCr(this.numDice,x) * (this.combinedChance**x) * (1-this.combinedChance)**(this.numDice-x)
    }
    //get the nth coefficent for the continued fraction used in incompleteBeta()
    getCoeff(n,x,a,b){
        if(n==0){return 1;}
        if(n%2==1){
            var m = (n-1)/2
            return -1 * ( ( a + m ) * ( a + b + m ) * x )/( (a + 2 * m) * ( a + 2*m + 1 ) )
        }
        var m = n/2;
        return ( m * (b-m) * x )/( (a + 2 * m - 1) * (a + 2 * m) )
    }


    //estimate beta(x,y) using a certain number of iterations
    beta(x,y,iterations){
        var output = (x+y)/(x*y);
        for(var k = 1; k < iterations; k++){
            output = output * (1 + (x + y)/k)/( (1+x/k) * (1+y/k))
        }
        return output;
    }

    //https://jamesmccaffrey.wordpress.com/2022/07/01/computing-the-incomplete-beta-function-from-scratch-in-excel/
    //calculate the beta(a,b,n) using a continued fraction
    incompleteBeta(a,b,n){
        if(n > (a+1)/(a+b+2)){
            return 1 - this.incompleteBeta(b,a,1-n);
        }
        //calculate the part before the continued fraction
        var output = ((n**a) * ((1-n)**b))/a
        var ITERATIONS = 1000;
        var continuedF = this.getCoeff(ITERATIONS,n,a,b)
        for(var i = ITERATIONS-1; i >=1; i--){
            continuedF = this.getCoeff(i,n,a,b) /(1+continuedF);
        }
        return output * 1/(1+continuedF) * 1/this.beta(a,b,20000);
    }
    //calculate the percentage of getting x or more succesful wounds
    cdf(x){
        var a = this.numDice - x + 1;
        var b = x;
        var n = 1 - this.combinedChance;
        return 1-this.incompleteBeta(a,b,n)///this.beta(a,b,1000)
    }
    
    //sample points from the cdf function that are each space *deltaX* from eachother. The coordinates are shifted for the graphing library
    sampleCdf(deltaX){
        var points = []
        for(var x = 0; x <= 24; x+=deltaX){
            points.push([420*x/24,420-420*this.cdf(x)]);
        }
        return points;
    }

}

var test = new DiceDistribution(24,6,2,2,3)
console.time("first")
test.cdf(24)
console.timeEnd("first")
for(var i = 0; i <= 24; i++){
    console.log("Probability of " + i + ":" + test.pdf(i))
    console.log("Calculated CDF of " + i + ":" + test.cdf(i))
}

//console.log(JSON.stringify(test.sampleCdf(.1)))

// Set Dimensions
const xSize = 500; 
const ySize = 500;
const margin = 40;
const xMax = xSize - margin*2;
const yMax = ySize - margin*2;

// Create Random Points
console.time("createData")
const data = test.sampleCdf(.01);
console.timeEnd("createData")
console.log(data)
const numPoints = data.length;
console.log(numPoints)

// Append SVG Object to the Page
const svg = d3.select("#myPlot")
  .append("svg")
  .append("g")
  .attr("transform","translate(" + margin + "," + margin + ")");

// X Axis
const x = d3.scaleLinear()
  .domain([0, 24])
  .range([0, xMax]);

svg.append("g")
  .attr("transform", "translate(0," + yMax + ")")
  .call(d3.axisBottom(x));

// Y Axis
const y = d3.scaleLinear()
  .domain([0, 1])
  .range([ yMax, 0]);

svg.append("g")
  .call(d3.axisLeft(y));

// Dots
svg.append('g')
  .selectAll("dot")
  .data(data).enter()
  .append("circle")
  .attr("cx", function (d) { return d[0] } )
  .attr("cy", function (d) { return d[1] } )
  .attr("r", 3)
  .style("fill", "Red");
