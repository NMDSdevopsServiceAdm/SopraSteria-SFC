import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SummarySectionComponent } from './summary-section.component';

describe('Summary section', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(SummarySectionComponent, {
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
