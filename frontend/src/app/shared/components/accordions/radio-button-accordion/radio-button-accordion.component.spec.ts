import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { RadioButtonAccordionComponent } from './radio-button-accordion.component';

describe('RadioButtonAccordionComponent', () => {
  async function setup(props?: { title?; description?; formControlName?; items? }) {
    const { fixture, getAllByTestId, getByTestId, getByText } = await render(RadioButtonAccordionComponent, {
      imports: [SharedModule, FormsModule],
      providers: [],
      componentProperties: {
        title: props?.title ? props.title : 'Test Accordion',
        description: props?.description ? props.description : 'A Description',
        formControlName: props?.formControlName ? props.formControlName : 'testAccordion',
        items: props?.items
          ? props.items
          : [
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
    });
    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getAllByTestId,
      getByTestId,
      getByText,
    };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the title', async () => {
    const { getByTestId } = await setup();

    const title = getByTestId('title');
    expect(title.textContent).toContain('Test Accordion');
  });

  it('should display the description', async () => {
    const { getByTestId } = await setup();

    const description = getByTestId('description');
    expect(description.textContent).toBe('A Description');
  });

  describe('should display the correct amount of radio buttons:', async () => {
    it('2', async () => {
      const { getAllByTestId } = await setup();
      const radioButtons = getAllByTestId('radioButton');
      expect(radioButtons.length).toBe(2);
    });

    it('4', async () => {
      const radioArray = [
        {
          id: 1,
          label: '1',
        },
        {
          id: 2,
          label: '2',
        },
        {
          id: 3,
          label: '3',
        },
        {
          id: 4,
          label: '4',
        },
      ];

      const { getAllByTestId } = await setup({ items: radioArray });

      const radioButtons = getAllByTestId('radioButton');
      expect(radioButtons.length).toBe(4);
    });
  });

  it('should be closed', async () => {
    const { getByTestId } = await setup();

    const accordion = getByTestId('accordion');
    expect(accordion.classList).not.toContain('govuk-accordion__section--expanded');
  });

  it('should open when clicked', async () => {
    const { fixture, getByTestId } = await setup();

    const showHideButton = getByTestId('showHideButton');
    fireEvent.click(showHideButton);
    fixture.detectChanges();

    const accordion = getByTestId('accordion');
    expect(accordion.classList).toContain('govuk-accordion__section--expanded');
  });

  it('should prefill the radio button', async () => {
    const { component, fixture, getByTestId } = await setup();

    component.preFilledId = 2;
    component.open = true;
    fixture.detectChanges();

    const radioBtn = fixture.nativeElement.querySelector('input[id="testAccordion-2"]');
    const showHideButton = within(getByTestId('showHideButton'));
    const hideButton = showHideButton.getByText('Hide');
    const accordion = getByTestId('accordion');

    expect(radioBtn.checked).toBeTruthy();
    expect(hideButton).toBeTruthy();
    expect(accordion.classList).toContain('govuk-accordion__section--expanded');
  });
});
