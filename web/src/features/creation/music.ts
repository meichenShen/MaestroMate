import type { SoundLayer } from '../water/audio.ts';
import type { Melody } from '../water/model.ts';
export type BackingStyle = 'none' | 'chords' | 'arpeggio' | 'pulse';
// Original pentatonic ideas, not quotations or transcriptions of Aquarium.
export const melodyIdeas: Melody[] = [
  [0,2,3,4,3,2,1,0], [0,null,2,3,4,null,3,2], [2,1,0,null,0,2,3,null],
];
export const rhythmIdeas: Melody[] = [
  [0,4,2,4,0,4,2,4], [0,null,2,4,0,0,2,4], [0,4,null,2,0,4,2,null],
];
export function backingLayers(style: BackingStyle): SoundLayer[] {
  const base={instrument:'piano' as const,octave:-1,gain:.17};
  if(style==='chords') return [
    {...base,notes:[0,null,null,null,4,null,null,null],duration:.8},
    {...base,notes:[2,null,null,null,0,null,null,null],duration:.8},
    {...base,notes:[3,null,null,null,2,null,null,null],duration:.8},
  ];
  if(style==='arpeggio') return [{...base,notes:[0,2,3,2,4,0,2,0],duration:.3}];
  if(style==='pulse') return [{instrument:'drums',gain:.3,notes:[0,null,4,null,0,null,4,null]}];
  return [];
}

export function drumTracks(pattern: Melody): Melody[] {
  return [0,2,4].map(note=>Array.from({length:8},(_,i)=>pattern[i]===note ? note : null));
}
