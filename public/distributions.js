//TODO:
//write testing tools
// * tool that runs simulations and then compares results to the distribution, outputting the mean error over all outcomes
// * tool that adjusts iterations of aproximations to determine accuracy and runtime impact of certain combinations. Can use this to find when upping parameters just isnt worth it
//large attack counts seem to diverge from expected results. the ammount of iterations needed seems to scale with the number of attacks. Write code to gather data to figure out how the error grows, since increasing iterations by a factor of N divides the error by N
//make formula that combines lethal,sustained, and some rerolls. Lethalhits can just be added with a variable to toggle it on and off, sustained hits N can be modified into the mean result code
//try and rewrite the mean->poisson->binomial setup as a percentage modifier on that individual roll. Dont require change of entire setup for those specific cases


//generic BinomialDistribution class for probability usage
class BinomialDistribution{

    constructor(trials, p,iterations){
        this.trials = trials;
        this.p = p;
        this.f = [1,1]
        this.lf = [0,0]
        this.iterations = iterations
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
        var ITERATIONS = 100;
        var continuedF = this.getCoeff(ITERATIONS,n,a,b)
        for(var i = ITERATIONS-1; i >=1; i--){
            continuedF = this.getCoeff(i,n,a,b) /(1+continuedF);
        }
        //20000*Math.round(this.trials/24)
        return output * 1/(1+continuedF) * 1/this.beta(a,b,this.iterations);
    }
    //function used for integration in cdf
    toInt(t,k){
        return (t**(this.trials - k - 1)) * (1-t)**k
    }
    //not currently used
    oldCdf(x){
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

    cdf(x){
        if(x == 0){
            return 1
        }
        //return 1-this.biDist.cdf(x-1)
        var a = this.trials - x + 1;
        var b = x;
        var n = 1 - this.p;
        return 1-this.incompleteBeta(a,b,n)///this.beta(a,b,1000)
    }

    pdf(x){
        return this.nCr(this.trials,x) * (this.p**x) * ((1-this.p)**(this.trials-x));
    }
}
//https://en.wikipedia.org/wiki/Poisson_binomial_distribution
//works acording to test from https://github.com/tsakim/poibin/blob/master/test_poibin.py
class PoissonBinomialDist{
    pdfList = [1]
    std = -1;
    samples = []
    h = -1;
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
        //calculate the standard deviation of the distribution
        var sum = 0;
        for(var i = 0; i < this.probs.length; i++){
            sum += (1-this.probs[i]) * this.probs[i]
        }
        this.std = Math.sqrt(sum)
        console.log("Done!")
    }

    contPdf(x,h){
        if(h == undefined){
            h = this.h
        }
        var frontCoEff = 1/(this.samples.length * h * this.std * Math.sqrt(2*3.1415))
        var sum = 0;
        for(var i = 0; i < this.samples.length; i++){
            sum += Math.exp(-Math.pow((x-this.samples[i]),2)/(2 * Math.pow(h * this.std,2)))
        }
        return sum * frontCoEff
    }

    pdf(x){
        return this.pdfList[x];
    }
    //https://en.m.wikipedia.org/wiki/Kernel_density_estimation
    createContPDF(points){
        //generate a list of samples to use in aproximating the pdf
        var counts = []
        var total = 0;
        for(var i = 0; i <= this.probs.length; i++){
            counts[i] = Math.round(points * this.pdf(i))
            total += counts[i]
            this.samples = this.samples.concat(Array(counts[i]).fill(i))
        }
        //pick an appropriate H value
        var best = Infinity;
        var bestH = -1;
        for(var i = 0.01; i < 1; i += .0001){
            //pointsToSample.push(i);
            var averageError = 0;
            for(var t = 0; t <= this.probs.length; t++){
                averageError += Math.abs(this.contPdf(t,i) - this.pdf(t))/(this.probs.length+1)
            }
            if(averageError < best){
                best = averageError
                bestH = i;
            }
        }
        console.log(best)
        console.log(bestH)
        this.h = bestH
    }

    samplePdf(){

    }
}

class GeneralizedPoissonBinomialDist{
    probs = []
}

//console.log(test.contPdf(2,.48))
//console.log(test.pdf(2))

//TODO: invetigate slight difference in CDF between desmos and code
//create a distribution for a warhammer combat where you roll *numDice* dice that hit on *toHit*, wound on *toWound* versus an armor save of *armorSave*
class DiceDistribution{

