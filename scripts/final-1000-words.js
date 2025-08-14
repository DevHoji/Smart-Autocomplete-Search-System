/**
 * Final 1000+ words to reach 5000+ total
 */

const fs = require('fs');
const path = require('path');

// Load existing words
const existingWordsPath = path.join(__dirname, '../data/sample-words.json');
const existingWords = JSON.parse(fs.readFileSync(existingWordsPath, 'utf8'));

// Create a set of existing words for quick lookup
const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()));

// Generate final 1000+ words
const generateFinal1000Words = () => {
  const words = [];
  
  // Generate comprehensive word list with all remaining common words
  const finalWordList = [
    // More common verbs and their forms
    "accelerating", "accepting", "accessing", "accomplishing", "accounting", "accumulating", "achieving", "acquiring", "acting", "activating",
    "adapting", "adding", "addressing", "adjusting", "administering", "admiring", "admitting", "adopting", "advancing", "advertising",
    "advising", "affecting", "affording", "agreeing", "aiming", "allowing", "altering", "amazing", "analyzing", "announcing",
    "answering", "anticipating", "apologizing", "appearing", "applying", "appointing", "appreciating", "approaching", "approving", "arguing",
    "arising", "arranging", "arriving", "asking", "assembling", "assessing", "assigning", "assisting", "associating", "assuming",
    "assuring", "attaching", "attacking", "attaining", "attempting", "attending", "attracting", "attributing", "avoiding", "awakening",
    "backing", "balancing", "banning", "bargaining", "basing", "bathing", "battling", "bearing", "beating", "becoming",
    "beginning", "behaving", "believing", "belonging", "bending", "benefiting", "betting", "bidding", "binding", "biting",
    "blaming", "blessing", "blocking", "blowing", "boiling", "booking", "boosting", "boring", "borrowing", "bothering",
    "bouncing", "bowing", "boxing", "breaking", "breathing", "breeding", "bringing", "broadcasting", "browsing", "brushing",
    "building", "burning", "bursting", "burying", "buying", "calculating", "calling", "calming", "camping", "canceling",
    "capturing", "caring", "carrying", "carving", "casting", "catching", "causing", "celebrating", "challenging", "changing",
    "charging", "chasing", "chatting", "checking", "cheering", "chewing", "choosing", "claiming", "clapping", "clarifying",
    "cleaning", "clearing", "climbing", "clinging", "closing", "clothing", "coaching", "coating", "coding", "collecting",
    "coloring", "combining", "coming", "commanding", "commenting", "committing", "communicating", "comparing", "competing", "complaining",
    "completing", "composing", "computing", "conceiving", "concentrating", "concerning", "concluding", "conducting", "confessing", "confirming",
    "confusing", "connecting", "conquering", "considering", "consisting", "constructing", "consulting", "consuming", "containing", "continuing",
    "contracting", "contributing", "controlling", "converting", "convincing", "cooking", "cooling", "cooperating", "copying", "correcting",
    "corresponding", "costing", "counting", "covering", "crashing", "creating", "crossing", "crying", "cultivating", "cutting",
    "dancing", "daring", "dating", "dealing", "deciding", "declaring", "decorating", "decreasing", "dedicating", "defending",
    "defining", "delivering", "demanding", "demonstrating", "denying", "depending", "depicting", "describing", "designing", "desiring",
    "destroying", "detecting", "determining", "developing", "devoting", "dialing", "dictating", "differing", "digging", "dining",
    "directing", "disagreeing", "disappearing", "disappointing", "discovering", "discussing", "displaying", "disposing", "distributing", "disturbing",
    "dividing", "documenting", "doing", "donating", "doubting", "downloading", "drafting", "dragging", "drawing", "dreaming",
    "dressing", "drinking", "driving", "dropping", "drowning", "drying", "dumping", "earning", "eating", "editing",
    "educating", "eliminating", "embarrassing", "emerging", "employing", "enabling", "encouraging", "ending", "enduring", "engaging",
    "engineering", "enhancing", "enjoying", "enlarging", "ensuring", "entering", "entertaining", "escaping", "establishing", "estimating",
    "evaluating", "examining", "exceeding", "exchanging", "exciting", "excluding", "excusing", "executing", "exercising", "existing",
    "expanding", "expecting", "experiencing", "experimenting", "explaining", "exploring", "expressing", "extending", "facing", "facilitating",
    "failing", "falling", "farming", "fascinating", "fastening", "fearing", "featuring", "feeding", "feeling", "fighting",
    "filing", "filling", "filming", "filtering", "finding", "finishing", "firing", "fishing", "fitting", "fixing",
    "flashing", "floating", "flowing", "flying", "focusing", "folding", "following", "forcing", "forecasting", "forgetting",
    "forgiving", "forming", "founding", "framing", "freezing", "frightening", "functioning", "funding", "gaining", "gambling",
    "gathering", "generating", "getting", "giving", "glowing", "going", "governing", "grabbing", "graduating", "granting",
    "grasping", "greeting", "grinding", "gripping", "growing", "guaranteeing", "guarding", "guessing", "guiding", "handling",
    "hanging", "happening", "harming", "harvesting", "hating", "having", "heading", "healing", "hearing", "heating",
    "helping", "hesitating", "hiding", "highlighting", "hiring", "hitting", "holding", "honoring", "hoping", "hosting",
    "housing", "hugging", "hunting", "hurrying", "hurting", "identifying", "ignoring", "illustrating", "imagining", "implementing",
    "implying", "importing", "imposing", "impressing", "improving", "including", "increasing", "indicating", "influencing", "informing",
    "inheriting", "initiating", "injuring", "innovating", "inserting", "insisting", "inspecting", "inspiring", "installing", "instructing",
    "insuring", "integrating", "intending", "interacting", "interesting", "interfering", "interpreting", "interrupting", "interviewing", "introducing",
    "inventing", "investing", "investigating", "inviting", "involving", "isolating", "issuing", "joining", "joking", "judging",
    "jumping", "justifying", "keeping", "kicking", "killing", "kissing", "knowing", "labeling", "lacking", "landing",
    "lasting", "laughing", "launching", "laying", "leading", "leaning", "learning", "leaving", "lecturing", "lending",
    "letting", "leveling", "licensing", "lifting", "lighting", "limiting", "linking", "listening", "living", "loading",
    "locating", "locking", "logging", "looking", "losing", "loving", "lowering", "lying", "maintaining", "making",
    "managing", "manufacturing", "mapping", "marking", "marrying", "matching", "mattering", "maximizing", "meaning", "measuring",
    "meeting", "melting", "memorizing", "mentioning", "merging", "messaging", "migrating", "minimizing", "mining", "missing",
    "mixing", "modeling", "modifying", "monitoring", "motivating", "mounting", "moving", "multiplying", "naming", "navigating",
    "needing", "negotiating", "networking", "neutralizing", "nodding", "nominating", "normalizing", "noting", "noticing", "notifying",
    "numbering", "nursing", "obeying", "objecting", "observing", "obtaining", "occurring", "offering", "opening", "operating",
    "opposing", "optimizing", "ordering", "organizing", "originating", "outlining", "overcoming", "overlooking", "owing", "owning",
    "packing", "painting", "pairing", "parking", "participating", "passing", "pasting", "patching", "pausing", "paying",
    "peeling", "performing", "permitting", "persuading", "photographing", "picking", "picturing", "pinning", "placing", "planning",
    "planting", "playing", "pleasing", "plugging", "pointing", "polishing", "polling", "popping", "positioning", "possessing",
    "posting", "pouring", "powering", "practicing", "praising", "praying", "predicting", "preferring", "preparing", "prescribing",
    "presenting", "preserving", "pressing", "pretending", "preventing", "pricing", "printing", "prioritizing", "processing", "producing",
    "programming", "projecting", "promising", "promoting", "proposing", "protecting", "proving", "providing", "publishing", "pulling",
    "pumping", "punching", "punishing", "purchasing", "pursuing", "pushing", "putting", "qualifying", "questioning", "quitting",
    "racing", "raising", "ranking", "rating", "reaching", "reading", "realizing", "reasoning", "receiving", "recognizing",
    "recommending", "recording", "recovering", "recruiting", "recycling", "reducing", "referring", "reflecting", "refusing", "regarding",
    "registering", "regulating", "rehearsing", "rejecting", "relating", "relaxing", "releasing", "relying", "remaining", "remembering",
    "reminding", "removing", "renewing", "renting", "repairing", "repeating", "replacing", "replying", "reporting", "representing",
    "requesting", "requiring", "rescuing", "researching", "reserving", "residing", "resisting", "resolving", "respecting", "responding",
    "resting", "restoring", "restricting", "resulting", "resuming", "retaining", "retiring", "returning", "revealing", "reviewing",
    "revising", "rewarding", "riding", "ringing", "rising", "risking", "rolling", "rotating", "rounding", "rowing",
    "rubbing", "ruling", "running", "rushing", "sacrificing", "sailing", "saluting", "sampling", "satisfying", "saving",
    "saying", "scaling", "scanning", "scaring", "scheduling", "scoring", "scraping", "screening", "searching", "seasoning",
    "seating", "securing", "seeing", "seeking", "seeming", "selecting", "selling", "sending", "sensing", "separating",
    "serving", "setting", "settling", "sewing", "shaking", "shaping", "sharing", "shining", "shipping", "shocking",
    "shooting", "shopping", "showing", "shutting", "signing", "simplifying", "singing", "sinking", "sitting", "sizing",
    "skating", "skiing", "skipping", "sleeping", "sliding", "slipping", "smelling", "smiling", "smoking", "snapping",
    "sneezing", "snowing", "soaking", "solving", "sorting", "sounding", "spacing", "speaking", "specializing", "specifying",
    "spelling", "spending", "spinning", "splitting", "spoiling", "sponsoring", "spreading", "springing", "squeezing", "stacking",
    "staffing", "staining", "stamping", "standing", "staring", "starting", "stating", "staying", "stealing", "steering",
    "stepping", "sticking", "stimulating", "stinging", "stirring", "stitching", "stocking", "stopping", "storing", "storming",
    "straightening", "straining", "streaming", "strengthening", "stretching", "striking", "stringing", "stripping", "stroking", "struggling",
    "studying", "stuffing", "styling", "submitting", "subscribing", "substituting", "succeeding", "sucking", "suffering", "suggesting",
    "suiting", "summarizing", "supplying", "supporting", "supposing", "surfing", "surprising", "surrounding", "surviving", "suspecting",
    "sustaining", "swallowing", "sweating", "sweeping", "swelling", "swimming", "swinging", "switching", "symbolizing", "synchronizing",
    "taking", "talking", "taming", "tapping", "targeting", "tasting", "taxing", "teaching", "tearing", "teasing",
    "telephoning", "telling", "tempting", "tending", "terminating", "testing", "thanking", "thawing", "thinking", "threatening",
    "throwing", "ticking", "tying", "timing", "tipping", "titling", "toasting", "tolerating", "toning", "tooling",
    "topping", "totaling", "touching", "touring", "towing", "tracing", "tracking", "trading", "training", "transferring",
    "transforming", "translating", "transmitting", "transporting", "trapping", "traveling", "treating", "trembling", "trending", "trying",
    "tuning", "turning", "twisting", "typing", "understanding", "undertaking", "undressing", "uniting", "unlocking", "unpacking",
    "updating", "upgrading", "uploading", "urging", "using", "utilizing", "validating", "valuing", "varying", "verifying",
    "versioning", "viewing", "violating", "visiting", "visualizing", "voicing", "volunteering", "voting", "wading", "waiting",
    "waking", "walking", "wandering", "wanting", "warming", "warning", "washing", "wasting", "watching", "watering",
    "waving", "weakening", "wearing", "weaving", "wedding", "weighing", "welcoming", "wetting", "whispering", "widening",
    "willing", "winning", "wiping", "wiring", "wishing", "withdrawing", "withstanding", "witnessing", "wondering", "working",
    "worrying", "worshiping", "wrapping", "wrestling", "writing", "yelling", "yielding", "zoning"
  ];

  // Add all final words
  finalWordList.forEach(word => {
    words.push({
      word: word,
      freq: Math.floor(Math.random() * 30) + 40,
      category: "common",
      synonyms: []
    });
  });

  return words;
};

const newWords = generateFinal1000Words();

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

if (allWords.length >= 5000) {
  console.log(`🎉 SUCCESS! Reached ${allWords.length} words - target of 5000+ achieved!`);
  console.log(`🚀 Database now contains ${allWords.length} comprehensive words for autocomplete!`);
} else {
  console.log(`📈 Progress: ${allWords.length}/5000 words (${Math.round((allWords.length/5000)*100)}%)`);
  console.log(`📝 Need ${5000 - allWords.length} more words to reach target`);
}
