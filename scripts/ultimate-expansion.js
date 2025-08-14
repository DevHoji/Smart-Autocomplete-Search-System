/**
 * Ultimate expansion script to reach 5000+ words with comprehensive categories
 */

const fs = require('fs');
const path = require('path');

// Load existing words
const existingWordsPath = path.join(__dirname, '../data/sample-words.json');
const existingWords = JSON.parse(fs.readFileSync(existingWordsPath, 'utf8'));

// Create a set of existing words for quick lookup
const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()));

// Generate ultimate word collection
const generateUltimateWords = () => {
  const words = [];
  
  // Animals (200+ words)
  const animals = [
    "ant", "bear", "bee", "bird", "butterfly", "cat", "chicken", "cow", "crab", "deer",
    "dog", "dolphin", "duck", "eagle", "elephant", "fish", "frog", "giraffe", "goat", "horse",
    "kangaroo", "lion", "monkey", "mouse", "owl", "panda", "penguin", "pig", "rabbit", "shark",
    "sheep", "snake", "spider", "tiger", "turtle", "whale", "wolf", "zebra", "alligator", "bat",
    "camel", "cheetah", "crocodile", "flamingo", "fox", "hamster", "hedgehog", "hippopotamus", "jaguar", "koala",
    "leopard", "llama", "octopus", "otter", "parrot", "peacock", "pelican", "polar", "porcupine", "rhinoceros",
    "seal", "squirrel", "swan", "walrus", "wombat", "yak", "buffalo", "chipmunk", "donkey", "ferret",
    "gecko", "guinea", "iguana", "jellyfish", "lobster", "mole", "newt", "opossum", "platypus", "raccoon",
    "salamander", "starfish", "toad", "vulture", "woodpecker", "armadillo", "badger", "beaver", "bison", "bobcat",
    "cardinal", "catfish", "cobra", "coyote", "crane", "cricket", "dragonfly", "eel", "falcon", "firefly",
    "goldfish", "grasshopper", "heron", "hummingbird", "hyena", "jackal", "kingfisher", "ladybug", "lynx", "magpie",
    "mantis", "meerkat", "nightingale", "orangutan", "ostrich", "panther", "pigeon", "puma", "quail", "raven",
    "robin", "salmon", "scorpion", "seagull", "skunk", "sloth", "sparrow", "stingray", "swallow", "termite",
    "toucan", "trout", "viper", "wasp", "weasel", "woodchuck", "albatross", "anaconda", "antelope", "baboon",
    "barracuda", "beetle", "bluebird", "boar", "canary", "caribou", "caterpillar", "centipede", "chameleon", "chimpanzee",
    "cicada", "clam", "cockroach", "condor", "cougar", "cuckoo", "dingo", "dove", "elk", "emu",
    "finch", "fly", "gazelle", "goose", "gorilla", "grizzly", "hawk", "hornet", "hound", "hummingbird",
    "ibis", "impala", "jay", "kiwi", "lamb", "lark", "lemur", "lizard", "macaw", "mallard",
    "manatee", "marlin", "mink", "mockingbird", "mongoose", "moose", "mosquito", "moth", "mule", "narwhal",
    "ocelot", "oriole", "oyster", "parakeet", "pheasant", "piranha", "poodle", "puffin", "python", "quetzal",
    "ram", "rat", "roadrunner", "rooster", "sardine", "seahorse", "shrimp", "snail", "stork", "swordfish"
  ];

  animals.forEach(animal => {
    words.push({
      word: animal,
      freq: Math.floor(Math.random() * 25) + 35,
      category: "animal",
      synonyms: []
    });
  });

  // Countries and places (300+ words)
  const places = [
    "africa", "america", "argentina", "australia", "austria", "belgium", "brazil", "britain", "canada", "china",
    "denmark", "egypt", "england", "europe", "finland", "france", "germany", "greece", "india", "ireland",
    "israel", "italy", "japan", "korea", "mexico", "netherlands", "norway", "poland", "portugal", "russia",
    "scotland", "spain", "sweden", "switzerland", "turkey", "ukraine", "wales", "afghanistan", "albania", "algeria",
    "angola", "antarctica", "armenia", "azerbaijan", "bahrain", "bangladesh", "belarus", "bolivia", "bosnia", "botswana",
    "bulgaria", "cambodia", "cameroon", "chile", "colombia", "congo", "croatia", "cuba", "cyprus", "czech",
    "ecuador", "estonia", "ethiopia", "fiji", "georgia", "ghana", "guatemala", "guinea", "haiti", "honduras",
    "hungary", "iceland", "indonesia", "iran", "iraq", "jamaica", "jordan", "kazakhstan", "kenya", "kuwait",
    "latvia", "lebanon", "libya", "lithuania", "luxembourg", "madagascar", "malaysia", "mali", "malta", "mauritius",
    "moldova", "monaco", "mongolia", "montenegro", "morocco", "mozambique", "myanmar", "namibia", "nepal", "nicaragua",
    "niger", "nigeria", "oman", "pakistan", "panama", "paraguay", "peru", "philippines", "qatar", "romania",
    "rwanda", "samoa", "senegal", "serbia", "singapore", "slovakia", "slovenia", "somalia", "sudan", "syria",
    "taiwan", "tajikistan", "tanzania", "thailand", "togo", "tunisia", "turkmenistan", "uganda", "uruguay", "uzbekistan",
    "venezuela", "vietnam", "yemen", "zambia", "zimbabwe", "city", "town", "village", "capital", "state",
    "province", "county", "district", "region", "territory", "island", "continent", "ocean", "sea", "river",
    "lake", "mountain", "valley", "desert", "forest", "beach", "coast", "harbor", "port", "airport",
    "station", "bridge", "tunnel", "highway", "street", "avenue", "road", "lane", "square", "park",
    "garden", "museum", "library", "hospital", "school", "university", "church", "temple", "mosque", "synagogue",
    "restaurant", "hotel", "market", "mall", "store", "shop", "office", "factory", "warehouse", "farm",
    "ranch", "castle", "palace", "tower", "building", "house", "apartment", "cottage", "cabin", "tent",
    "stadium", "theater", "cinema", "club", "bar", "cafe", "gym", "spa", "salon", "clinic",
    "pharmacy", "bank", "post", "embassy", "courthouse", "prison", "police", "fire", "ambulance", "garage",
    "gas", "parking", "subway", "train", "bus", "taxi", "boat", "ship", "plane", "helicopter",
    "bicycle", "motorcycle", "truck", "van", "car", "vehicle", "transport", "traffic", "journey", "trip",
    "vacation", "holiday", "tour", "cruise", "flight", "ticket", "passport", "visa", "luggage", "baggage",
    "suitcase", "backpack", "map", "compass", "guide", "tourist", "traveler", "visitor", "guest", "host",
    "neighbor", "resident", "citizen", "local", "native", "foreigner", "immigrant", "refugee", "population", "community",
    "society", "culture", "tradition", "custom", "festival", "celebration", "ceremony", "wedding", "funeral", "birthday",
    "anniversary", "graduation", "retirement", "promotion", "achievement", "success", "failure", "victory", "defeat", "competition",
    "contest", "tournament", "championship", "league", "team", "player", "coach", "referee", "audience", "spectator",
    "fan", "supporter", "member", "leader", "manager", "director", "president", "minister", "ambassador", "governor"
  ];

  places.forEach(place => {
    words.push({
      word: place,
      freq: Math.floor(Math.random() * 30) + 40,
      category: "place",
      synonyms: []
    });
  });

  // Professions and jobs (200+ words)
  const professions = [
    "accountant", "actor", "actress", "administrator", "advisor", "analyst", "architect", "artist", "assistant", "attorney",
    "author", "baker", "banker", "barber", "bartender", "builder", "businessman", "carpenter", "cashier", "chef",
    "clerk", "coach", "consultant", "cook", "counselor", "dentist", "designer", "developer", "director", "doctor",
    "driver", "economist", "editor", "engineer", "farmer", "firefighter", "fisherman", "gardener", "guard", "guide",
    "hairdresser", "hunter", "instructor", "interpreter", "janitor", "journalist", "judge", "lawyer", "librarian", "manager",
    "mechanic", "musician", "nurse", "officer", "painter", "pharmacist", "photographer", "physician", "pilot", "plumber",
    "police", "politician", "professor", "programmer", "psychologist", "receptionist", "reporter", "researcher", "salesperson", "scientist",
    "secretary", "singer", "soldier", "surgeon", "teacher", "technician", "therapist", "translator", "veterinarian", "waiter",
    "waitress", "worker", "writer", "ambassador", "archaeologist", "astronaut", "athlete", "auctioneer", "auditor", "babysitter",
    "biologist", "blacksmith", "bookkeeper", "broadcaster", "butcher", "caretaker", "cartographer", "chemist", "chiropractor", "choreographer",
    "cinematographer", "comedian", "composer", "conductor", "contractor", "coordinator", "copywriter", "curator", "dancer", "decorator",
    "detective", "dietitian", "diplomat", "electrician", "entrepreneur", "examiner", "executive", "explorer", "florist", "geologist",
    "historian", "housekeeper", "illustrator", "inspector", "inventor", "jeweler", "landscaper", "locksmith", "magician", "mailman",
    "mathematician", "midwife", "miner", "missionary", "model", "navigator", "optometrist", "organizer", "paramedic", "pastor",
    "pathologist", "pediatrician", "performer", "philosopher", "physicist", "physiotherapist", "planner", "poet", "porter", "principal",
    "producer", "psychiatrist", "publisher", "radiologist", "realtor", "recruiter", "referee", "repairman", "representative", "sailor",
    "sculptor", "security", "shepherd", "sheriff", "shoemaker", "sociologist", "specialist", "statistician", "steward", "supervisor",
    "surveyor", "tailor", "taxi", "trainer", "treasurer", "tutor", "undertaker", "usher", "vendor", "volunteer",
    "watchmaker", "welder", "wholesaler", "zoologist", "apprentice", "artisan", "assistant", "associate", "attendant", "cadet",
    "candidate", "captain", "chairman", "champion", "chief", "citizen", "colleague", "commissioner", "competitor", "customer"
  ];

  professions.forEach(profession => {
    words.push({
      word: profession,
      freq: Math.floor(Math.random() * 25) + 35,
      category: "profession",
      synonyms: []
    });
  });

  // Emotions and feelings (100+ words)
  const emotions = [
    "anger", "anxiety", "appreciation", "boredom", "calm", "compassion", "confidence", "confusion", "curiosity", "delight",
    "depression", "desire", "disappointment", "disgust", "embarrassment", "empathy", "enthusiasm", "envy", "excitement", "fear",
    "frustration", "gratitude", "grief", "guilt", "happiness", "hatred", "hope", "horror", "humiliation", "inspiration",
    "irritation", "jealousy", "joy", "loneliness", "love", "melancholy", "nervousness", "nostalgia", "optimism", "panic",
    "passion", "patience", "peace", "pessimism", "pity", "pleasure", "pride", "rage", "regret", "relief",
    "resentment", "sadness", "satisfaction", "shame", "shock", "sorrow", "stress", "surprise", "sympathy", "terror",
    "trust", "wonder", "worry", "admiration", "affection", "aggression", "amazement", "amusement", "anticipation", "apathy",
    "awe", "bliss", "cheerfulness", "contempt", "contentment", "courage", "craving", "despair", "determination", "devotion",
    "ecstasy", "elation", "euphoria", "fascination", "fondness", "forgiveness", "fury", "gladness", "gloom", "greed",
    "hostility", "impatience", "indifference", "infatuation", "insecurity", "interest", "kindness", "laughter", "loathing", "loyalty"
  ];

  emotions.forEach(emotion => {
    words.push({
      word: emotion,
      freq: Math.floor(Math.random() * 20) + 30,
      category: "emotion",
      synonyms: []
    });
  });

  // Weather and nature (100+ words)
  const weather = [
    "blizzard", "breeze", "climate", "cloud", "cold", "cyclone", "drizzle", "drought", "earthquake", "flood",
    "fog", "frost", "hail", "heat", "humidity", "hurricane", "ice", "lightning", "mist", "rain",
    "rainbow", "season", "snow", "storm", "sun", "sunshine", "temperature", "thunder", "tornado", "weather",
    "wind", "winter", "spring", "summer", "autumn", "fall", "cloudy", "foggy", "freezing", "hot",
    "humid", "icy", "rainy", "snowy", "stormy", "sunny", "warm", "windy", "avalanche", "dew",
    "downpour", "gale", "monsoon", "precipitation", "shower", "sleet", "squall", "tempest", "typhoon", "whirlwind",
    "atmosphere", "barometer", "celsius", "fahrenheit", "forecast", "meteorology", "pressure", "thermometer", "visibility", "warning",
    "beach", "cave", "cliff", "desert", "field", "forest", "hill", "jungle", "lake", "meadow",
    "mountain", "ocean", "pond", "river", "sea", "stream", "valley", "volcano", "waterfall", "wilderness",
    "canyon", "coast", "creek", "delta", "dune", "glacier", "grove", "habitat", "island", "marsh"
  ];

  weather.forEach(term => {
    words.push({
      word: term,
      freq: Math.floor(Math.random() * 25) + 35,
      category: "nature",
      synonyms: []
    });
  });

  // Materials and substances (100+ words)
  const materials = [
    "aluminum", "brass", "bronze", "carbon", "ceramic", "clay", "concrete", "copper", "cotton", "crystal",
    "diamond", "fabric", "fiber", "glass", "gold", "iron", "leather", "marble", "metal", "paper",
    "plastic", "rubber", "silk", "silver", "steel", "stone", "wood", "wool", "bamboo", "brick",
    "cement", "charcoal", "chrome", "coal", "cork", "denim", "foam", "granite", "hemp", "ivory",
    "jade", "lace", "latex", "lead", "linen", "nylon", "oak", "pearl", "pine", "platinum",
    "porcelain", "quartz", "resin", "sand", "satin", "slate", "suede", "tin", "titanium", "velvet",
    "vinyl", "wax", "zinc", "acrylic", "alloy", "asphalt", "canvas", "cardboard", "celluloid", "composite",
    "enamel", "epoxy", "felt", "fiberglass", "graphite", "gypsum", "hardwood", "insulation", "laminate", "limestone",
    "mahogany", "mesh", "mica", "nickel", "paint", "plaster", "plywood", "polymer", "polyester", "sandstone",
    "shellac", "softwood", "stainless", "synthetic", "tar", "textile", "tile", "timber", "tungsten", "varnish"
  ];

  materials.forEach(material => {
    words.push({
      word: material,
      freq: Math.floor(Math.random() * 20) + 30,
      category: "material",
      synonyms: []
    });
  });

  return words;
};

const newWords = generateUltimateWords();

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