    //alternative constructor that just takes the combined chance as a parameter
    constructor(numDice,diceSides,combinedChance,iterations){
        this.numDice = numDice;
        this.diceSides = diceSides;
        this.combinedChance = combinedChance;
        this.biDist = new BinomialDistribution(numDice,this.combinedChance,iterations)
    }

    //calculate the percentage of getting x or more succesful wounds
    cdf(x){
        return this.biDist.cdf(x)
    }

    pdf(x){
        return this.biDist.pdf(x)
    }
    
    //sample points from the cdf function that are each space *deltaX* from eachother. The coordinates are shifted for the graphing library
    sampleCdf(deltaX){
        var pointsx = []
        var pointsy = []
        for(var x = 0; x <= this.numDice; x+=deltaX){
            var toPush = this.biDist.cdf(x)
            //stop printing once the percentage is so small to be negligiable
            if(Math.abs(toPush) < .0001){
                break;
            }
            pointsx.push(x)
            pointsy.push(toPush)
        }
        return [pointsx,pointsy];
    }

    samplePdf(){
        var pointsx = []
        var pointsy = []
        var mean = this.biDist.average();
        for(var x = 0; x <= this.numDice; x++){
            var toPush = this.biDist.pdf(x)
            //stop printing once the percentage is so small to be negligiable
            if(x > mean && Math.abs(toPush) < .0001){
                break;
            }
            pointsx.push(x)
            pointsy.push(toPush)
        }
        return [pointsx,pointsy]
    }

}

var KEYWORDS = ["Sustained Hits 1", "Lethal Hits", "Reroll All Fails", "Reroll all non 6's", "Devastating Wounds"]

function createCombatDist(numDice,diceSides,toHit,toWound,armorSave,iterations,keywords){
    var hitChance = (diceSides-toHit+1)/diceSides;
    var woundChance = (diceSides-toWound+1)/diceSides
    var saveChance = (armorSave-1)/diceSides
    var combinedChance = saveChance * woundChance * hitChance;
    var modifier = 1;
    console.log(keywords)
    if(keywords.includes("Sustained Hits 1")){
        modifier += 1/(6 * hitChance)
        numDice += numDice;
    }
    if(keywords.includes("Lethal Hits")){
        modifier += (1-woundChance)/(6*hitChance*woundChance)
    }
    if(keywords.includes("Devastating Wounds")){
        modifier = modifier * (1 + (1/(6 * woundChance * saveChance)) - (1/(6*woundChance)))
    }
    if(keywords.includes("Reroll All Fails")){
        modifier = modifier * (2-hitChance);
    }
    if(keywords.includes("Reroll all non 6's")){
        modifier = modifier * (11/6.0) + (1/(6*hitChance)) - 1
    }
    console.log(modifier)
    if(keywords.includes("Sustained Hits 1")){
        modifier = modifier/2;
        iterations = iterations*4
    }
    return new DiceDistribution(numDice,diceSides,combinedChance * modifier,iterations) 
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

function testNTimes(numDice,n,iterations){
    var average = 0;
    for(var i = 0; i < n; i++){
        var toHit = Math.floor(Math.random() * (6 - 2) + 2)
        var toWound = Math.floor(Math.random() * (6 - 2) + 2);
        var armorSave = Math.floor(Math.random() * (6 - 2) + 2)
        var dist = createCombatDist(numDice,6,toHit,toWound,armorSave,iterations)
        var error = testDistribution(dist,300000)
        //console.log("The error for hitting on " + toHit + ", wounding on " + toWound + ", and saving on " + armorSave + " is " + error)
        average += error/n;
    }
    return average;
}

function timeAccuracyProfiling(startI, endI, deltaI){
    var results = []
    for(var i = startI; i <= endI; i += deltaI){
        var startTime = performance.now()
        var avgError = testNTimes(60,10,i)
        var endTime = performance.now()
        results.push([(endTime-startTime)/10,avgError])
    }
    console.log(results)
    return results;
}

function woundRoll(s,t){
    if(s >= 2 * t){
        return 2;
    }

    if(s > t){
        return 3;
    }

    if(s == t){
        return 4
    }

    if(s * 2 <= t){
        return 6
    }

    return 5;
}