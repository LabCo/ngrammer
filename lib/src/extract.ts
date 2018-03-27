import * as nconf from 'nconf'
import * as fs from "fs"
import * as termVector from "term-vector"
import * as natural from "natural"
import * as nlp from 'wink-nlp-utils'
import {NGrammer, CountedPhrase} from "./ngrammer"

interface ParsedReview {
  id?: string,
  userName?: string,
  userUrl?: string,
  version?: string,
  score?: string,
  title?: string,
  text?: string,
  url?: string
}

interface ParseRes {
  id?: number;
  reviews?: ParsedReview[]
}

nconf.argv({
  "f": {
    alias: 'file',
    describe: 'filepath',
    demand: true,
  },
  "n": {
    alias: 'topN',
    describe: 'selct top n from each ngram list',
    default: "50",
  },
  "s": {
    alias: 'stop',
    describe: 'should ommit stop words',
  }
});

const filePath = nconf.get("file")
const topNStr = nconf.get("topN")
const topN = parseInt(topNStr)
const omitStopWords = nconf.get("stop") != null

NGrammer.process(filePath, topN, omitStopWords).then( countedGrams => {

  Object.keys(countedGrams).forEach( key => {
    const countedPhrases = countedGrams[key]
    renderGramGroup(countedPhrases, key);
  })

}).catch(error => {
  console.error("error:", error)
})


function renderGramGroup(phrases: CountedPhrase[], n:string) {
  console.log(`\n*** ${n} PHRASES ***`)
  phrases.forEach( phrase => {
    console.log(`\t${phrase.count}\t'${phrase.phrase}'`)
  })
}