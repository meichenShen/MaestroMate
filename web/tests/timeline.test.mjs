import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chapterAt, formatTime, clampSeek } from '../src/audio/timeline.ts';
import { chapters, work, detectiveQuestions, questions } from '../src/content/aquarium.ts';

test('paused seeks and exact boundaries map to the correct scene', () => {
  assert.equal(chapterAt(0).id, 'surface');
  assert.equal(chapterAt(35.99).id, 'surface');
  assert.equal(chapterAt(36).id, 'current');
  assert.equal(chapterAt(74).id, 'deep');
  assert.equal(chapterAt(111).id, 'still');
  assert.equal(chapterAt(work.duration).id, 'still');
});
test('all listening windows are continuous and every clip is inside this recording', () => {
  assert.equal(chapters[0].start, 0);
  chapters.slice(1).forEach((chapter, index) => assert.equal(chapter.start, chapters[index].end));
  assert.equal(chapters.at(-1).end, work.duration);
  for (const clip of [...detectiveQuestions.flatMap(q=>q.clips), ...questions.flatMap(q=>q.clip ? [q.clip] : [])]) {
    assert.ok(clip.start >= 0 && clip.start < clip.end && clip.end <= work.duration);
  }
});
test('seek and time display handle limits without invalid UI values', () => {
  assert.equal(clampSeek(-10, 148), 0);
  assert.equal(clampSeek(200, 148), 148);
  assert.equal(clampSeek(NaN, 148), 0);
  assert.equal(formatTime(148.9), '2:28');
  assert.equal(formatTime(NaN), '0:00');
});
