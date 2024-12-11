import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

describe('AccordionGroupComponent', () => {
  const setup = async (override: any = {}) => {
    const componentProps = {
      contentName: override.contentName,
    };

    const accordionGroupPropsInTemplate = override.contentName ? " [contentName]='contentName'" : '';

    const testTemplate = `
      <app-accordion-group ${accordionGroupPropsInTemplate}>
        <app-accordion-section title='Care providing roles' description='Jobs like care worker, community support, support worker'>
          <p>Content of 1st accordion section</p>
        </app-accordion-section>
        <app-accordion-section title='Professional and related roles' description='Jobs like occupational therapist, registered nurse, nursing assistant'>
          <p>Content of 2nd accordion section</p>
        </app-accordion-section>
      </app-accordion-group>
    `;

    const { fixture, getByText, getByTestId, getAllByText, getByLabelText, queryByText } = await render(testTemplate, {
      imports: [SharedModule, FormsModule],
      providers: [],
      componentProperties: componentProps,
    });

    const component = fixture.componentInstance;

    return { component, fixture, getByText, getByTestId, getAllByText, getByLabelText, queryByText };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should display a toggle text', async () => {
      const { getByText } = await setup();

      const toggleText = getByText('Show all sections');
      expect(toggleText).toBeTruthy();
    });

    it('should display a customised toggle text if given', async () => {
      const { getByText } = await setup({ contentName: 'job roles' });

      const toggleText = getByText('Show all job roles');
      expect(toggleText).toBeTruthy();
    });

    it('should display a toggle button for each accordion section', async () => {
      const { getAllByText } = await setup({ contentName: 'job roles' });

      const toggleButtons = getAllByText('Show');
      expect(toggleButtons.length).toEqual(2);
    });
  });

  describe('behaviour', () => {
    const isHidden = (element: HTMLElement): boolean => {
      const showButtonFound = within(element.parentElement).queryByText('Show');
      return !!showButtonFound;
    };

    it('should hide all accordion sections by default', async () => {
      const { getByLabelText } = await setup();

      const sectionOne = getByLabelText('Care providing roles');
      const sectionTwo = getByLabelText('Professional and related roles');

      expect(isHidden(sectionOne)).toBeTrue();
      expect(isHidden(sectionTwo)).toBeTrue();
    });

    it('should expand all the accordion sections when "Show all" button is clicked', async () => {
      const { fixture, getByText, getByLabelText } = await setup({
        contentName: 'job roles',
      });

      const showAll = getByText('Show all job roles');
      userEvent.click(showAll);
      fixture.detectChanges();

      const sectionOne = getByLabelText('Care providing roles');
      const sectionTwo = getByLabelText('Professional and related roles');

      expect(isHidden(sectionOne)).toBeFalse();
      expect(isHidden(sectionTwo)).toBeFalse();
    });

    it('should change the toggle text between "Hide all" and "Show all"', async () => {
      const { fixture, getByText, queryByText } = await setup({ contentName: 'job roles' });

      expect(getByText('Show all job roles')).toBeTruthy();

      userEvent.click(getByText('Show all job roles'));
      fixture.detectChanges();

      expect(queryByText('Show all job roles')).toBeFalsy();
      expect(getByText('Hide all job roles')).toBeTruthy();

      userEvent.click(getByText('Hide all job roles'));
      fixture.detectChanges();

      expect(queryByText('Hide all job roles')).toBeFalsy();
      expect(getByText('Show all job roles')).toBeTruthy();
    });

    it('should show change the toggle text to "Hide all" when every section is opened separately', async () => {
      const { fixture, getByText, getAllByText, queryByText } = await setup({ contentName: 'job roles' });

      expect(getByText('Show all job roles')).toBeTruthy();

      const showButtons = getAllByText('Show');
      showButtons.forEach((button) => userEvent.click(button));

      fixture.detectChanges();

      expect(queryByText('Show all job roles')).toBeFalsy();
      expect(getByText('Hide all job roles')).toBeTruthy();
    });
  });
});
