/**
 * The page's copy. A shared page is English only and reached by its link
 * alone, so it keeps its words beside it rather than in the site's catalogs,
 * which hold every key in both locales.
 */

export type GhostSide = 'a' | 'b';
export type GhostState = 'pumpkin' | 'ghost';

const NAMES: Record<GhostSide, string> = { a: 'Ghost A', b: 'Ghost B' };

export const SPOOKY_COPY = {
  title: 'Spooky',
  description:
    'Two ghosts, far apart, that always answer opposite: a small story of quantum entanglement.',
  hero: {
    greeting: 'Hi Gabs.',
    intro: 'Thinking about a nickname, I found the perfect one:',
    ask: 'Would you like to be my',
    title: 'Spooky?',
    cue: 'Read on, if you dare',
  },
  secret: {
    title: 'Two ghosts, one secret',
    paragraphs: [
      'In quantum mechanics, a particle can be in two states at once. Not “one of them, we just don’t know which”, but genuinely both, until someone looks. Looking is called a measurement, and it forces the particle to pick one.',
      'Now make two particles together, in a way that ties their fates: entangle them. Send one to the next room and the other to the far side of the galaxy. Each one is still both states at once. But the moment you measure one, the other is no longer undecided. It has the opposite answer, every single time, however far away it is.',
    ],
  },
  demo: {
    title: 'Try it: look at a ghost',
    hint: 'Each ghost is a pumpkin and a ghost at once, until someone looks.',
    names: NAMES,
    places: { a: 'Here', b: 'Light-years away' } as Record<GhostSide, string>,
    states: { pumpkin: 'Pumpkin', ghost: 'Ghost' } as Record<
      GhostState,
      string
    >,
    undecided: 'Both at once',
    measure: (side: GhostSide) => `Look at ${NAMES[side]}`,
    again: 'Entangle them again',
    tap: 'Tap a ghost to look at it',
    idle: 'Nobody has looked yet: both are still undecided.',
    result: (side: GhostSide, state: GhostState, other: GhostState) =>
      `You looked at ${NAMES[side]}: ${state}. So ${NAMES[side === 'a' ? 'b' : 'a']}, light-years away, is a ${other}.`,
    tally: (times: number, pumpkins: number) =>
      `Looked ${times} ${times === 1 ? 'time' : 'times'}. ${NAMES.a} came out a pumpkin ${pumpkins} and a ghost ${times - pumpkins}: chance. The two disagreed ${times} out of ${times}: never chance.`,
  },
  letter: {
    title: 'Spukhafte Fernwirkung',
    paragraphs: [
      'On 3 March 1947, Albert Einstein wrote to his old friend Max Born, one of the fathers of quantum mechanics. Einstein had helped found the theory, but he never made peace with this part of it. Physics, he argued, should describe a real world in space and time, without one place mysteriously affecting another far away.',
      'He called it spukhafte Fernwirkung. In German, Spuk is a ghost, an apparition. The phrase reached English as “spooky action at a distance”, but its first meaning is even more Halloween: ghostly action at a distance.',
    ],
    quote: 'spukhafte Fernwirkung',
    gloss: '“ghostly action at a distance”',
  },
  real: {
    title: 'The ghosts were real',
    paragraphs: [
      'Einstein died in 1955 convinced the theory was missing something. In 1964, John Bell found a way to put it to the test, and the experiments that followed sided with the ghosts. Alain Aspect, John Clauser and Anton Zeilinger shared the 2022 Nobel Prize in Physics for them.',
      'One honest detail: nothing travels between the two. You can’t send a message this way, since each answer on its own is random. What is shared is the connection itself: whatever happens to one is already tied to the other, at any distance.',
    ],
  },
  finale: {
    lines: [
      'Wherever we are in space and time, we can be entangled.',
      'No signal to send, no distance too far: just two ghosts who always know each other’s answer.',
    ],
    ask: 'Will you be my Spooky?',
  },
} as const;
