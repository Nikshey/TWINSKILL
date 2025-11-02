/**
 * Gender detection module for avatar voice customization
 * This is a simplified implementation that makes assumptions based on name patterns
 * In a production environment, you would use a proper face recognition library
 */

// Common name patterns that are typically associated with females
const femaleNamePatterns = [
  /a$/, /i$/, /y$/, /e$/, /ia$/, /ie$/, /ine$/, /elle$/, /ette$/, /ina$/, 
  /essa$/, /anna$/, /ella$/, /olga$/, /maria$/, /sophia$/, /emma$/, /olivia$/,
  /ava$/, /isabella$/, /sophia$/, /charlotte$/, /mia$/, /amelia$/, /harper$/,
  /evelyn$/, /abigail$/, /emily$/, /elizabeth$/, /mila$/, /ella$/, /avery$/,
  /sofia$/, /camila$/, /aria$/, /scarlett$/, /victoria$/, /madison$/, /luna$/,
  /grace$/, /chloe$/, /penelope$/, /layla$/, /riley$/, /zoey$/, /nora$/, /lily$/,
  /eleanor$/, /hannah$/, /lillian$/, /addison$/, /aubrey$/, /ellie$/, /stella$/,
  /natalie$/, /zoe$/, /leah$/, /hazel$/, /violet$/, /aurora$/, /savannah$/,
  /audrey$/, /brooklyn$/, /bella$/, /claire$/, /skylar$/, /lucy$/, /paisley$/,
  /everly$/, /anna$/, /caroline$/, /nova$/, /genesis$/, /emilia$/, /kennedy$/,
  // Additional female names
  /sarah/, /jennifer/, /lisa/, /mary/, /linda/, /patricia/, /barbara/, /elizabeth/,
  /jennifer/, /maria/, /susan/, /margaret/, /dorothy/, /lisa/, /nancy/, /karen/,
  /betty/, /helen/, /sandra/, /donna/, /carol/, /ruth/, /sharon/, /michelle/,
  /laura/, /samantha/, /kimberly/, /deborah/, /jessica/, /shirley/, /cynthia/,
  /angela/, /melissa/, /brenda/, /amy/, /anna/, /rebecca/, /virginia/, /kathleen/,
  /pamela/, /martha/, /debra/, /amanda/, /stephanie/, /carolyn/, /christine/,
  /marie/, /janet/, /catherine/, /frances/, /ann/, /joyce/, /diane/, /alice/,
  /julie/, /heather/, /teresa/, /doris/, /gloria/, /evelyn/, /jean/, /cheryl/,
  /mildred/, /katherine/, /joan/, /ashley/, /judith/, /rose/, /janice/, /kelly/
];

// Common name patterns that are typically associated with males
const maleNamePatterns = [
  /o$/, /n$/, /r$/, /s$/, /l$/, /t$/, /d$/, /m$/, /j$/, /c$/, /p$/, /b$/, /g$/, /h$/, /k$/, /w$/, /x$/, /z$/,
  // Additional male names
  /james/, /john/, /robert/, /michael/, /william/, /david/, /richard/, /charles/,
  /joseph/, /thomas/, /christopher/, /daniel/, /paul/, /mark/, /donald/, /george/,
  /kenneth/, /steven/, /edward/, /brian/, /ronald/, /anthony/, /kevin/, /jason/,
  /matthew/, /gary/, /timothy/, /jose/, /larry/, /jeffrey/, /frank/, /scott/,
  /eric/, /stephen/, /andrew/, /raymond/, /gregory/, /joshua/, /jerry/, /dennis/,
  /walter/, /patrick/, /peter/, /harold/, /douglas/, /henry/, /carl/, /arthur/,
  /ryan/, /roger/, /joe/, /juan/, /jack/, /albert/, /jonathan/, /justin/,
  /terry/, /gerald/, /keith/, /samuel/, /willie/, /ralph/, /lawrence/, /nicholas/,
  /roy/, /benjamin/, /bruce/, /brandon/, /adam/, /harry/, /fred/, /wayne/,
  /billy/, /steve/, /louis/, /jeremy/, /aaron/, /randy/, /howard/, /eugene/,
  /carlos/, /russell/, /bobby/, /victor/, /martin/, /ernest/, /phillip/, /todd/,
  /jesse/, /craig/, /alan/, /shawn/, /clarence/, /sean/, /philip/, /chris/,
  /johnny/, /earl/, /jimmy/, /antonio/, /danny/, /bryan/, /tony/, /luis/,
  /mike/, /stanley/, /leonard/, /nathan/, /dale/, /manuel/, /rodney/, /curtis/,
  /norman/, /allen/, /marvin/, /vincent/, /glenn/, /jeffery/, /travis/, /jeff/
];

/**
 * Detect gender based on name patterns
 * @param {string} name - User's name
 * @returns {string} - 'female', 'male', or 'unknown'
 */
function detectGenderByName(name) {
  if (!name) return 'unknown';
  
  const lowerName = name.toLowerCase();
  
  // Check if name matches female patterns
  for (const pattern of femaleNamePatterns) {
    if (pattern.test(lowerName)) {
      return 'female';
    }
  }
  
  // Check if name matches male patterns
  for (const pattern of maleNamePatterns) {
    if (pattern.test(lowerName)) {
      return 'male';
    }
  }
  
  return 'unknown';
}

/**
 * Detect gender based on photo analysis
 * This is a simplified implementation - in production, you would use a face recognition API
 * @param {string} photoPath - Path to user's photo
 * @returns {string} - 'female', 'male', or 'unknown'
 */
async function detectGenderByPhoto(photoPath) {
  // In a real implementation, you would use a face recognition service like:
  // - Microsoft Face API
  // - Google Cloud Vision API
  // - Amazon Rekognition
  // - OpenCV with gender classification models
  
  // For now, we'll return 'unknown' and let the name-based detection handle it
  // This is just a placeholder
  return 'unknown';
}

/**
 * Get appropriate voice settings based on detected gender
 * @param {string} gender - Detected gender ('female', 'male', or 'unknown')
 * @returns {Object} - Voice settings for speech synthesis
 */
function getVoiceSettings(gender) {
  const voiceSettings = {
    female: {
      voiceURI: 'Google UK English Female',
      name: 'Google UK English Female',
      pitch: 1.2,  // Higher pitch for female voices
      rate: 1.0,
      volume: 1.0
    },
    male: {
      voiceURI: 'Google UK English Male',
      name: 'Google UK English Male',
      pitch: 0.8,  // Lower pitch for male voices
      rate: 1.0,
      volume: 1.0
    },
    unknown: {
      voiceURI: 'Google US English',
      name: 'Google US English',
      pitch: 1.0,
      rate: 1.0,
      volume: 1.0
    }
  };
  
  return voiceSettings[gender] || voiceSettings.unknown;
}

module.exports = {
  detectGenderByName,
  detectGenderByPhoto,
  getVoiceSettings
};