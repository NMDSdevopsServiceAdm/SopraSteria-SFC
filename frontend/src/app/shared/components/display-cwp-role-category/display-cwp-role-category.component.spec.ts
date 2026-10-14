import { render } from '@testing-library/angular';
import { DisplayCwpRoleCategoryComponent } from './display-cwp-role-category.component';
import { SharedModule } from '@shared/shared.module';

fdescribe('DisplayCwpRoleCategoryComponent', () => {
  const setup = async (overrides: any = {}) => {
    const careWorkforcePathwayRoleCategory = overrides?.careWorkforcePathwayRoleCategory ?? null;
    const setupTools = await render(DisplayCwpRoleCategoryComponent, {
      imports: [SharedModule],
      componentInputs: { careWorkforcePathwayRoleCategory },
      providers: [],
    });

    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  };

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  const emptyValues = [null, undefined];

  emptyValues.forEach((value) => {
    it('should show a dash "-" when the careWorkforcePathwayRoleCategory is empty', async () => {
      const { getByText } = await setup({ careWorkforcePathwayRoleCategory: value });
      expect(getByText('-')).toBeTruthy();
    });
  });

  it('should show "Not known" when the value is "I do not know"', async () => {
    const mockCWPRoleCategory = { id: 101, title: 'I do not know' };

    const { getByText } = await setup({ careWorkforcePathwayRoleCategory: mockCWPRoleCategory });
    expect(getByText('Not known')).toBeTruthy();
  });

  const mockData = [
    { id: 1, title: 'New to care' },
    { id: 7, title: 'Registered manager' },
    { id: 102, title: 'None of these categories' },
  ];

  mockData.forEach((careWorkforcePathwayRoleCategory) => {
    it(`should show the title of the chosen role category, value = ${careWorkforcePathwayRoleCategory.title}`, async () => {
      const { getByText } = await setup({ careWorkforcePathwayRoleCategory });
      expect(getByText(careWorkforcePathwayRoleCategory.title)).toBeTruthy();
    });
  });

  it('should show the title as well as "Nominated individual" if isNominatedIndividual = true', async () => {
    const mockCWPRoleCategory = { id: 7, title: 'Registered manager', isNominatedIndividual: true };

    const { getByText } = await setup({ careWorkforcePathwayRoleCategory: mockCWPRoleCategory });
    expect(getByText('Registered manager')).toBeTruthy();
    expect(getByText('Nominated individual')).toBeTruthy();
  });
});
