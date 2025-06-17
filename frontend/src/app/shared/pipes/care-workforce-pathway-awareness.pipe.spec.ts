import { careWorkforcePathwayAwarenessAnswers } from '@core/test-utils/MockCareWorkforcePathwayService';
import { CareWorkforcePathwayWorkplaceAwarenessTitle } from '@shared/pipes/care-workforce-pathway-awareness.pipe';

describe('CareWorkforcePathwayWorkplaceAwarenessTitle', () => {
  const shortenedVersions = ['Aware in practice', 'Aware of the aims', 'Aware of the term', 'Not aware', 'Not known'];

  it('create an instance', () => {
    const pipe = new CareWorkforcePathwayWorkplaceAwarenessTitle();
    expect(pipe).toBeTruthy();
  });

  it('should convert "null" to "-"', () => {
    const pipe = new CareWorkforcePathwayWorkplaceAwarenessTitle();
    const cwpAwareTitle = null;
    const expectedValue = '-';

    expect(pipe.transform(cwpAwareTitle)).toEqual(expectedValue);
  });

  careWorkforcePathwayAwarenessAnswers.forEach((answer, index) => {
    it(`should convert "${answer.title}" to "${shortenedVersions[index]}`, () => {
      const pipe = new CareWorkforcePathwayWorkplaceAwarenessTitle();

      expect(pipe.transform(answer)).toEqual(shortenedVersions[index]);
    });
  });
});
