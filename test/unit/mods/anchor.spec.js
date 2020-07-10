import anchorMod from '../../../src/mods/anchor.js';

// --------------------------------------------------
// anchor
// --------------------------------------------------
describe('anchor', () => {

  let obj;
  beforeEach(() => {
    obj = {};
    let { i, ...props } = Object.getOwnPropertyDescriptors(anchorMod);
    Object.defineProperties(obj, props);
    i && i.value.call(obj);
  });

  it('should setup anchor property', () => {
    expect(obj.anchor).to.eql({x: 0, y: 0});
  });

});