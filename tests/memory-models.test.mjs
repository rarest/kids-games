import test from 'node:test';
import assert from 'node:assert/strict';
import { createModelFactory, roundedSlab } from '../memory/models.js';
import * as scene from '../memory/scene.js';
test('late-game raised identity numbers remain above the actual beveled card face', () => {
  const factory = createModelFactory(), model = factory.build(16), face = roundedSlab(1.6, 2.01, .012, .15);
  try {
    face.computeBoundingBox();
    const cardTop = .13 + .085 + face.boundingBox.max.y;
    const number = model.children.find(mesh => mesh.material.metalness > .4);
    assert.ok(number, 'the second rabbit has a physical edition number');
    number.geometry.computeBoundingBox();
    const numberBottom = .12 + .04 + .9 * number.geometry.boundingBox.min.y;
    assert.ok(numberBottom > cardTop + .003, `identity buried in card: ${numberBottom} <= ${cardTop}`);
    assert.ok(number.geometry.boundingBox.max.z - number.geometry.boundingBox.min.z >= .3, 'edition numbers must have a readable height on a phone-sized card');
  } finally { factory.disposeObject(model); face.dispose(); }
});
test('short matching feedback is above the real card face rather than buried inside it', () => {
  const face = roundedSlab(1.6, 2.01, .012, .15); face.computeBoundingBox();
  try { assert.ok(scene.FEEDBACK_HEIGHT > .13 + .085 + face.boundingBox.max.y + .005); }
  finally { face.dispose(); }
});
