import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { DetailsComponent } from './details.component';

describe('DetailsComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getByTestId } = await render(DetailsComponent, {
      imports: [SharedModule],
      providers: [],
    });

    const component = fixture.componentInstance;

    return {
      component,
      getByTestId,
      getByText,
      fixture,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the reveal title', async () => {
    const { component, getByText, fixture } = await setup();

    component.title = 'Why we ask for this information';
    fixture.detectChanges();

    const revealTitle = getByText('Why we ask for this information');
    expect(revealTitle).toBeTruthy();
  });

  it('should hide the additional details initially', async () => {
    const { getByTestId } = await setup();
    const details = getByTestId('additional-details');
    expect(details.hasAttribute('open')).toBeFalsy();
  });

  it('should display the additional details after clicking on the toggle', async () => {
    const { getByTestId, fixture} = await setup();
    getByTestId('details-toggle').click();
    fixture.detectChanges();
    const details = getByTestId('additional-details');
    expect(details.hasAttribute('open')).toBeTruthy();
  });
});
