// The projects, from the portfolio's write-ups (portfolio/src/content/work).
// Order is by strength: the one with the clearest result first. Airport
// pickup is second though its page is still to come; Airport drop-off waits
// for its write-up. The video plays on a Studio Display.
// `soon`: on the work with no project page (no link, the cursor says "Coming
// soon"); `still`: the screen is the poster alone, no clip.

const M = 'assets/closeup/media/';

export const PROJECTS = [
  {
    slug: 'activity',
    color: '#2340B8', // the project's colour (primary-colour trial)
    ground: 'steel',
    title: 'Activity',
    tagline: 'Every ride in one place',
    summary: 'One feed for every ride. Riders now open past trips 23% more often.',
    role: 'Lead designer, Bolt, 2026',
    clip: 'assets/closeup/activity',
    facts: [['Role', 'Lead designer'], ['Company', 'Bolt'], ['When', 'Dec 2025 – Aug 2026']],
    figure: ['+23%', 'riders opening past trips'],
    sections: [
      { label: 'Problem', text: [
        'For riders, finding a past ride was harder than it needed to be. The old Rides tab was split in two, Past and Upcoming, and if you had a ride scheduled, Upcoming opened first: one ride and a lot of empty space. Every car ride had a little rebook icon, but it wasn’t clear what it did, and hardly anyone used it. The name didn’t fit either. “Rides” held orders from every service, including scooters and car rental, and one day it might hold Bolt Food orders too. On top of that, it all looked uninspiring. The tab needed a fresh look and better usability.',
      ] },
      { compare: { before: M + 'activity-rides-before.webp', after: M + 'activity-rides-after.webp', caption: 'The old Rides tab, and the new Activity tab' } },
      { compare: { before: M + 'activity-upcoming-before.webp', after: M + 'activity-upcoming-after.webp', caption: 'Upcoming rides before vs after' } },
      { label: 'Research', text: [
        'I ran usability testing on the first concepts, and it changed what I thought the page was for. Riders weren’t there to rebook. They came to check what they’d spent, and business users came to find rides for their expense reports.',
        'When people did want a past ride again, they typed it into “Where to?”. Analytics agreed: under 1% of rides came from rebook. So I designed the tab for finding things, not rebooking them.',
      ] },
      { row: [
        { src: M + 'activity-rebook-finding.webp', alt: 'Finding: riders went to “Where to?”, not Activity, to rebook', w: 2334, h: 2355 },
        { src: M + 'activity-filter-easy-to-miss.webp', alt: 'Everyone missed the filter at first', w: 2334, h: 1380 },
      ] },
      { label: 'Design', text: [
        'The latest ride sits at the top in a bigger card, with a map. The most recent ride is the one people care about most: it’s the one you just paid for, and the one you might want to rate. It’s also the only row with buttons. Moving the actions onto one card made room for Add rating next to Rebook, and kept the rest of the list easy to scan for prices. The card now gets more use than every other row put together: 15.1% of visits against 11.3%.',
        'Research showed people find a past ride by date, then check the address, so I built the filter around how they search: service, profile, who rode, and dates. A group only shows up if it has more than one option.',
      ] },
      // The pieces, each on its own: the featured card (its buttons press),
      // the filter sheet (live), and list rows in different states, annotated.
      // Rows are captured from the playground; note points are in the row's
      // own points (373 wide), at the element they describe.
      { ui: {
        card: { src: M + 'activity-ui-featured.webp', caption: 'The featured card, for the latest ride', buttons: [['Add rating', 88, 230, 102], ['Rebook', 198, 230, 83]] },
        filter: { id: 'activity-filter', caption: 'The filter sheet' },
        list: { caption: 'List rows in different states', rows: [
          { src: M + 'activity-ui-city-airport.webp', h: 96, notes: [[355, 26, 'Right-aligned price'], [289, 65, 'Cancelled status']] },
          { src: M + 'activity-ui-canary.webp', h: 117, notes: [[290, 51, 'Extra stops'], [158, 91, 'Work profile tag']] },
          { src: M + 'activity-ui-scooter.webp', h: 96, notes: [[208, 41, 'Distance and time, for scooters']] },
          { src: M + 'activity-ui-leyton.webp', h: 96, notes: [[225, 65, 'Family member’s name']] },
        ] },
      } },
      { text: [ // more of Design, introducing the states board
        'Dealing with numerous states of the activity was the most challenging part of the design. Every kind of order brings its own past, ongoing and upcoming states. A ride, a scooter and a rental each show different statuses and actions, and on top of those sit cancelled and scheduled rides, family members’ rides, a scheduled ride in another timezone, etc.',
      ] },
      { media: { src: M + 'activity-states.jpg', alt: 'Every state of Activity, mapped in Figma', ratio: '4355 / 2332', bleed: true } },
      { label: 'Shipped', text: [
        'Activity raised the quality bar of the app, both visually and functionally.',
      ], list: [
        'One feed for ongoing, upcoming and past rides, ordered by what matters now',
        'Easy-to-read prices, work tags and month headings',
        'Filters for service, profile and date',
        'Rebook off the list, onto a featured card only for the latest ride',
        'Backend-driven, so the tab can change without an app release',
      ] },
      { label: 'Results', text: [
        'A two-week global A/B test came back clean: orders, GMV and cancellations held flat. Riders opened past trips 23% more often (23.2% of visits, up from 18.8%), and the featured card drew more taps than every other row combined. Activity rolled out to all riders in August 2026.',
      ] },
      { label: 'Learnings', text: [
        'Activity took eight months, from the first concept in December 2025 to the roll-out in August 2026. It touched every service, so a lot of that time went into aligning stakeholders and making sure needs of different functions were met.',
        'It taught me to be systematic: break a big project into sequences, and map every state before building on top of it. It also taught me stakeholder management. Talking to every stakeholder early, and keeping them in the loop, is what kept Activity moving.',
      ] },
    ],
  },
  {
    // Coming soon: a still of the playground's "Airport pickup — London, map
    // first" Home, and no project page yet.
    slug: 'airport-pickup',
    soon: true,
    still: true,
    title: 'Airport pickup',
    tagline: 'From arrivals to the car',
    summary: 'Finding your driver at the airport, from arrivals to the pickup point.',
    role: 'Lead designer, Bolt, 2026',
    clip: 'assets/closeup/airport-pickup',
    facts: [['Role', 'Lead designer'], ['Company', 'Bolt'], ['When', 'Aug 2026']],
    figure: null,
    sections: [],
  },
  {
    slug: 'search-bar',
    color: '#C93A1F', // the project's colour (primary-colour trial)
    ground: 'sage',
    title: 'Search bar',
    tagline: 'A visual revamp',
    summary: 'Two address fields, one trip. I joined pickup and destination into a single connected route.',
    role: 'Lead designer, Bolt, 2026',
    clip: 'assets/closeup/search-bar',
    facts: [['Role', 'Lead designer'], ['Company', 'Bolt'], ['When', 'Jul – Sep 2026']],
    figure: null, // a no-harm test: no headline number to make big
    sections: [
      { label: 'Approach', text: [
        'Pickup and destination sat in two separate fields, so nothing showed they made one trip, or which way it went.',
        'I joined them into one connected field: pickup, stops and destination on a single route.',
        'I reused the route styling from the order flow rather than inventing new icons, so a route now reads the same from search to receipt.',
      ] },
      { compare: { before: M + 'search-bar-search-before.webp', after: M + 'search-bar-search-after.webp', caption: 'The search screen, before and after' } },
      { compare: { before: M + 'search-bar-route-before.webp', after: M + 'search-bar-route-after.webp', caption: 'The route in an active order, before and after' } },
      { label: 'Results', text: [
        'A no-harm A/B test kept orders and GMV neutral, with every trend positive. Session-to-finish rose 0.14%, though it isn’t counted, since riders joined the test before reaching search. The new search bar has been live for all riders since October 2026.',
      ] },
    ],
  },
  {
    slug: 'route-animation',
    color: '#F0B428', // the project's colour (primary-colour trial)
    ground: 'sand',
    title: 'Route animation',
    tagline: 'The trip in motion',
    summary: 'Motion with a job. A shine sweeps along the route, showing riders which way their trip goes before they book.',
    role: 'Lead designer, Bolt, 2026',
    clip: 'assets/closeup/route-animation',
    facts: [['Role', 'Lead designer'], ['Company', 'Bolt'], ['When', 'Jun 2026']],
    figure: ['+0.09%', 'order-to-finish, a significant lift'],
    sections: [
      { label: 'Overview', text: [
        'We added a subtle animation to Bolt’s route line to make the direction of travel clearer on the order screen.',
        'A highlight moves along the route from pickup to destination. This provides a directional cue, helping riders interpret the route and verify their ride details before booking. The motion is deliberately restrained. It adds a sense of activity while keeping attention on the primary tasks: selecting a ride category and placing an order. The animation is optimised to preserve battery - it disables in low battery mode, and stops after an extended time on the screen.',
        'The goal was to use motion as functional feedback and add delight to ride hailing experience with minimal overhead.',
      ] },
      { duo: { clips: [[M + 'route-animation-light', 'Light'], [M + 'route-animation-dark', 'Dark']], caption: 'Route animation in light and dark mode' } },
    ],
  },
  {
    slug: 'design-workflow-ai',
    ground: 'mist',
    kind: 'display',
    title: 'Design workflow with AI',
    tagline: 'A walkthrough for the design org',
    summary: 'A video I made for Bolt’s design org on a live project: Claude turns usability findings into three directions in Figma, builds one into a prototype, then changes the real app.',
    role: 'Video, Bolt, 2026',
    clip: M + 'design-workflow-ai-preview', // chapters 2–3 (0:32–1:24), fading back to its start
    preview: { from: 32, total: 271 },
    facts: [['Role', 'Presenter'], ['Company', 'Bolt'], ['When', 'Oct 2026']],
    figure: null,
    sections: [
      { player: {
        video: M + 'design-workflow-ai.mp4', poster: M + 'design-workflow-ai-poster.jpg',
        chapters: [
          [7, 'Intro'], [32, 'Giving Claude context over Figma MCP'], [47, 'Research into three directions'],
          [84, 'Figma frame to prototype'], [113, 'Testing what it built'], [152, 'Context makes it one-shot'],
          [187, 'Design edits in real code'], [226, 'QA in the simulator'], [253, 'Wrap-up'],
        ],
      } },
    ],
  },
];

