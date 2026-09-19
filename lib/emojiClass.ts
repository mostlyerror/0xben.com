// Per-card emoji hover personality (see globals.css). Keys must match the
// emoji literals in lib/site.ts exactly, including any U+FE0F variation
// selector. Unmapped emoji fall back to the base .toy-emoji pop.
export const emojiClass: Record<string, string> = {
  // projects
  "🏓": "emoji-pickle",
  "🌦️": "emoji-rain",
  "📈": "emoji-chart",
  "💌": "emoji-letter",
  "📞": "emoji-phone",
  "🌐": "emoji-globe",
  "🍽️": "emoji-plate",
  "🌡️": "emoji-temp",
  // interests (reuse existing animations, no new CSS)
  "🎨": "emoji-plate",
  "🀄": "emoji-letter",
  "💃": "emoji-plate",
  "⚽": "emoji-pickle",
  "🏋️": "emoji-temp",
  "🧘": "emoji-temp",
  "🍳": "emoji-plate",
  "📚": "emoji-letter",
  "🏃": "emoji-pickle",
  "🌙": "emoji-temp",
  "✈️": "emoji-globe",
};
