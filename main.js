//Tyler Bernardo, September 2024

//TODO:
//Use riemman sum(or better numerical integration technique) for use in cdf
//implement the log_gamma function as an alternative to logFactorial. This allows the riemman sum to actually be used in the cdf (log_gamma allows nCr to be extended to R)
//clamp output of CDF to account for slight numerical errors
//write testing tools
// * tool that runs simulations and then compares results to the distribution, outputting the mean error over all outcomes
// * tool that adjusts iterations of aproximations to determine accuracy and runtime impact of certain combinations. Can use this to find when upping parameters just isnt worth it


//generic BinomialDistribution class for probability usage
class BinomialDistribution{


    constructor(trials, p){
        this.trials = trials;
        this.p = p;
        this.f = [1,1]
        this.lf = [0,0]
    }

    logGamma(x){
        var result = -x * 0.57721566490153286060651209008240243;
        for(var k = 1; k < 20000; k++){
            result += (x/k)-Math.log(1+(x/k))
        }
        return result;
    }

    logFactorial(n){
        //return this.logGamma(n)
        
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
            if( b != 0 && n > (a+1)/(a+b+2)){
                return 1 - this.incompleteBeta(b,a,1-n);
            }
            //calculate the part before the continued fraction
            var output = ((n**a) * ((1-n)**b))/a
            var ITERATIONS = 10;
            var continuedF = this.getCoeff(ITERATIONS,n,a,b)
            for(var i = ITERATIONS-1; i >=1; i--){
                continuedF = this.getCoeff(i,n,a,b) /(1+continuedF);
            }
            return output * 1/(1+continuedF) * 1/this.beta(a,b,10000);
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

            for(var i = 0; i < (1 - this.p); i+=.0001){
                //integral += this.toInt(this.evals[i][0],x) * this.evals[i][1]
                //integral += this.toInt(-1 * this.evals[i][0],x) * this.evals[i][1]
                integral += .0001 * this.toInt(i,x)
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
        if(x == 0){
            return 1
        }
        //return 1-this.biDist.cdf(x-1)
        var a = this.numDice - x + 1;
        var b = x;
        var n = 1 - this.combinedChance;
        return 1-this.biDist.incompleteBeta(a,b,n)///this.beta(a,b,1000)
    }
    
    //sample points from the cdf function that are each space *deltaX* from eachother. The coordinates are shifted for the graphing library
    sampleCdf(deltaX){
        var pointsx = []
        var pointsy = []
        for(var x = 0; x <= 24; x+=deltaX){
            //points.push([x,this.cdf(x)]);
            //points.push([420*x/24,420-420*(1-this.biDist.cdf(x))]);
            pointsx.push(x)
            pointsy.push(this.cdf(x))
        }
        return [pointsx,pointsy];
    }

}

function createCombatDist(numDice,diceSides,toHit,toWound,armorSave){
    var combinedChance = (armorSave-1)/diceSides * (diceSides-toWound+1)/diceSides * (diceSides-toHit+1)/diceSides;
    return new DiceDistribution(numDice,diceSides,combinedChance) 
}

function testDistribution(dist,iterations){
    var results = Array(dist.numDice+1).fill(0)
    for(var i = 0; i < iterations; i++){
        var passes = 0;
        for(var d = 0; d < dist.numDice; d++){
            var roll = Math.random();
            if(roll <= dist.combinedChance){
                passes++;
            }
        }
        results[passes] += 1/iterations;
    }
    var averageError = 0;
    for(var i = 0; i < dist.numDice/2; i++){
        var cdf = 0;
        for(var j = i; j < dist.numDice; j++){
            cdf += results[j]
        }
        results[i] = 2*Math.abs(cdf - dist.cdf(i))/dist.numDice
        averageError += results[i]
    }
    return averageError;
}

function testNTimes(numDice,n){
    var average = 0;
    for(var i = 0; i < n; i++){
        var toHit = Math.floor(Math.random() * (6 - 2) + 2)
        var toWound = Math.floor(Math.random() * (6 - 2) + 2);
        var armorSave = Math.floor(Math.random() * (6 - 2) + 2)
        var dist = createCombatDist(numDice,6,toHit,toWound,armorSave)
        var error = testDistribution(dist,300000)
        console.log("The error for hitting on " + toHit + ", wounding on " + toWound + ", and saving on " + armorSave + " is " + error)
        average += error/n;
    }
    return average;
}

//var poiTest = new PoissonBinomialDist([0.4163448, 0.3340270, 0.9689613]) //new PoissonBinomialDist([3/6,3/6,1/6,1/6])
//poiTest.generatePDF();
//for(var i = 0; i <= 3; i++){
//    console.log(poiTest.pdf(i))
//}


var test = createCombatDist(24,6,3,5,2)
var cdfPoints = []
for(var i = 0; i <= 24; i++){
    //console.log("Probability of " + i + ":" + test.biDist.pdf(i))
    cdfPoints.push(test.cdf(i))
    console.log("Calculated CDF of " + i + ":" + test.cdf(i) + "\n")
    //console.log("Calculated CDF using integral estimate" + (1-test.biDist.cdf(i-1)))
    ///console.log("Error: " + Math.abs(test.cdf(i) - (1-test.biDist.cdf(i-1))))
    console.log("")
}

//console.log(testDistribution(test,100000))
//console.log(testNTimes(24,50))


var dataToGraph = test.sampleCdf(.25);

var myChart = new Chart(
    document.getElementById("cdfGraph"),
    {
        type:"line",
        data:{
            datasets: [{
              data: dataToGraph[1]
            }],

            labels: dataToGraph[0]
        },
        scales:{
            x:{
                min:0,
                max:24,
                ticks:{
                    stepSize:1,
                    beginAtZero:true,
                    precision:0
                }
            }
        }
    }
)

console.log(myChart)

//console.log(JSON.stringify(test.sampleCdf(.1)))