// Play: personal pieces, each as its object, centred where the phone stands.
// Heights are shares of the phone's height, set by eye for an even visual
// weight: the dense chair smallest, the thin lamp tallest.
export const PLAY = [
  {
    slug: 'character-house',
    title: 'Character House',
    summary: 'Furniture made of Chinese characters. Pull the lamp’s 灯 cord.',
    role: 'Personal project, 2026',
    img: 'assets/closeup/lamp.png', ratio: (1227 - 818) / (1865 - 228), scale: 0.86, // FLOOR_LAMP.BOUNDS
    url: 'https://characterhouse.claracao.work/',
    // the tile is the real lamp: its 灯 cord swings and pulls (closeup.js, liveLamp)
    live: 'lamp',
  },
  {
    slug: 'rest-in-pieces',
    title: 'Rest in Pieces',
    summary: 'A virtual tombstone. Leave a flower on the stone; when it rots, it feeds the next one.',
    role: 'Personal project, 2026',
    img: 'assets/closeup/flower.png', ratio: 298 / 481, scale: 0.58,
    url: 'https://claracao.work/rest-in-pieces/',
  },
  {
    slug: 'iconic-chairs',
    title: 'Iconic Chairs',
    summary: 'An interactive 3D archive of 20 chairs that changed design, from the Wassily to the Egg.',
    role: 'Personal project, 2026',
    img: 'assets/closeup/chair.png', ratio: 774 / 943, scale: 0.52,
    url: 'https://claracao.work/iconic-chairs/',
  },
];
