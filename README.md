# NGrammer

Calculates and counts ngrams from a json document

## to install

`npm install --save lab-ngrammer`

## to use in a ts projext

```
import {NGrammer, CountedPhrase} from "lab-ngrammer"
const filePath = "some/file/path.json"
const omitStopWords = false
NGrammer.process(filePath, 30, omitStopWords).then( countedGrams => {
  ...
})
```

## to use in command line


```
npm install -g lab-ngrammer
lab-ngrammer -f FILE_PATH [-s]
```

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
