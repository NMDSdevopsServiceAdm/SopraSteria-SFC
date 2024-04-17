import { benchmarksTabJourney } from './journey.workplaces';

describe('JourneyWorkplaces', () => {
  function returnAboutTheDataPath(isOldTab = false){
    let journeyWorkplaces = benchmarksTabJourney(isOldTab);
    return journeyWorkplaces.children[0].children[0].path
  }

  it('should return the correct about the data path for old benchmark journey', () => {
    expect(returnAboutTheDataPath(true)).toBe('/workplace/:workplaceUid/benchmarks/about-the-data');
  });

  it('should return the correct about the data path for new benchmark journey', () => {
    expect(returnAboutTheDataPath()).toBe('/workplace/:workplaceUid/data-area/about-the-data');
  });
});
