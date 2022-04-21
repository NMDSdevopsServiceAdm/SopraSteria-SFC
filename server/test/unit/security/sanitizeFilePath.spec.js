const expect = require('chai').expect;

const { sanitizeFilePath } = require('../../../utils/security/sanitizeFilePath');

describe('sanitizeFilePath', () => {
  it('removes unsafe characters from file name', () => {
    const filenames = [
      {
        unsafe: '../../goingup',
        safe: 'goingup',
      },
      {
        unsafe: '../some.csv',
        safe: 'some.csv',
      },
      {
        unsafe: '~/tryingtoberoot',
        safe: 'tryingtoberoot',
      },
    ];

    filenames.forEach((filename) => {
      expect(sanitizeFilePath(filename.unsafe, 'anydir')).to.equal(`anydir/${filename.safe}`);
    });
  });
});
