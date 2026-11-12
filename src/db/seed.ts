import type { ShiftTemplate } from './schema'

const TEN_MIN = 600

type Seed = Omit<ShiftTemplate, 'order' | 'isPreset' | 'createdAt' | 'updatedAt' | 'durationSec'>

const SEEDS: Seed[] = [
  {
    id: 'opening-shift',
    name: 'Opening Shift',
    subtitle: 'Morning self-care',
    icon: '🌅',
    category: 'self_care',
    suggestPhoto: false,
    standardSteps: [
      'Drink a full glass of water',
      'Open the curtains and let some light in',
      'Brush your teeth',
      'Splash your face with water',
      'Put on clean clothes',
      'Take any morning medication',
      'Make the bed (rough is fine)',
      'Eat something small, even a piece of fruit',
      'Stretch your arms up for three slow breaths',
    ],
    lowBatterySteps: [
      'Drink a glass of water',
      'Brush your teeth',
      'Take any medication',
      'Open one curtain',
    ],
  },
  {
    id: 'closing-shift',
    name: 'Closing Shift',
    subtitle: 'Evening kitchen & living room',
    icon: '🌙',
    category: 'home',
    suggestPhoto: true,
    standardSteps: [
      'Carry every cup and plate to the kitchen',
      'Load or stack dishes by the sink',
      'Wipe the kitchen counter',
      'Put leftovers in the fridge',
      'Take out the rubbish if the bin is full',
      'Fold any blankets on the sofa',
      'Plump the cushions',
      'Gather loose items into one basket',
      'Set out tomorrow’s mug or bowl',
    ],
    lowBatterySteps: [
      'Put rubbish in bin only',
      'Carry cups to the kitchen',
      'Put food away so it doesn’t spoil',
    ],
  },
  {
    id: 'kitchen-triage',
    name: 'Kitchen Triage',
    subtitle: 'Get the kitchen usable again',
    icon: '🍽️',
    category: 'home',
    suggestPhoto: true,
    standardSteps: [
      'Throw away any obvious rubbish',
      'Clear the sink so it’s empty',
      'Run hot soapy water',
      'Wash the dishes you need for tomorrow',
      'Empty the dish rack or dishwasher',
      'Wipe the counter next to the hob',
      'Wipe the hob',
      'Sweep crumbs off the floor by the counter',
    ],
    lowBatterySteps: [
      'Put rubbish in bin only',
      'Stack dirty dishes by the sink',
      'Wash one mug and one plate',
    ],
  },
  {
    id: 'bedroom-floor-reset',
    name: 'Bedroom Floor Reset',
    subtitle: 'Find the floor again',
    icon: '🛏️',
    category: 'home',
    suggestPhoto: true,
    standardSteps: [
      'Pick up all rubbish into one bag',
      'Gather dirty clothes into the laundry basket',
      'Carry cups and plates out of the room',
      'Hang up or fold clean clothes',
      'Put shoes in one spot',
      'Clear the bedside table',
      'Straighten the duvet',
      'Open a window for some fresh air',
    ],
    lowBatterySteps: [
      'Put rubbish in bin only',
      'Toss clothes into one pile or basket',
      'Take cups to the kitchen',
    ],
  },
  {
    id: 'quick-bathroom-wipe',
    name: 'Quick Bathroom Wipe',
    subtitle: 'A fast freshen-up',
    icon: '🫧',
    category: 'home',
    suggestPhoto: true,
    standardSteps: [
      'Put away bottles and products',
      'Spray the sink and taps',
      'Wipe the sink and taps',
      'Wipe the mirror',
      'Wipe the toilet seat and handle',
      'Swap in a fresh hand towel',
      'Empty the bathroom bin',
      'Give the floor a quick wipe',
    ],
    lowBatterySteps: [
      'Put rubbish in bin only',
      'Wipe the sink with a damp cloth',
      'Hang the towel up to dry',
    ],
  },
]

export function buildSeedTemplates(now = Date.now()): ShiftTemplate[] {
  return SEEDS.map((s, i) => ({
    ...s,
    durationSec: TEN_MIN,
    order: i,
    isPreset: true,
    createdAt: now,
    updatedAt: now,
  }))
}
