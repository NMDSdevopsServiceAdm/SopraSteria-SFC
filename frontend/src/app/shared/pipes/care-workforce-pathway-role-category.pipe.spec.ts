import { CareWorkforcePathwayRoleCategoryPipe } from './care-workforce-pathway-role-category.pipe';

describe('CareWorkforcePathwayRoleCategoryPipe', () => {
  it('create an instance', () => {
    const pipe = new CareWorkforcePathwayRoleCategoryPipe();
    expect(pipe).toBeTruthy();
  });

  it('should convert null to "-"', () => {
    const pipe = new CareWorkforcePathwayRoleCategoryPipe();
    const roleCategory = null;
    const expectedValue = '-';

    expect(pipe.transform(roleCategory)).toEqual(expectedValue);
  });

  it('should convert "None of the above" to "Role not included"', () => {
    const pipe = new CareWorkforcePathwayRoleCategoryPipe();
    const roleCategory = {
      id: 102,
      title: 'None of the above',
      description: '',
    };
    const expectedValue = 'Role not included';

    expect(pipe.transform(roleCategory)).toEqual(expectedValue);
  });

  it('should convert "I do not know" to "Not known"', () => {
    const pipe = new CareWorkforcePathwayRoleCategoryPipe();
    const roleCategory = {
      id: 101,
      title: 'I do not know',
      description: '',
    };
    const expectedValue = 'Not known';

    expect(pipe.transform(roleCategory)).toEqual(expectedValue);
  });

  it('should return the title unchanged if for other role categories', () => {
    const pipe = new CareWorkforcePathwayRoleCategoryPipe();
    const roleCategory = {
      id: 1,
      title: 'New to care',
      description: '',
    };
    const expectedValue = 'New to care';

    expect(pipe.transform(roleCategory)).toEqual(expectedValue);
  });
});
