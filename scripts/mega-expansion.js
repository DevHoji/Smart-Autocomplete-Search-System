/**
 * Mega expansion script to reach 5000+ words with comprehensive categories
 */

const fs = require('fs');
const path = require('path');

// Load existing words
const existingWordsPath = path.join(__dirname, '../data/sample-words.json');
const existingWords = JSON.parse(fs.readFileSync(existingWordsPath, 'utf8'));

// Create a set of existing words for quick lookup
const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()));

// Generate comprehensive word lists
const generateWords = () => {
  const words = [];
  
  // Common nouns - everyday objects and concepts (500+ words)
  const commonNouns = [
    "ability", "absence", "accident", "achievement", "action", "activity", "addition", "administration", "adult", "advantage",
    "adventure", "advertising", "advice", "affair", "age", "agency", "agent", "agreement", "agriculture", "air",
    "airline", "airport", "alarm", "alcohol", "alternative", "ambition", "analysis", "analyst", "anger", "angle",
    "animal", "anniversary", "announcement", "answer", "anxiety", "apartment", "appeal", "appearance", "application", "appointment",
    "appreciation", "approach", "approval", "architecture", "area", "argument", "army", "arrival", "art", "article",
    "artist", "aspect", "assignment", "assistance", "assistant", "association", "assumption", "atmosphere", "attack", "attempt",
    "attention", "attitude", "attraction", "audience", "author", "authority", "availability", "average", "awareness", "background",
    "balance", "band", "bank", "base", "basis", "battle", "beach", "beauty", "bedroom", "beginning",
    "behavior", "belief", "benefit", "bicycle", "bill", "bird", "birth", "birthday", "block", "blood",
    "board", "boat", "body", "book", "border", "boss", "bottle", "bottom", "box", "boy",
    "brain", "branch", "bread", "breakfast", "breath", "bridge", "brother", "budget", "building", "business",
    "button", "buyer", "camera", "campaign", "cancer", "candidate", "capacity", "capital", "captain", "car",
    "card", "care", "career", "carpet", "case", "cash", "category", "cause", "celebration", "cell",
    "center", "century", "ceremony", "chain", "chair", "challenge", "champion", "chance", "change", "channel",
    "chapter", "character", "charge", "charity", "chart", "check", "cheese", "chemistry", "chest", "child",
    "childhood", "choice", "church", "cigarette", "cinema", "circle", "citizen", "city", "class", "classic",
    "classroom", "client", "climate", "clock", "closet", "clothes", "cloud", "club", "coach", "coast",
    "coat", "code", "coffee", "cold", "collection", "college", "color", "combination", "comment", "commission",
    "committee", "communication", "community", "company", "comparison", "competition", "complaint", "computer", "concept", "concern",
    "conclusion", "condition", "conference", "confidence", "conflict", "confusion", "connection", "consequence", "consideration", "construction",
    "contact", "container", "content", "contest", "context", "contract", "control", "conversation", "cookie", "copy",
    "corner", "cost", "cotton", "council", "country", "county", "couple", "courage", "course", "court",
    "cousin", "cover", "craft", "crash", "cream", "creation", "credit", "crew", "crime", "crisis",
    "criticism", "crop", "cross", "crowd", "culture", "cup", "currency", "current", "curve", "customer",
    "cycle", "damage", "dance", "danger", "data", "database", "date", "daughter", "day", "deal",
    "dealer", "death", "debate", "debt", "decade", "decision", "decoration", "decrease", "definition", "degree",
    "delivery", "demand", "department", "departure", "depression", "depth", "description", "design", "designer", "desk",
    "detail", "development", "device", "diagnosis", "diagram", "diamond", "diary", "dictionary", "difference", "difficulty",
    "dimension", "dinner", "direction", "director", "dirt", "disaster", "discipline", "discount", "discovery", "discussion",
    "disease", "dish", "disk", "display", "distance", "distribution", "district", "division", "doctor", "document",
    "dog", "door", "doubt", "draft", "drama", "drawer", "drawing", "dream", "dress", "drink",
    "drive", "driver", "drop", "drug", "ear", "earth", "economy", "edge", "edition", "editor",
    "education", "effect", "efficiency", "effort", "election", "electricity", "element", "elevator", "emergency", "emotion",
    "emphasis", "employee", "employer", "employment", "energy", "engine", "engineer", "engineering", "entertainment", "enthusiasm",
    "environment", "episode", "equipment", "error", "establishment", "estate", "estimate", "evaluation", "evening", "event",
    "evidence", "examination", "example", "exchange", "excitement", "excuse", "exercise", "exhibition", "existence", "exit",
    "expansion", "experience", "experiment", "expert", "explanation", "expression", "extension", "extent", "eye", "face",
    "fact", "factor", "factory", "failure", "fall", "family", "farm", "farmer", "fashion", "father",
    "fault", "fear", "feature", "fee", "feedback", "feeling", "field", "figure", "file", "film",
    "finance", "finding", "finger", "fire", "firm", "fish", "fishing", "flight", "floor", "flow",
    "flower", "focus", "food", "foot", "football", "force", "forest", "form", "format", "fortune",
    "foundation", "frame", "freedom", "friend", "friendship", "fruit", "fuel", "function", "fund", "funeral",
    "furniture", "future", "gain", "game", "garage", "garden", "gas", "gate", "gathering", "gear",
    "gender", "generation", "gift", "girl", "glass", "goal", "gold", "golf", "government", "grade",
    "grandfather", "grandmother", "grass", "ground", "group", "growth", "guarantee", "guard", "guess", "guest",
    "guide", "guitar", "guy", "habit", "hair", "half", "hall", "hand", "handle", "happiness",
    "hardware", "harm", "hat", "head", "health", "hearing", "heart", "heat", "height", "help",
    "hero", "highway", "hill", "hint", "history", "hobby", "hold", "hole", "holiday", "home",
    "homework", "honey", "hope", "horror", "horse", "hospital", "host", "hotel", "hour", "house",
    "housing", "human", "humor", "hundred", "husband", "ice", "idea", "identity", "image", "imagination",
    "impact", "implementation", "importance", "impression", "improvement", "income", "increase", "independence", "index", "indication",
    "industry", "infection", "inflation", "influence", "information", "initiative", "injury", "innovation", "input", "inquiry",
    "inside", "inspection", "inspiration", "installation", "instance", "instruction", "instructor", "instrument", "insurance", "intelligence",
    "intention", "interaction", "interest", "interior", "internet", "interpretation", "interview", "introduction", "investment", "invitation",
    "iron", "island", "issue", "item", "jacket", "job", "joint", "joke", "journal", "journey",
    "joy", "judge", "judgment", "juice", "jump", "junior", "jury", "justice", "key", "keyboard",
    "kid", "kind", "king", "kitchen", "knee", "knife", "knowledge", "lab", "label", "labor",
    "lack", "ladder", "lady", "lake", "land", "landscape", "language", "laptop", "law", "lawyer",
    "layer", "lead", "leader", "leadership", "league", "leather", "leave", "lecture", "leg", "length",
    "lesson", "letter", "level", "library", "license", "life", "lift", "light", "limit", "line",
    "link", "list", "literature", "living", "loan", "lobby", "location", "lock", "logic", "look",
    "loss", "lot", "love", "luck", "lunch", "machine", "magazine", "magic", "mail", "maintenance",
    "major", "make", "maker", "mall", "man", "management", "manager", "manner", "manufacturer", "manufacturing",
    "map", "march", "mark", "market", "marketing", "marriage", "master", "match", "material", "math",
    "matter", "maximum", "meal", "meaning", "measure", "meat", "media", "medicine", "medium", "meeting",
    "member", "membership", "memory", "mention", "menu", "message", "metal", "method", "middle", "milk",
    "mind", "mine", "minimum", "minor", "minute", "mirror", "mission", "mistake", "mix", "mixture",
    "mobile", "mode", "model", "modification", "moment", "money", "monitor", "month", "mood", "morning",
    "mortgage", "mother", "motion", "motivation", "motor", "mountain", "mouse", "mouth", "move", "movement",
    "movie", "mud", "muscle", "music", "musician", "nail", "name", "nation", "nature", "navigation",
    "neck", "need", "negotiation", "neighbor", "neighborhood", "nerve", "net", "network", "news", "newspaper",
    "night", "noise", "normal", "north", "nose", "note", "nothing", "notice", "novel", "number",
    "nurse", "object", "objective", "obligation", "observation", "occasion", "ocean", "offer", "office", "officer",
    "oil", "operation", "opinion", "opportunity", "option", "orange", "order", "organization", "origin", "original",
    "other", "outcome", "output", "outside", "owner", "pace", "pack", "package", "page", "pain",
    "paint", "painting", "pair", "palace", "pan", "panel", "paper", "parent", "park", "parking",
    "part", "participant", "participation", "particular", "partner", "partnership", "party", "pass", "passage", "passenger",
    "passion", "password", "past", "path", "patience", "patient", "pattern", "payment", "peace", "peak",
    "pen", "penalty", "people", "pepper", "percentage", "perception", "performance", "period", "permission", "person",
    "personality", "perspective", "phone", "photo", "photograph", "photographer", "photography", "phrase", "physical", "physics",
    "piano", "picture", "piece", "pile", "pilot", "pink", "pipe", "pitch", "pizza", "place",
    "plan", "plane", "planet", "plant", "plastic", "plate", "platform", "play", "player", "pleasure",
    "plot", "poem", "poet", "poetry", "point", "police", "policy", "politics", "pollution", "pool",
    "population", "position", "possibility", "post", "pot", "potato", "potential", "pound", "power", "practice",
    "prayer", "precision", "preference", "pregnancy", "preparation", "presence", "presentation", "president", "press", "pressure",
    "price", "pride", "priest", "primary", "prince", "princess", "principle", "print", "printer", "priority",
    "privacy", "private", "prize", "problem", "procedure", "process", "produce", "producer", "product", "production",
    "profession", "professional", "professor", "profile", "profit", "program", "programmer", "progress", "project", "promise",
    "promotion", "property", "proposal", "protection", "protest", "provider", "psychology", "public", "publication", "publicity",
    "publisher", "purpose", "push", "quality", "quantity", "quarter", "queen", "question", "quote", "race",
    "radio", "rain", "range", "rank", "rate", "ratio", "reach", "reaction", "reading", "reality",
    "reason", "receipt", "reception", "recipe", "recognition", "recommendation", "record", "recording", "recovery", "recreation",
    "reference", "reflection", "region", "registration", "regulation", "relationship", "relative", "release", "religion", "reminder",
    "repair", "repeat", "replacement", "reply", "report", "reporter", "representation", "representative", "reputation", "request",
    "requirement", "research", "researcher", "reservation", "reserve", "resident", "resolution", "resource", "respect", "response",
    "responsibility", "rest", "restaurant", "result", "retail", "return", "revenue", "review", "revolution", "reward",
    "rice", "rich", "ride", "ring", "rise", "risk", "river", "road", "rock", "role",
    "roll", "roof", "room", "root", "rope", "round", "route", "routine", "row", "rule",
    "run", "safety", "sail", "salad", "salary", "sale", "salt", "sample", "sand", "satisfaction",
    "sauce", "save", "saving", "scale", "scene", "schedule", "scheme", "scholarship", "school", "science",
    "scientist", "scope", "score", "screen", "script", "sea", "search", "season", "seat", "second",
    "secret", "secretary", "section", "security", "selection", "self", "sell", "seller", "senior", "sense",
    "sentence", "series", "service", "session", "set", "setting", "settlement", "setup", "sex", "shake",
    "shape", "share", "shelter", "shift", "shine", "ship", "shirt", "shock", "shoe", "shoot",
    "shop", "shopping", "shore", "shot", "shoulder", "show", "shower", "sick", "side", "sight",
    "sign", "signal", "signature", "significance", "silence", "silver", "similarity", "simple", "sin", "sing",
    "singer", "single", "sink", "sir", "sister", "site", "situation", "size", "skill", "skin",
    "sky", "sleep", "slice", "slide", "slip", "smell", "smile", "smoke", "snow", "soap",
    "soccer", "social", "society", "sock", "software", "soil", "solution", "son", "song", "sort",
    "soul", "sound", "soup", "source", "south", "space", "spare", "speaker", "special", "specialist",
    "species", "speech", "speed", "spell", "spend", "spirit", "split", "sport", "spot", "spread",
    "spring", "square", "stable", "staff", "stage", "stair", "stake", "standard", "star", "start",
    "state", "statement", "station", "status", "stay", "steal", "steel", "step", "stick", "still",
    "stock", "stomach", "stone", "stop", "storage", "store", "storm", "story", "strain", "stranger",
    "strategy", "stream", "street", "strength", "stress", "strike", "string", "strip", "stroke", "structure",
    "struggle", "student", "studio", "study", "stuff", "style", "subject", "substance", "success", "sugar",
    "suggestion", "suit", "summer", "sun", "sunday", "super", "supply", "support", "surface", "surgery",
    "surprise", "survey", "survival", "suspect", "sweet", "swim", "swimming", "swing", "switch", "symbol",
    "system", "table", "tackle", "tale", "talk", "tank", "tape", "target", "task", "taste",
    "tax", "taxi", "tea", "teach", "teacher", "teaching", "team", "tear", "technology", "telephone",
    "television", "temperature", "temple", "tennis", "tension", "tent", "term", "test", "text", "thanks",
    "theater", "theme", "theory", "thing", "thought", "thread", "threat", "throat", "throw", "thumb",
    "ticket", "tie", "time", "tip", "title", "today", "toe", "tomorrow", "tone", "tongue",
    "tool", "tooth", "top", "topic", "total", "touch", "tour", "tourist", "tournament", "town",
    "toy", "track", "trade", "tradition", "traffic", "train", "training", "transfer", "transformation", "transition",
    "translation", "transport", "transportation", "trash", "travel", "treat", "treatment", "tree", "trial", "trick",
    "trip", "trouble", "truck", "trust", "truth", "try", "tube", "tune", "turn", "tv",
    "type", "uncle", "understanding", "union", "unit", "university", "update", "upper", "urban", "use",
    "user", "vacation", "valley", "value", "variation", "variety", "vegetable", "vehicle", "version", "video",
    "view", "village", "virus", "visit", "visitor", "voice", "volume", "vote", "wage", "wait",
    "wake", "walk", "wall", "war", "warning", "wash", "waste", "watch", "water", "wave",
    "way", "weakness", "wealth", "weapon", "wear", "weather", "web", "website", "wedding", "week",
    "weekend", "weight", "welcome", "west", "wheel", "wife", "will", "win", "wind", "window",
    "wine", "wing", "winner", "winter", "wire", "wish", "woman", "wood", "word", "work",
    "worker", "working", "world", "worry", "worth", "write", "writer", "writing", "yard", "year",
    "yellow", "yesterday", "young", "youth", "zone"
  ];

  // Add common nouns with frequencies
  commonNouns.forEach(noun => {
    words.push({
      word: noun,
      freq: Math.floor(Math.random() * 40) + 60, // Random frequency between 60-100
      category: "noun",
      synonyms: []
    });
  });

  return words;
};

const newWords = generateWords();

// Filter out words that already exist
const wordsToAdd = newWords.filter(word => !existingWordSet.has(word.word.toLowerCase()));

console.log(`Found ${wordsToAdd.length} new words to add`);
console.log(`Current word count: ${existingWords.length}`);
console.log(`New total will be: ${existingWords.length + wordsToAdd.length}`);

// Combine existing and new words
const allWords = [...existingWords, ...wordsToAdd];

// Write back to file
fs.writeFileSync(existingWordsPath, JSON.stringify(allWords, null, 2));

console.log(`✅ Successfully added ${wordsToAdd.length} new words!`);
console.log(`📊 Total words now: ${allWords.length}`);
