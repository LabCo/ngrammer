# NGramer

Calculates and counts ngrams from a json documnet

## to install

`npm install --save lab-ngramer`

## to use in a ts projext

```
import {NGramer, CountedPhrase} from "lab-ngramer"
const filePath = "some/file/path.json"
const omitStopWords = false
NGramer.process(filePath, 30, omitStopWords).then( countedGrams => {
  ...
})
```

## to use in command line

`npm run extract -- -f FILE_PATH [-s]`

```
  -f   the file path where to read the json file from
  -s   flag to tell ngrammer to remove stop words
```

## expects file json format 

```
{
  reviews: [
    { 
      text: "text to ngram"
      ...
    }
    ...
  ]
  ...
}
```
