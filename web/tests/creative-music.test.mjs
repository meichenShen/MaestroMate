import{test}from'node:test';import assert from'node:assert/strict';
import{melodyIdeas,rhythmIdeas,backingLayers}from'../src/features/creation/music.ts';
test('starting phrases fit the visible grid, differ and include space for rhythm',()=>{
 for(const group of [melodyIdeas,rhythmIdeas]){assert.equal(new Set(group.map(x=>JSON.stringify(x))).size,3);for(const idea of group){assert.equal(idea.length,8);assert.ok(idea.every(n=>n===null||Number.isInteger(n)&&n>=0&&n<5))}}
 assert.ok(melodyIdeas.some(p=>p.includes(null)));assert.ok(rhythmIdeas.every(p=>p.includes(0)&&p.includes(2)&&p.includes(4)));
});
test('backing choices have distinct roles and do not replace the user melody',()=>{
 assert.deepEqual(backingLayers('none'),[]);
 const chords=backingLayers('chords');assert.equal(chords.length,3);
 assert.deepEqual(chords.map(l=>l.notes[0]),[0,2,3]);assert.deepEqual(chords.map(l=>l.notes[4]),[4,0,2]);
 assert.ok(chords.every(l=>l.octave===-1&&l.gain<.3&&l.instrument==='piano'));
 assert.ok(backingLayers('arpeggio')[0].notes.filter(n=>n!==null).length>chords[0].notes.filter(n=>n!==null).length);
 assert.equal(backingLayers('pulse')[0].instrument,'drums');
});
test('legacy drum sketches split into independent tracks with preserved timing',async()=>{
 const{drumTracks}=await import('../src/features/creation/music.ts');
 const tracks=drumTracks([0,4,2,null,0,4,2,null]);
 assert.deepEqual(tracks[0],[0,null,null,null,0,null,null,null]);
 assert.deepEqual(tracks[1],[null,null,2,null,null,null,2,null]);
 assert.deepEqual(tracks[2],[null,4,null,null,null,4,null,null]);
 tracks[2][0]=4;assert.equal(tracks[0][0],0);
});
