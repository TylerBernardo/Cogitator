class GeneralizedPoissonBinomialDistribution{
    deltaX = .00001
    constructor(probs,failVals,successVals,terms){
        this.probs = probs
        this.failVals = failVals
        this.successVals = successVals
        this.a = 0//-1 * this.deltaX
        this.b = this.successVals.reduce((accumulator, currentValue) => accumulator + currentValue) //+ this.deltaX
        this.terms = terms
        this.aS = []
        for(var i = 0; i <= terms; i++){
            this.aS.push(this.aSubK(i))
        }
    }

    characteristicFunction(freq){
        var result = math.complex(1,0)
        for(var n = 0; n < this.successVals.length; n++){
            result = math.multiply(result,math.add(math.multiply(1-this.probs[n],math.exp(math.complex(0,freq * this.failVals[n]))),math.multiply(this.probs[n],math.exp(math.complex(0,freq * this.successVals[n])))))
        }
        return result
    }

    aSubK(k){
        var leftHand = this.characteristicFunction(k*math.pi/(this.b-this.a))
        var rightHand = math.exp(math.complex(0,-1*k * math.pi * this.a/(this.b-this.a)))
        return 2/(this.b-this.a) * math.re(math.multiply(leftHand,rightHand))
    }

    filter(x){
        return (1+math.cos(math.pi * x))/2
    }
    

    //TODO: See remark 1 page 8
    cdf(x){
        //var x = math.pi*(input + this.deltaX)/(math.pi + 2 * this.deltaX)
        var result = this.aS[0] * (x - this.a)/2
        for(var k = 1; k <= this.terms; k++){
            result += this.aS[k] * (this.b-this.a)/(k * math.pi) * this.filter(k/this.terms) * math.sin(k * math.pi * (x-this.a)/(this.b-this.a))
        }
        return result
    }

    pdf(x){
        return this.cdf(x+this.deltaX) - this.cdf(x-this.deltaX)
    }
}

var testDist = new GeneralizedPoissonBinomialDistribution([1,1,1,1],[0,0,0,0],[1,1,1,1],256)
var compDist = new BinomialDistribution(2,.5,1000)

for(var i = 0; i <= 4; i++){
    console.log("X=" + (i).toString())
    //console.log(testDist.pdf(i))
    console.log(1-testDist.cdf(i))
    console.log(compDist.cdf(i))
    //console.log(testDist.cdf(i))
}