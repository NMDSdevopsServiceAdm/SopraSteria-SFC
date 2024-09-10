import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { GroupedRadioButtonAccordionComponent } from './grouped-radio-button-accordion.component';

describe('GroupedRadioButtonAccordionComponent', () => {
  async function setup(props?) {
    const { fixture, getByText, getByTestId } = await render(GroupedRadioButtonAccordionComponent, {
      imports: [SharedModule, FormsModule],
      providers: [],
      componentProperties: {
        preFilledId: props?.preFilledId ? props.preFilledId : 10,
        formControlName: props?.formControlName ? props.formControlName : 'testAccordions',
        textShowHideAll: props?.textShowHideAll ? props.textShowHideAll : 'category',
        hasError: props?.hasError ? props.hasError : false,
        errorMessage: props?.errorMessage ? props.errorMessage : 'Select the training category',
        accordions: props?.accordions
          ? props.accordions
          : [
              {
                title: 'Test Accordion',
                descriptionText: 'A Description',
                open: false,
                index: 0,
                items: [
                  {
                    id: 1,
                    label: 'option 1',
                  },
                  {
                    id: 2,
                    label: 'option 2',
                  },
                ],
              },
            ],
      },
    });

    const component = fixture.componentInstance;

    return { component, fixture, getByText, getByTestId };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the toggle text', async () => {
    const { getByText } = await setup();

    const toggleText = getByText('Show all category');
    expect(toggleText).toBeTruthy;
  });

  it('display an error message that we passed in', async () => {
    const { getByText } = await setup({ hasError: true, errorMessage: 'Select the job role' });

    const errorMessage = getByText('Select the job role');
    expect(errorMessage).toBeTruthy();
  });

  it('open all the accordions when there is an error', async () => {
    const { component, fixture } = await setup({ hasError: true, errorMessage: 'Select the job role' });

    component.ngOnChanges();
    expect(component.showAll).toBe(true);
  });

  describe('show/hide all text', async () => {
    it('should display "Show all" by default', async () => {
      const { getByTestId } = await setup();

      const showHideAllButton = getByTestId('toggleText');
      expect(showHideAllButton.textContent).toContain('Show all');
    });

    it('should read "Hide all" after clicking "Show All"', async () => {
      const { fixture, getByTestId } = await setup();

      const showHideAllButton = getByTestId('toggleText');
      fireEvent.click(showHideAllButton);
      fixture.detectChanges();

      expect(showHideAllButton.textContent).toContain('Hide all');
    });

    it('should read "Show all" after clicking "Hide All"', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.openAll();
      const showHideAllButton = getByTestId('toggleText');

      fireEvent.click(showHideAllButton);
      fixture.detectChanges();
      expect(showHideAllButton.textContent).toContain('Show all');
    });
  })
});
