import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CardComponent } from './card.component';

describe('CardComponent', () => {
  const setup = async () => {
    const { fixture } = await render(CardComponent, {
      imports: [SharedModule],
    });

    const component = fixture.componentInstance;

    return {
      component,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
