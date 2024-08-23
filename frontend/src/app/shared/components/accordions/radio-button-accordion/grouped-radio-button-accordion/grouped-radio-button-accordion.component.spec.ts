import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { GroupedRadioButtonAccordionComponent } from './grouped-radio-button-accordion.component';

describe('GroupedRadioButtonAccordionComponent', () => {
  async function setup(props?: { title?; description?; formControlName?; items? }) {
    const { fixture, getAllByTestId, getByTestId, getByText } = await render(GroupedRadioButtonAccordionComponent, {
      imports: [SharedModule, FormsModule],
      providers: [],
      componentProperties: {
        preFilledId: undefined,
        formControlName: 'accordionGroup',
        textShowHideAll: 'Tests',
        accordions: [{
          title: props?.title ? props.title : 'Test Accordion',
          descriptionText: props?.description ? props.description : 'A Description',
          open: undefined,
          index: undefined,
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
        }]
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
      const { fixture, getByTestId } = await setup();

      const showHideAllButton = getByTestId('toggleText');
      fireEvent.click(showHideAllButton);
      fixture.detectChanges();
      expect(showHideAllButton.textContent).toContain('Hide all');
      fireEvent.click(showHideAllButton);
      fixture.detectChanges();
      expect(showHideAllButton.textContent).toContain('Show all');
    });
  })
});
