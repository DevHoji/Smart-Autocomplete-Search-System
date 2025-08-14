/**
 * Remove duplicate words from the sample-words.json file
 */

const fs = require('fs');
const path = require('path');

// Load existing words
const existingWordsPath = path.join(__dirname, '../data/sample-words.json');
const existingWords = JSON.parse(fs.readFileSync(existingWordsPath, 'utf8'));

console.log(`Starting with ${existingWords.length} words`);

// Create a map to track unique words (case-insensitive)
const uniqueWords = new Map();
const duplicates = [];

existingWords.forEach((wordObj, index) => {
  const lowerWord = wordObj.word.toLowerCase();
  
  if (uniqueWords.has(lowerWord)) {
    duplicates.push({
      word: wordObj.word,
      index: index,
      originalIndex: uniqueWords.get(lowerWord).index
    });
  } else {
    uniqueWords.set(lowerWord, {
      wordObj: wordObj,
      index: index
    });
  }
});

console.log(`Found ${duplicates.length} duplicates:`);
duplicates.forEach(dup => {
  console.log(`  - "${dup.word}" at index ${dup.index} (original at ${dup.originalIndex})`);
});

// Create array of unique words
const uniqueWordsArray = Array.from(uniqueWords.values()).map(item => item.wordObj);

console.log(`After removing duplicates: ${uniqueWordsArray.length} words`);
console.log(`Removed ${existingWords.length - uniqueWordsArray.length} duplicate words`);

// Write back to file
fs.writeFileSync(existingWordsPath, JSON.stringify(uniqueWordsArray, null, 2));

console.log(`✅ Successfully cleaned up word database!`);
console.log(`📊 Final count: ${uniqueWordsArray.length} unique words`);
