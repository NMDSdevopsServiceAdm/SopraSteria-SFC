import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

fdescribe('AccordionGroupComponent', () => {
  const setup = async (override: any = {}) => {
    const componentProperties = {
      contentName: override.contentName,
    };

    let accordionGroupPropsInTemplate = '';
    for (const key in componentProperties) {
      if (componentProperties[key]) {
        accordionGroupPropsInTemplate += ` [${key}]='${key}'`;
      }
    }

    const testTemplate = `
      <app-accordion-group ${accordionGroupPropsInTemplate}>
        <app-accordion-item title='Care providing roles' description='Jobs like care worker, community support, support worker'>
          <p>Content of 1st accordion section</p>
        </app-accordion-item>
        <app-accordion-item title='Professional and related roles' description='Jobs like occupational therapist, registered nurse, nursing assistant'>
          <p>Content of 2nd accordion section</p>
        </app-accordion-item>
      </app-accordion-group>
    `;

    const { fixture, getByText, getByTestId, getAllByText, queryByText } = await render(testTemplate, {
      imports: [SharedModule, FormsModule],
      providers: [],
      componentProperties,
    });

    const component = fixture.componentInstance;

    return { component, fixture, getByText, getByTestId, getAllByText, queryByText };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should display a toggle text', async () => {
      const { getByText } = await setup();

      const toggleText = getByText('Show all sections');
      expect(toggleText).toBeTruthy;
    });

    it('should display a customised toggle text if given', async () => {
      const { getByText } = await setup({ contentName: 'job roles' });

      const toggleText = getByText('Show all job roles');
      expect(toggleText).toBeTruthy;
    });

    it('should display a toggle button for each accordion section', async () => {
      const { getAllByText } = await setup({ contentName: 'job roles' });

      const toggleButtons = getAllByText('Show');
      expect(toggleButtons.length).toEqual(2);
    });
  });

  describe('behaviour', () => {
    it('should hide all contents by default', async () => {
      const { queryByText } = await setup();

      const sectionOneContent = queryByText('Content of 1st accordion section');
      const sectionTwoContent = queryByText('Content of 2nd accordion section');

      expect(sectionOneContent).toBeFalsy;
      expect(sectionTwoContent).toBeFalsy;
    });

    it('should expand all the accordion sections when "Show all" button is clicked', async () => {
      const { fixture, getByText, queryByText, getAllByText } = await setup({ contentName: 'job roles' });

      const showAll = getByText('Show all job roles');
      userEvent.click(showAll);
      fixture.detectChanges();

      const sectionOneContent = getByText('Content of 1st accordion section');
      const sectionTwoContent = getByText('Content of 2nd accordion section');

      expect(sectionOneContent).toBeTruthy;
      expect(sectionTwoContent).toBeTruthy;

      expect(queryByText('Show')).toBeFalsy;
      expect(getAllByText('Hide').length).toEqual(2);
    });

    it('should change the toggle text between "Hide all" and "Show all"', async () => {
      const { fixture, getByText, queryByText } = await setup({ contentName: 'job roles' });

      expect(getByText('Show all job roles')).toBeTruthy;

      userEvent.click(getByText('Show all job roles'));
      fixture.detectChanges();

      expect(queryByText('Show all job roles')).toBeFalsy;
      expect(getByText('Hide all job roles')).toBeTruthy;

      userEvent.click(getByText('Hide all job roles'));
      fixture.detectChanges();

      expect(queryByText('Hide all job roles')).toBeFalsy;
      expect(getByText('Show all job roles')).toBeTruthy;
    });
  });
});
