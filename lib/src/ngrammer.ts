import * as nconf from 'nconf'
import * as fs from "fs"
import * as termVector from "term-vector"
import * as nlp from 'wink-nlp-utils'
import * as compromise from "compromise"

export interface ParsedReview {
  id?: string,
  userName?: string,
  userUrl?: string,
  version?: string,
  score?: string,
  title?: string,
  text?: string,
  url?: string
}

export interface ParseRes {
  id?: number;
  reviews?: ParsedReview[]
}

export interface CountedPhrase {
  phrase: string;
  count: number;
  length: number;
}


export class NGrammer {

  static processText(text:string[], topN:number, omitStopWords:boolean, minCount?: number): CountedPhrase[] {
    // const normalized = text.map(t => compromise(t, null).normalize().out())
    // console.log("NOMRLIZED:\n", normalized)

    const giantString = text.join("\n\n\n\n").toLowerCase()
    // console.log("TEXT:\n", giantString)
    // const grams = compromise(giantString, null).ngrams({max:5}).data().filter((d:any) => d.size > 1)
    
    // return grams

    const noSpecialChars = nlp.string.removeSplChars(giantString)
    const noPunctuation = nlp.string.removePunctuations(noSpecialChars)
    const noExtraSpace = nlp.string.removeExtraSpaces(noPunctuation)

    const cleanedStr = noExtraSpace
    const tokens = nlp.string.tokenize(cleanedStr)

    let finalTokens = null
    if(omitStopWords) {
      finalTokens = nlp.tokens.removeWords(tokens)
    } else {
      finalTokens = tokens
    }  

    const vec: any[] = termVector.getVector(finalTokens, {gte: 1, lte: topN})

    // filter out anything that occured only once
    // also filter out any single word occurance that is a stop word
    const minCountDefined = minCount || 2;
    const occuredMoreThanOnce = vec.filter( v => {
      const gram: string[] = v[0]
      const count = v[1]

      let isStop = false;
      if(gram.length == 1) {
        const noStop = <string[]>(nlp.tokens.removeWords(gram))
        isStop = noStop.length <= 0
      }

      return count >= minCountDefined && !isStop
    })
    const countedGrams = occuredMoreThanOnce.map(v => {
      const gram: string[] = v[0]
      const count = v[1]
      const length = gram.length
      const phrase = gram.join(" ")

      return { count, phrase, length }
    })
    
    return countedGrams.sort( (a, b) => {
      return a.count - b.count
    } )
  }


  static processTextAndGroup(text:string[], topN:number, omitStopWords:boolean, minCount?: number): {[key:string]: CountedPhrase[]} {
    const giantString = text.join(" ").toLowerCase()
    const onlyAlphaNums = nlp.string.retainAlphaNums(giantString)
    const tokens = nlp.string.tokenize(giantString)

    let finalTokens = null
    if(omitStopWords) {
      finalTokens = nlp.tokens.removeWords(tokens)
    } else {
      finalTokens = tokens
    }  

    const vec: any[] = termVector.getVector(finalTokens, {gte: 1, lte: topN})

    const minCountDefined = minCount || 2;
    const occuredAtLeastMinCount = vec.filter( v => v[1] >= minCountDefined)
    const grouped = occuredAtLeastMinCount.reduce( (grouped, current) => {
      const grams: string[] = current[0]
      const gramsLen = grams.length
      const count = current[1]

      let group = grouped[gramsLen]
      if( group == null ) {
        group = []
        grouped[gramsLen] = group
      }

      group.push(current)
      return grouped
    }, [])

    const sortFn = (a:any, b:any) => {
      return b[1] - a[1]
    }

    const countedNGrams: {[key:string]: CountedPhrase[]} = {}
    Object.keys(grouped).forEach( key => {
      const group = grouped[key]
      if(group != null) {
        const sorted: any[] = group.sort(sortFn).slice(0, topN)
        const countedPhrases = sorted.map( tup => {
          const count = tup[1]
          const gram = <string[]>tup[0]
          const length = gram.length
          const phrase = gram.join(" ")

          return { count, phrase, length }
        })

        countedNGrams[key] = countedPhrases;
      }
    })
    
    return countedNGrams
  }

  static async process(filePath:string, topN:number, omitStopWords:boolean): Promise<{[key:string]: CountedPhrase[]}> {
    var fs = require('fs');
    var obj: ParseRes;

    const readP = new Promise<ParseRes>( (resolve, reject) => {
      fs.readFile(filePath, 'utf8', function (err: any, data: any) {
        if (err) { reject(err); }
        else {
          obj = JSON.parse(data);
          resolve(obj)
        }
      });
    })
    const data = await readP
    if(data.reviews == null) {
      throw new Error("no reviews")
    }

    const reviews = data.reviews
    const allTexts = reviews.reduce( (texts, review) => {
      if(review.text) {
        texts.push(review.text); 
      }
      return texts;
    }, <string[]>[] )

    return this.processTextAndGroup(allTexts, topN, omitStopWords)
  }

}