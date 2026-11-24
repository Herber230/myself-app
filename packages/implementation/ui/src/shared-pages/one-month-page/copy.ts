/**
 * The page's copy. A shared page is English only and reached by its link
 * alone, so it keeps its words beside it rather than in the site's catalogs.
 */

export const ONE_MONTH_COPY = {
  title: 'One month',
  description:
    'A small story about a plan that did not go as planned, and a night that did.',
  hint: {
    first: 'Tap the right side to go on · the left to go back',
    next: 'Tap to continue',
    count: 'Tap the drum to count with me',
  },
  cover: {
    label: 'Cover',
    greeting: 'Hi Spooky.',
    plan: 'One month ago, I had a plan.',
    cue: 'Tap to begin',
  },
  plan: {
    label: 'The plan',
    lead: 'The plan was simple: take you out.',
    line: 'Not just anywhere, but to a piece of my life: a place with congas in the air.',
    soft: 'I wanted you to see a little of my world.',
  },
  knot: {
    label: 'Some things came up',
    lead: 'Then some things came up.',
    line: 'Just the timing, not quite on our side.',
    soft: 'And still, neither of us wanted to let it go.',
  },
  thought: {
    label: 'The thought',
    lead: 'If I was going to insist, it had to be worth insisting for.',
    line: 'My intentions had to be clear.',
  },
  ask: {
    label: 'The clumsy ask',
    drafts: ['So… about that date—', 'What if we—'],
    final: 'Would you be my girlfriend?',
    after: 'Not my smoothest move.',
  },
  yes: {
    label: 'Yes',
    lead: 'And you said yes.',
  },
  night: {
    label: 'The salsa night',
    lead: 'So we insisted. And we went.',
    line: 'I showed you a piece of my world: the congas, my friends, the place where I feel at home.',
    soft: 'Having you there made it an amazing night.',
  },
  count: {
    label: 'Count with me',
    lead: 'This is how my world keeps time.',
    explain:
      'Salsa is counted in eights: three steps, then a pause, and again.',
    legend: 'Step on 1, 2, 3 · pause on 4 · step on 5, 6, 7 · pause on 8',
    sound: '🔊 Sound on, and on an iPhone, the silent switch off.',
    tap: 'Tap',
    keepGoing: 'Keep going…',
    pause: 'pause',
    end: 'On 4 and 8, nobody steps: they’re pauses.',
    endSoft: 'And they’re part of the dance too.',
    next: 'Continue',
  },
  closing: {
    label: 'Closing',
    plans: 'I plan things, and they rarely go the way I planned.',
    lead: 'But in every version, the planned one and the unexpected one, I want to be with you.',
    last: 'Happy one month, Spooky.',
    again: 'Start again',
  },
} as const;
