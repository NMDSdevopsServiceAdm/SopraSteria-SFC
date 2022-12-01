import { render } from '@testing-library/angular';
import { CombinedSummaryRowComponent } from './combined-summary-row.component';

fdescribe('MultipleTrainingSummaryComponent', () => {
  async function setup() {
    const { fixture } = await render(CombinedSummaryRowComponent, {});

    const component = fixture.componentInstance;

    return { component };
  }

  it('should render'),
    async () => {
      const { component } = await setup();
      expect(component).toBeTruthy();
    };
});
