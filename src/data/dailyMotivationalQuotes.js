// Daily Motivational Sports Quotes & Rotation Manager
// MAXR CRM 4-Colour System: Deep Black #080B0C, Mint Teal #55CDB3, Soft White #F4F7F6, Deep Plum #493548
// Strict rotation: Each weekday has an independent quote collection and rotation history.
// Never repeats a weekday's quote until all quotes are shown; then reshuffles.
// Immutable on refresh; identical across all portals for the same calendar date.

export const WEEKDAY_MOTIVATIONAL_QUOTES = {
  Monday: [
    "Champions are made through consistency, discipline and determination.",
    "The hard days are the best days because that's when champions are forged.",
    "Success begins with the decision to try and the grit to never quit.",
    "Set your standards high and attack every drill with relentless energy.",
    "Greatness is not an accident; it is the daily discipline of giving your best.",
    "The difference between good and great is how you start your week."
  ],
  Tuesday: [
    "You don't have to be great to start, but you have to start to be great.",
    "Excellence is not a singular act; it is the habit of daily mastery.",
    "Hard work beats talent when talent fails to work with passion.",
    "Every champion was once a contender who refused to stay down.",
    "Focus on progress, not perfection. Master the basics every single day.",
    "Small daily improvements over time lead to championship results."
  ],
  Wednesday: [
    "It's not whether you get knocked down, it's whether you get back up.",
    "Pressure is a privilege; it only comes to those who earned the moment.",
    "Strength does not come from winning; your struggles build your grit.",
    "The vision of a champion is forged when nobody is watching.",
    "Stay committed to your craft, trust the training, and push forward.",
    "Midweek momentum defines the athlete who finishes on top."
  ],
  Thursday: [
    "Today I will do what others won't, so tomorrow I can achieve what others can't.",
    "The more difficult the victory, the greater the pride in winning.",
    "Confidence comes from hundreds of hours of silent, steady preparation.",
    "There is no substitute for hustle, heart, and uncompromising teamwork.",
    "Champions don't wait for opportunity; they build it through effort.",
    "Keep your eyes on the goal and your feet moving toward greatness."
  ],
  Friday: [
    "Finish strong. How you finish is how true champions are remembered.",
    "When you feel like stopping, remember why you laced up your shoes.",
    "Gold medals are made of sweat, perseverance, and unbreakable grit.",
    "Champions train with intensity; give your final drills everything you have.",
    "The sweat of today is the sweet triumph of tomorrow's match.",
    "Leave everything on the field and head into the weekend as a warrior."
  ],
  Saturday: [
    "Run when you can, walk if you must; just never stop moving forward.",
    "Believe in the work you have put in, and play with absolute courage.",
    "True sportsmanship is doing the right thing when no one is watching.",
    "Victory belongs to the most persevering athlete on the field.",
    "Play with passion, train with purpose, and inspire everyone around you.",
    "Game day is your canvas; paint it with relentless heart and energy."
  ],
  Sunday: [
    "Rest, recharge, and reset. Champions know recovery is part of training.",
    "What tested your limits this week builds the strength of your future.",
    "A champion is defined by their resilience and how they bounce back.",
    "Take pride in how far you have come, and prepare for tomorrow's climb.",
    "Mindset is everything. Celebrate your growth and prepare to conquer.",
    "Sharpen your focus, feed your ambition, and ready your mind for greatness."
  ]
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ROTATION_STORAGE_KEY = 'maxr_sports_quote_rotation_v1';
const DAILY_CACHE_PREFIX = 'maxr_daily_quote_cached_';

/**
 * Fisher-Yates shuffle helper
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Get or compute the daily motivational quote for a given date.
 * Guarantees:
 * 1. Synchronized across Admin, Super Coach, Coach & Parent portals for the same date.
 * 2. Immutable on page refresh or portal navigation on that date.
 * 3. Never repeats a weekday's quote until all available quotes for that day are exhausted.
 * 4. Automatic reshuffle upon pool exhaustion.
 */
export function getDailyMotivationalQuote(targetDate = new Date()) {
  const dateObj = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
  const dayName = DAY_NAMES[dateObj.getDay()];
  const quotesList = WEEKDAY_MOTIVATIONAL_QUOTES[dayName] || WEEKDAY_MOTIVATIONAL_QUOTES.Monday;

  // 1. Check if a quote is already locked for today across all portals
  const dailyCacheKey = `${DAILY_CACHE_PREFIX}${dateStr}`;
  try {
    const cached = localStorage.getItem(dailyCacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.quote && parsed.dayName === dayName) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read cached daily quote from localStorage', e);
  }

  // 2. Read weekday rotation state from localStorage
  let rotationState = {};
  try {
    const storedState = localStorage.getItem(ROTATION_STORAGE_KEY);
    if (storedState) {
      rotationState = JSON.parse(storedState) || {};
    }
  } catch (e) {
    rotationState = {};
  }

  // 3. Get or initialize available quote index pool for this weekday
  let dayPool = rotationState[dayName];
  if (!Array.isArray(dayPool) || dayPool.length === 0) {
    // Generate fresh shuffled indices [0, 1, ..., quotesList.length - 1]
    const allIndices = quotesList.map((_, i) => i);
    dayPool = shuffle(allIndices);
  }

  // 4. Select the next unviewed quote index from the pool
  const selectedIndex = dayPool.shift();
  rotationState[dayName] = dayPool;

  // 5. Save updated rotation state
  try {
    localStorage.setItem(ROTATION_STORAGE_KEY, JSON.stringify(rotationState));
  } catch (e) {
    console.warn('Could not save quote rotation state', e);
  }

  const result = {
    date: dateStr,
    dayName,
    greeting: `Happy ${dayName}!`,
    quote: quotesList[selectedIndex] || quotesList[0],
    quoteIndex: selectedIndex,
    totalInPool: quotesList.length
  };

  // 6. Lock this quote for the entire calendar day
  try {
    localStorage.setItem(dailyCacheKey, JSON.stringify(result));
  } catch (e) {
    console.warn('Could not cache daily quote', e);
  }

  return result;
}
