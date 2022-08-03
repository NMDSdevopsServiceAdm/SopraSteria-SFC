import { WorkplaceUtil } from './workplace-util';

describe('WorkplaceUtil', () => {
  describe('formatTypeOfEmployer', () => {
    it('should return the correct value if passed Local Authority (adult services)', () => {
      const typeOfEmployer = WorkplaceUtil.formatTypeOfEmployer('Local Authority (adult services)');

      expect(typeOfEmployer).toEqual('Local authority (adult services)');
    });

    it('should return the correct value if passed Local Authority (generic/other)', () => {
      const typeOfEmployer = WorkplaceUtil.formatTypeOfEmployer('Local Authority (generic/other)');

      expect(typeOfEmployer).toEqual('Local authority (generic, other)');
    });

    it('should return the correct value if passed Private Sector', () => {
      const typeOfEmployer = WorkplaceUtil.formatTypeOfEmployer('Private Sector');

      expect(typeOfEmployer).toEqual('Private sector');
    });

    it('should return the correct value if passed Voluntary / Charity', () => {
      const typeOfEmployer = WorkplaceUtil.formatTypeOfEmployer('Voluntary / Charity');

      expect(typeOfEmployer).toEqual('Voluntary, charity, not for profit');
    });

    it('should return the correct value if passed Other', () => {
      const typeOfEmployer = WorkplaceUtil.formatTypeOfEmployer('Other');

      expect(typeOfEmployer).toEqual('Other');
    });
  });
});
