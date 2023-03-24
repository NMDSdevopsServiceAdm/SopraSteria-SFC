import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { LinkWithArrowComponent } from './link-with-arrow.component';

describe('LinkWithArrowComponent', () => {
  const setup = async () => {
    const { fixture } = await render(LinkWithArrowComponent, {
      imports: [SharedModule],
      providers: [],
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
