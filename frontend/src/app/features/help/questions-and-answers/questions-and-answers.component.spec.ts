import { RouterTestingModule } from '@angular/router/testing';
import { render } from '@testing-library/angular';

import { QuestionsAndAnswersComponent } from './questions-and-answers.component';

describe('QuestionsAndAnswersComponent', () => {
  async function setup() {
    const setupTools = await render(QuestionsAndAnswersComponent, {
      imports: [RouterTestingModule],
      providers: [],
    });

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
    };
  }

  it('should create the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
