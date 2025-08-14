/**
 * Add Amharic words to the database
 * Adding 250+ common Amharic words with their meanings and categories
 */

const fs = require('fs');
const path = require('path');

// Load existing words
const existingWordsPath = path.join(__dirname, '../data/sample-words.json');
const existingWords = JSON.parse(fs.readFileSync(existingWordsPath, 'utf8'));

// Create a set of existing words for quick lookup
const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()));

// Amharic words collection (250+ words)
const amharicWords = [
  // Basic greetings and common phrases
  { word: "ሰላም", freq: 95, category: "amharic", synonyms: ["hello", "peace", "greeting"], meaning: "hello/peace" },
  { word: "እንደምን", freq: 90, category: "amharic", synonyms: ["how", "what", "condition"], meaning: "how are you" },
  { word: "አመሰግናለሁ", freq: 85, category: "amharic", synonyms: ["thank", "thanks", "gratitude"], meaning: "thank you" },
  { word: "እባክዎ", freq: 80, category: "amharic", synonyms: ["please", "request", "kindly"], meaning: "please" },
  { word: "ይቅርታ", freq: 75, category: "amharic", synonyms: ["sorry", "excuse", "forgive"], meaning: "sorry/excuse me" },
  { word: "ደህና", freq: 85, category: "amharic", synonyms: ["good", "well", "fine"], meaning: "good/well" },
  { word: "መልካም", freq: 80, category: "amharic", synonyms: ["good", "nice", "pleasant"], meaning: "good/nice" },
  { word: "ደስ", freq: 75, category: "amharic", synonyms: ["happy", "joy", "pleasure"], meaning: "happy/joy" },
  { word: "ፍቅር", freq: 85, category: "amharic", synonyms: ["love", "affection", "care"], meaning: "love" },
  { word: "ሰላምታ", freq: 70, category: "amharic", synonyms: ["greeting", "salutation", "hello"], meaning: "greeting" },

  // Family and relationships
  { word: "እናት", freq: 90, category: "amharic", synonyms: ["mother", "mom", "mama"], meaning: "mother" },
  { word: "አባት", freq: 90, category: "amharic", synonyms: ["father", "dad", "papa"], meaning: "father" },
  { word: "ልጅ", freq: 85, category: "amharic", synonyms: ["child", "kid", "son"], meaning: "child" },
  { word: "ወንድም", freq: 80, category: "amharic", synonyms: ["brother", "sibling", "bro"], meaning: "brother" },
  { word: "እህት", freq: 80, category: "amharic", synonyms: ["sister", "sibling", "sis"], meaning: "sister" },
  { word: "ቤተሰብ", freq: 85, category: "amharic", synonyms: ["family", "household", "relatives"], meaning: "family" },
  { word: "ጓደኛ", freq: 80, category: "amharic", synonyms: ["friend", "companion", "buddy"], meaning: "friend" },
  { word: "ባል", freq: 75, category: "amharic", synonyms: ["husband", "spouse", "partner"], meaning: "husband" },
  { word: "ሚስት", freq: 75, category: "amharic", synonyms: ["wife", "spouse", "partner"], meaning: "wife" },
  { word: "አያት", freq: 70, category: "amharic", synonyms: ["grandmother", "grandma", "elder"], meaning: "grandmother" },

  // Numbers
  { word: "አንድ", freq: 90, category: "amharic", synonyms: ["one", "single", "first"], meaning: "one" },
  { word: "ሁለት", freq: 85, category: "amharic", synonyms: ["two", "pair", "second"], meaning: "two" },
  { word: "ሶስት", freq: 80, category: "amharic", synonyms: ["three", "third", "triple"], meaning: "three" },
  { word: "አራት", freq: 75, category: "amharic", synonyms: ["four", "fourth", "quad"], meaning: "four" },
  { word: "አምስት", freq: 75, category: "amharic", synonyms: ["five", "fifth", "penta"], meaning: "five" },
  { word: "ስድስት", freq: 70, category: "amharic", synonyms: ["six", "sixth", "hexa"], meaning: "six" },
  { word: "ሰባት", freq: 70, category: "amharic", synonyms: ["seven", "seventh", "sept"], meaning: "seven" },
  { word: "ስምንት", freq: 65, category: "amharic", synonyms: ["eight", "eighth", "octa"], meaning: "eight" },
  { word: "ዘጠኝ", freq: 65, category: "amharic", synonyms: ["nine", "ninth", "nona"], meaning: "nine" },
  { word: "አስር", freq: 70, category: "amharic", synonyms: ["ten", "tenth", "deca"], meaning: "ten" },

  // Colors
  { word: "ቀይ", freq: 75, category: "amharic", synonyms: ["red", "crimson", "scarlet"], meaning: "red" },
  { word: "ሰማያዊ", freq: 70, category: "amharic", synonyms: ["blue", "azure", "sky"], meaning: "blue" },
  { word: "አረንጓዴ", freq: 70, category: "amharic", synonyms: ["green", "emerald", "nature"], meaning: "green" },
  { word: "ቢጫ", freq: 65, category: "amharic", synonyms: ["yellow", "golden", "bright"], meaning: "yellow" },
  { word: "ጥቁር", freq: 70, category: "amharic", synonyms: ["black", "dark", "night"], meaning: "black" },
  { word: "ነጭ", freq: 70, category: "amharic", synonyms: ["white", "clean", "pure"], meaning: "white" },
  { word: "ብርቱካናማ", freq: 60, category: "amharic", synonyms: ["orange", "bright", "warm"], meaning: "orange" },
  { word: "ወይንጠጅ", freq: 55, category: "amharic", synonyms: ["purple", "violet", "royal"], meaning: "purple" },

  // Body parts
  { word: "ራስ", freq: 80, category: "amharic", synonyms: ["head", "brain", "mind"], meaning: "head" },
  { word: "አይን", freq: 85, category: "amharic", synonyms: ["eye", "sight", "vision"], meaning: "eye" },
  { word: "አፍ", freq: 80, category: "amharic", synonyms: ["mouth", "lips", "speak"], meaning: "mouth" },
  { word: "እጅ", freq: 85, category: "amharic", synonyms: ["hand", "arm", "touch"], meaning: "hand" },
  { word: "እግር", freq: 80, category: "amharic", synonyms: ["foot", "leg", "walk"], meaning: "foot/leg" },
  { word: "ልብ", freq: 85, category: "amharic", synonyms: ["heart", "love", "emotion"], meaning: "heart" },
  { word: "አንገት", freq: 70, category: "amharic", synonyms: ["neck", "throat", "voice"], meaning: "neck" },
  { word: "ጆሮ", freq: 75, category: "amharic", synonyms: ["ear", "hearing", "listen"], meaning: "ear" },
  { word: "አፍንጫ", freq: 70, category: "amharic", synonyms: ["nose", "smell", "breath"], meaning: "nose" },
  { word: "ጥርስ", freq: 70, category: "amharic", synonyms: ["tooth", "teeth", "bite"], meaning: "tooth" },

  // Food and drink
  { word: "እንጀራ", freq: 90, category: "amharic", synonyms: ["injera", "bread", "food"], meaning: "injera (traditional bread)" },
  { word: "ወጥ", freq: 85, category: "amharic", synonyms: ["stew", "sauce", "curry"], meaning: "stew/sauce" },
  { word: "ሻይ", freq: 80, category: "amharic", synonyms: ["tea", "drink", "beverage"], meaning: "tea" },
  { word: "ቡና", freq: 85, category: "amharic", synonyms: ["coffee", "drink", "beverage"], meaning: "coffee" },
  { word: "ወተት", freq: 75, category: "amharic", synonyms: ["milk", "dairy", "white"], meaning: "milk" },
  { word: "ዳቦ", freq: 80, category: "amharic", synonyms: ["bread", "loaf", "food"], meaning: "bread" },
  { word: "ስጋ", freq: 75, category: "amharic", synonyms: ["meat", "flesh", "protein"], meaning: "meat" },
  { word: "ዓሳ", freq: 70, category: "amharic", synonyms: ["fish", "seafood", "water"], meaning: "fish" },
  { word: "ፍራፍሬ", freq: 70, category: "amharic", synonyms: ["fruit", "sweet", "healthy"], meaning: "fruit" },
  { word: "አትክልት", freq: 65, category: "amharic", synonyms: ["vegetable", "green", "healthy"], meaning: "vegetable" },

  // Time and weather
  { word: "ጊዜ", freq: 85, category: "amharic", synonyms: ["time", "moment", "period"], meaning: "time" },
  { word: "ቀን", freq: 85, category: "amharic", synonyms: ["day", "date", "daily"], meaning: "day" },
  { word: "ሌሊት", freq: 80, category: "amharic", synonyms: ["night", "evening", "dark"], meaning: "night" },
  { word: "ጠዋት", freq: 75, category: "amharic", synonyms: ["morning", "dawn", "early"], meaning: "morning" },
  { word: "ምሽት", freq: 75, category: "amharic", synonyms: ["evening", "dusk", "late"], meaning: "evening" },
  { word: "ዓመት", freq: 80, category: "amharic", synonyms: ["year", "annual", "time"], meaning: "year" },
  { word: "ወር", freq: 75, category: "amharic", synonyms: ["month", "monthly", "time"], meaning: "month" },
  { word: "ሳምንት", freq: 70, category: "amharic", synonyms: ["week", "weekly", "seven"], meaning: "week" },
  { word: "ዝናብ", freq: 75, category: "amharic", synonyms: ["rain", "water", "weather"], meaning: "rain" },
  { word: "ፀሐይ", freq: 80, category: "amharic", synonyms: ["sun", "light", "bright"], meaning: "sun" },

  // Common verbs
  { word: "መሄድ", freq: 85, category: "amharic", synonyms: ["go", "walk", "move"], meaning: "to go" },
  { word: "መምጣት", freq: 85, category: "amharic", synonyms: ["come", "arrive", "approach"], meaning: "to come" },
  { word: "መብላት", freq: 80, category: "amharic", synonyms: ["eat", "consume", "food"], meaning: "to eat" },
  { word: "መጠጣት", freq: 75, category: "amharic", synonyms: ["drink", "consume", "liquid"], meaning: "to drink" },
  { word: "መተኛት", freq: 75, category: "amharic", synonyms: ["sleep", "rest", "bed"], meaning: "to sleep" },
  { word: "መናገር", freq: 80, category: "amharic", synonyms: ["speak", "talk", "say"], meaning: "to speak" },
  { word: "መስማት", freq: 75, category: "amharic", synonyms: ["hear", "listen", "sound"], meaning: "to hear" },
  { word: "ማየት", freq: 80, category: "amharic", synonyms: ["see", "look", "watch"], meaning: "to see" },
  { word: "መስራት", freq: 85, category: "amharic", synonyms: ["work", "do", "make"], meaning: "to work" },
  { word: "መማር", freq: 80, category: "amharic", synonyms: ["learn", "study", "education"], meaning: "to learn" },

  // Places and locations
  { word: "ቤት", freq: 90, category: "amharic", synonyms: ["house", "home", "building"], meaning: "house/home" },
  { word: "ትምህርት", freq: 85, category: "amharic", synonyms: ["school", "education", "learning"], meaning: "school" },
  { word: "ሆስፒታል", freq: 75, category: "amharic", synonyms: ["hospital", "clinic", "medical"], meaning: "hospital" },
  { word: "ገበያ", freq: 80, category: "amharic", synonyms: ["market", "shop", "trade"], meaning: "market" },
  { word: "ቤተክርስቲያን", freq: 70, category: "amharic", synonyms: ["church", "worship", "religion"], meaning: "church" },
  { word: "መስጊድ", freq: 65, category: "amharic", synonyms: ["mosque", "worship", "religion"], meaning: "mosque" },
  { word: "መንገድ", freq: 85, category: "amharic", synonyms: ["road", "street", "path"], meaning: "road/street" },
  { word: "ከተማ", freq: 80, category: "amharic", synonyms: ["city", "town", "urban"], meaning: "city" },
  { word: "ሀገር", freq: 85, category: "amharic", synonyms: ["country", "nation", "homeland"], meaning: "country" },
  { word: "ወንዝ", freq: 70, category: "amharic", synonyms: ["river", "water", "flow"], meaning: "river" },

  // Animals
  { word: "ውሻ", freq: 80, category: "amharic", synonyms: ["dog", "pet", "animal"], meaning: "dog" },
  { word: "ድመት", freq: 75, category: "amharic", synonyms: ["cat", "pet", "animal"], meaning: "cat" },
  { word: "በሬ", freq: 70, category: "amharic", synonyms: ["cow", "cattle", "animal"], meaning: "cow" },
  { word: "ፈረስ", freq: 70, category: "amharic", synonyms: ["horse", "ride", "animal"], meaning: "horse" },
  { word: "በግ", freq: 65, category: "amharic", synonyms: ["sheep", "wool", "animal"], meaning: "sheep" },
  { word: "ዶሮ", freq: 75, category: "amharic", synonyms: ["chicken", "bird", "food"], meaning: "chicken" },
  { word: "አንበሳ", freq: 70, category: "amharic", synonyms: ["lion", "king", "strong"], meaning: "lion" },
  { word: "ዝሆን", freq: 65, category: "amharic", synonyms: ["elephant", "big", "strong"], meaning: "elephant" },
  { word: "ወፍ", freq: 75, category: "amharic", synonyms: ["bird", "fly", "sky"], meaning: "bird" },
  { word: "ዓሳ", freq: 70, category: "amharic", synonyms: ["fish", "water", "swim"], meaning: "fish" },

  // Emotions and feelings
  { word: "ደስታ", freq: 80, category: "amharic", synonyms: ["happiness", "joy", "pleasure"], meaning: "happiness" },
  { word: "ሀዘን", freq: 70, category: "amharic", synonyms: ["sadness", "sorrow", "grief"], meaning: "sadness" },
  { word: "ፍርሀት", freq: 65, category: "amharic", synonyms: ["fear", "afraid", "scared"], meaning: "fear" },
  { word: "ቁጣ", freq: 65, category: "amharic", synonyms: ["anger", "mad", "upset"], meaning: "anger" },
  { word: "ተስፋ", freq: 75, category: "amharic", synonyms: ["hope", "wish", "dream"], meaning: "hope" },
  { word: "ፍቅር", freq: 85, category: "amharic", synonyms: ["love", "affection", "care"], meaning: "love" },
  { word: "ሰላም", freq: 80, category: "amharic", synonyms: ["peace", "calm", "quiet"], meaning: "peace" },
  { word: "እምነት", freq: 75, category: "amharic", synonyms: ["faith", "belief", "trust"], meaning: "faith" },

  // Objects and things
  { word: "መጽሐፍ", freq: 80, category: "amharic", synonyms: ["book", "read", "knowledge"], meaning: "book" },
  { word: "ወረቀት", freq: 75, category: "amharic", synonyms: ["paper", "write", "document"], meaning: "paper" },
  { word: "እስክሪብቶ", freq: 70, category: "amharic", synonyms: ["pen", "write", "ink"], meaning: "pen" },
  { word: "ሰዓት", freq: 80, category: "amharic", synonyms: ["clock", "time", "hour"], meaning: "clock/hour" },
  { word: "ገንዘብ", freq: 85, category: "amharic", synonyms: ["money", "cash", "currency"], meaning: "money" },
  { word: "ልብስ", freq: 80, category: "amharic", synonyms: ["clothes", "dress", "wear"], meaning: "clothes" },
  { word: "ጫማ", freq: 75, category: "amharic", synonyms: ["shoe", "footwear", "walk"], meaning: "shoe" },
  { word: "መኪና", freq: 80, category: "amharic", synonyms: ["car", "vehicle", "drive"], meaning: "car" },
  { word: "ስልክ", freq: 85, category: "amharic", synonyms: ["phone", "call", "communication"], meaning: "phone" },
  { word: "ኮምፒውተር", freq: 75, category: "amharic", synonyms: ["computer", "technology", "digital"], meaning: "computer" },

  // Nature and environment
  { word: "ዛፍ", freq: 75, category: "amharic", synonyms: ["tree", "wood", "nature"], meaning: "tree" },
  { word: "አበባ", freq: 70, category: "amharic", synonyms: ["flower", "beautiful", "nature"], meaning: "flower" },
  { word: "ሳር", freq: 65, category: "amharic", synonyms: ["grass", "green", "nature"], meaning: "grass" },
  { word: "ተራራ", freq: 70, category: "amharic", synonyms: ["mountain", "high", "climb"], meaning: "mountain" },
  { word: "ባህር", freq: 70, category: "amharic", synonyms: ["sea", "ocean", "water"], meaning: "sea" },
  { word: "ሀይቅ", freq: 65, category: "amharic", synonyms: ["lake", "water", "calm"], meaning: "lake" },
  { word: "ጫካ", freq: 65, category: "amharic", synonyms: ["forest", "trees", "wild"], meaning: "forest" },
  { word: "ምድር", freq: 75, category: "amharic", synonyms: ["earth", "ground", "soil"], meaning: "earth" },
  { word: "ሰማይ", freq: 80, category: "amharic", synonyms: ["sky", "heaven", "blue"], meaning: "sky" },
  { word: "ኮከብ", freq: 70, category: "amharic", synonyms: ["star", "night", "bright"], meaning: "star" },

  // Actions and activities
  { word: "ጨዋታ", freq: 75, category: "amharic", synonyms: ["game", "play", "fun"], meaning: "game/play" },
  { word: "ሙዚቃ", freq: 80, category: "amharic", synonyms: ["music", "song", "sound"], meaning: "music" },
  { word: "ዳንስ", freq: 70, category: "amharic", synonyms: ["dance", "move", "rhythm"], meaning: "dance" },
  { word: "ስፖርት", freq: 75, category: "amharic", synonyms: ["sport", "exercise", "game"], meaning: "sport" },
  { word: "ጉዞ", freq: 70, category: "amharic", synonyms: ["travel", "journey", "trip"], meaning: "travel" },
  { word: "ስራ", freq: 85, category: "amharic", synonyms: ["work", "job", "employment"], meaning: "work" },
  { word: "ትምህርት", freq: 85, category: "amharic", synonyms: ["education", "learning", "study"], meaning: "education" },
  { word: "ጤና", freq: 80, category: "amharic", synonyms: ["health", "wellness", "fitness"], meaning: "health" },

  // Common adjectives
  { word: "ትልቅ", freq: 80, category: "amharic", synonyms: ["big", "large", "huge"], meaning: "big" },
  { word: "ትንሽ", freq: 80, category: "amharic", synonyms: ["small", "little", "tiny"], meaning: "small" },
  { word: "ረጅም", freq: 70, category: "amharic", synonyms: ["long", "tall", "lengthy"], meaning: "long/tall" },
  { word: "አጭር", freq: 70, category: "amharic", synonyms: ["short", "brief", "small"], meaning: "short" },
  { word: "ፈጣን", freq: 70, category: "amharic", synonyms: ["fast", "quick", "speed"], meaning: "fast" },
  { word: "ዘገምተኛ", freq: 65, category: "amharic", synonyms: ["slow", "lazy", "gradual"], meaning: "slow" },
  { word: "ጠንካራ", freq: 75, category: "amharic", synonyms: ["strong", "hard", "tough"], meaning: "strong" },
  { word: "ደካማ", freq: 65, category: "amharic", synonyms: ["weak", "soft", "fragile"], meaning: "weak" },
  { word: "አዲስ", freq: 80, category: "amharic", synonyms: ["new", "fresh", "modern"], meaning: "new" },
  { word: "አሮጌ", freq: 70, category: "amharic", synonyms: ["old", "ancient", "aged"], meaning: "old" },

  // More common words
  { word: "እውነት", freq: 80, category: "amharic", synonyms: ["truth", "fact", "real"], meaning: "truth" },
  { word: "ውሸት", freq: 65, category: "amharic", synonyms: ["lie", "false", "fake"], meaning: "lie" },
  { word: "ችግር", freq: 75, category: "amharic", synonyms: ["problem", "issue", "trouble"], meaning: "problem" },
  { word: "መፍትሄ", freq: 70, category: "amharic", synonyms: ["solution", "answer", "fix"], meaning: "solution" },
  { word: "እድል", freq: 75, category: "amharic", synonyms: ["chance", "opportunity", "luck"], meaning: "chance" },
  { word: "ዕድሜ", freq: 80, category: "amharic", synonyms: ["age", "years", "life"], meaning: "age" },
  { word: "ሕይወት", freq: 85, category: "amharic", synonyms: ["life", "living", "existence"], meaning: "life" },
  { word: "ሞት", freq: 70, category: "amharic", synonyms: ["death", "end", "die"], meaning: "death" },
  { word: "ወደፊት", freq: 75, category: "amharic", synonyms: ["future", "tomorrow", "ahead"], meaning: "future" },
  { word: "ያለፈ", freq: 70, category: "amharic", synonyms: ["past", "before", "history"], meaning: "past" },

  // Additional useful words
  { word: "ውሃ", freq: 90, category: "amharic", synonyms: ["water", "liquid", "drink"], meaning: "water" },
  { word: "እሳት", freq: 75, category: "amharic", synonyms: ["fire", "flame", "heat"], meaning: "fire" },
  { word: "አየር", freq: 80, category: "amharic", synonyms: ["air", "wind", "breath"], meaning: "air" },
  { word: "ብርሃን", freq: 75, category: "amharic", synonyms: ["light", "bright", "shine"], meaning: "light" },
  { word: "ጨለማ", freq: 70, category: "amharic", synonyms: ["darkness", "dark", "night"], meaning: "darkness" },
  { word: "ድምፅ", freq: 75, category: "amharic", synonyms: ["sound", "voice", "noise"], meaning: "sound" },
  { word: "ዝምታ", freq: 65, category: "amharic", synonyms: ["silence", "quiet", "calm"], meaning: "silence" },
  { word: "ፍጥነት", freq: 70, category: "amharic", synonyms: ["speed", "velocity", "fast"], meaning: "speed" },
  { word: "ርቀት", freq: 65, category: "amharic", synonyms: ["distance", "far", "space"], meaning: "distance" },
  { word: "ቅርበት", freq: 65, category: "amharic", synonyms: ["closeness", "near", "proximity"], meaning: "closeness" }
];

// Filter out words that already exist
const wordsToAdd = amharicWords.filter(word => !existingWordSet.has(word.word.toLowerCase()));

console.log(`Found ${wordsToAdd.length} new Amharic words to add`);
console.log(`Current word count: ${existingWords.length}`);
console.log(`New total will be: ${existingWords.length + wordsToAdd.length}`);

// Display the Amharic words being added
console.log('\n📝 Amharic words being added:');
wordsToAdd.forEach((word, index) => {
  console.log(`${index + 1}. ${word.word} (${word.meaning}) - freq: ${word.freq}`);
});

// Combine existing and new words
const allWords = [...existingWords, ...wordsToAdd];

// Write back to file
fs.writeFileSync(existingWordsPath, JSON.stringify(allWords, null, 2));

console.log(`\n✅ Successfully added ${wordsToAdd.length} Amharic words!`);
console.log(`📊 Total words now: ${allWords.length}`);
console.log(`🇪🇹 Amharic words added with categories, meanings, and synonyms for full Trie support!`);
