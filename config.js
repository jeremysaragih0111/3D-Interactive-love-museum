/* ============================================================
   CONFIG — Edit this file to personalize your museum
   All values marked PLACEHOLDER are safe to replace.
   ============================================================ */
window.LOVE_CONFIG = {
  couple: {
    nameA: "Alex",              // PLACEHOLDER
    nameB: "Jordan",            // PLACEHOLDER
    anniversaryLabel: "12.12.2021",
    relationshipStart: "2021-12-12T19:30:00+07:00", // PLACEHOLDER
    anniversaryMonthDay: { month: 12, day: 12 }
  },

  museum: {
    title: "Our Little Love Museum",
    tagline: "A digital sanctuary of every moment we've kept."
  },

  beginning: {
    date: "12 December 2021",   // PLACEHOLDER
    place: "The little café on Maple Street", // PLACEHOLDER
    journalTitle: "Where the Story Began",
    journal: [
      "It was a rainy Tuesday when the doorbell chimed and the whole room seemed to tilt. You walked in with a half-open umbrella and a laugh that already felt like home.",
      "We talked until the barista started stacking chairs. I remember thinking: this is the kind of ordinary I want to keep forever.",
      "That night I wrote your name in my notebook and underlined it twice — not knowing you'd become the whole story."
    ],
    photo: "assets/images/beginning.jpg", // PLACEHOLDER
    photoCaption: "The first photo we ever took together."
  },

  timeline: [
    {
      date: "12 Dec 2021",
      title: "First Meeting",
      story: "A rainy café, two cups of cocoa, and a conversation that refused to end.",
      photo: "assets/images/timeline-1.jpg"
    },
    {
      date: "24 Dec 2021",
      title: "First Gift",
      story: "You gave me a tiny paper star. I still keep it in my wallet.",
      photo: "assets/images/timeline-2.jpg"
    },
    {
      date: "14 Feb 2022",
      title: "First Valentine",
      story: "We watched the city lights from the rooftop and promised to always find each other.",
      photo: "assets/images/timeline-3.jpg"
    },
    {
      date: "12 Dec 2022",
      title: "One Year Together",
      story: "A whole year of small adventures — and I still reach for your hand first.",
      photo: "assets/images/timeline-4.jpg"
    },
    {
      date: "12 Dec 2023",
      title: "Two Years",
      story: "We built a little home out of inside jokes and Sunday mornings.",
      photo: "assets/images/timeline-5.jpg"
    }
  ],

  gallery: [
    { src: "assets/images/gallery-1.jpg", caption: "The first photo we ever took." },
    { src: "assets/images/gallery-2.jpg", caption: "That sunset at the pier." },
    { src: "assets/images/gallery-3.jpg", caption: "Your laugh, mid-story." },
    { src: "assets/images/gallery-4.jpg", caption: "Our tiny kitchen dance." },
    { src: "assets/images/gallery-5.jpg", caption: "Snow on your eyelashes." },
    { src: "assets/images/gallery-6.jpg", caption: "Always the same hand." }
  ],

  letters: [
    {
      title: "To You, Always",
      body: "My dearest,\n\nIf I could fold every ordinary morning into a letter, I would. I would tell you about the way the kettle hums before you wake, and how the light finds your face at 7:12 exactly. I would tell you that loving you is the easiest thing I have ever done.\n\nYours, forever,\nA."
    },
    {
      title: "On the Days You Forget",
      body: "On the days you forget how good you are, read this twice.\n\nYou are the kind of person who remembers birthdays, who leaves the porch light on, who believes in small kindnesses. I fell in love with that — and I stay in love with it.\n\nWith all of me,\nJ."
    }
  ],

  surprise: {
    teaser: "There's something waiting for you inside…",
    message: "You are my favorite 'what if' that came true. Thank you for choosing me, every single day. Here's to every year we haven't met yet.",
    signature: "With all my love"
  },

  forever: {
    headline: "And Our Story Continues…",
    message: "Wherever the years take us — another city, another season, another page — I hope we keep writing this together. Slow, steady, and full of light.",
    photo: "assets/images/forever.jpg"
  },

  audio: {
    musicPath: "assets/music/romantic.mp3", // PLACEHOLDER — drop an mp3 here
    musicVolume: 0.35,
    sfxEnabled: true,
    ambience: true
  },

  visuals: {
    particleCount: 90,
    enableThree: true,
    reducedMotionRespect: true
  }
};