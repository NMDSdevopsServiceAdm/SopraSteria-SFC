import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SummaryLinkComponent } from './summary-link.component';

describe('SummaryLink', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(SummaryLinkComponent, {
      imports: [SharedModule],
    });

    const component = fixture.componentInstance;

    return {
      component,
      getByText,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show summary message', async () => {
    const { getByText } = await setup();
    const summaryMessage = getByText('Remember to check and update this data often');
    expect(summaryMessage).toBeTruthy();
  });
});
