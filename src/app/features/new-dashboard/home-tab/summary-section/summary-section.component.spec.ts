import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SummarySectionComponent } from './summary-section.component';

describe('Summary section', () => {
  const setup = async (message = '') => {
    const { fixture, getByText, getByTestId } = await render(SummarySectionComponent, {
      imports: [SharedModule],
      componentProperties: {
        message,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      getByText,
      getByTestId,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show default summary message when no message has been passed in', async () => {
    const { getByText } = await setup();
    const summaryMessage = getByText('Remember to check and update this data often');
    expect(summaryMessage).toBeTruthy();
  });

  it('should show summary message with flag when a message has been passed in', async () => {
    const { getByText, getByTestId } = await setup('Some message');

    expect(getByText('Some message')).toBeTruthy();
    expect(getByTestId('orange-flag')).toBeTruthy();
  });
});
