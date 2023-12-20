import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { DetailsComponent } from './details.component';

describe('DetailsComponent', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(DetailsComponent, {
      imports: [SharedModule],
      providers: [],
    });

    const component = fixture.componentInstance;

    return {
      component,
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
});
