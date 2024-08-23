import { render } from '@testing-library/angular';
import { GroupedRadioButtonAccordionComponent } from './grouped-radio-button-accordion.component';
import { SharedModule } from '@shared/shared.module';
import { FormsModule } from '@angular/forms';

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

    return { component, fixture, getByText };
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
    const { component } = await setup({ hasError: true, errorMessage: 'Select the job role' });

    expect(component.showAll).toBe(true);
  });
});
