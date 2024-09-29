//Tyler Bernardo, September 2024

//TODO:
//modifers to dice
//rerolls? exploding 6's? lethal hits?

//generic BinomialDistribution class for probability usage
class BinomialDistribution{


    constructor(trials, p){
        this.trials = trials;
        this.p = p;
        this.f = [1,1]
        this.lf = [0,0]
    }

    logFactorial(n){
        if(n < 0){
            return 0;
        }
        
        if ( n == 0 || n == 1){
            return 0;
        }
        if (this.lf[n] > 0)
            return this.lf[n];
        return this.lf[n] = this.logFactorial(n-1) + Math.log(n);
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
            return Math.exp(this.logFactorial(n) - (this.logFactorial(r) + this.logFactorial(n-r)))
            //return this.factorial(n)/(this.factorial(r) * this.factorial(n-r))
        }
        //calculate the average number of succesful wounds
        average(){
            return this.trials * this.p
        }
        //calculate the probability of getting a specific number of succesful wounds
        pdf(x){
            if(x < 0 || x > this.trials){
                return -1;
            }
            return this.nCr(this.trials,x) * (this.p**x) * (1-this.p)**(this.trials-x)
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
        
        toInt(t,k){
            return (t**(this.trials - k - 1)) * (1-t)**k
        }

        cdf(x){
            if(x < 0){
                return 0;
            }
            var output = (this.trials - x) * this.nCr(this.trials,x)
            var integral = 0;

            for(var i = 0; i < (1 - this.p); i+=.001){
                //integral += this.toInt(this.evals[i][0],x) * this.evals[i][1]
                //integral += this.toInt(-1 * this.evals[i][0],x) * this.evals[i][1]
                integral += .001 * this.toInt(i,x)
            }

            return output * integral;
        }
}
//https://en.wikipedia.org/wiki/Poisson_binomial_distribution
//works acording to test from https://github.com/tsakim/poibin/blob/master/test_poibin.py
class PoissonBinomialDist{
    pdfList = [1]
    constructor(probs){
        this.probs = probs;
    }

    generatePDF(){
        for(var i = 1; i <= this.probs.length; i++){
            var nextPdfList = Array(i+1).fill(0)
            nextPdfList[0] = (1-this.probs[i-1]) * this.pdfList[0]
            nextPdfList[i] = this.probs[i-1] * this.pdfList[i-1]
            for(var k = 1; k <= i - 1; k++){
                nextPdfList[k] = this.probs[i-1] * this.pdfList[k-1] + (1-this.probs[i-1]) * this.pdfList[k]
            }
            this.pdfList = nextPdfList;
        }
        console.log("Done!")
    }

    pdf(x){
        return this.pdfList[x];
    }
}

//TODO: invetigate slight difference in CDF between desmos and code
//create a distribution for a warhammer combat where you roll *numDice* dice that hit on *toHit*, wound on *toWound* versus an armor save of *armorSave*
class DiceDistribution{

    //alternative constructor that just takes the combined chance as a parameter
    constructor(numDice,diceSides,combinedChance){
        this.numDice = numDice;
        this.diceSides = diceSides;
        this.combinedChance = combinedChance;
        this.biDist = new BinomialDistribution(numDice,this.combinedChance)
    }

    //calculate the percentage of getting x or more succesful wounds
    cdf(x){
        //return 1-this.biDist.cdf(x-1)
        var a = this.numDice - x + 1;
        var b = x;
        var n = 1 - this.combinedChance;
        return 1-this.biDist.incompleteBeta(a,b,n)///this.beta(a,b,1000)
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

function createCombatDist(numDice,diceSides,toHit,toWound,armorSave){
    var combinedChance = (armorSave-1)/diceSides * (diceSides-toWound+1)/diceSides * (diceSides-toHit+1)/diceSides;
    return new DiceDistribution(numDice,diceSides,combinedChance) 
}

//var poiTest = new PoissonBinomialDist([0.4163448, 0.3340270, 0.9689613]) //new PoissonBinomialDist([3/6,3/6,1/6,1/6])
//poiTest.generatePDF();
//for(var i = 0; i <= 3; i++){
//    console.log(poiTest.pdf(i))
//}


var test = createCombatDist(24,6,2,2,3)
var cdfPoints = []
for(var i = 0; i <= 24; i++){
    //console.log("Probability of " + i + ":" + test.biDist.pdf(i))
    cdfPoints.push(test.cdf(i))
    console.log("Calculated CDF of " + i + ":" + test.cdf(i) + "\n")
    console.log("Calculated CDF using integral estimate" + (1-test.biDist.cdf(i-1)))
    console.log("Error: " + Math.abs(test.cdf(i) - (1-test.biDist.cdf(i-1))))
    console.log("")
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
