import { Component } from '@angular/core';
import { render } from '@testing-library/angular';

import { TrainingSelectViewPanelComponent } from './training-select-view-panel.component';
import { TrainingSelectViewComponent } from './training-select-view.component';

@Component({
  template: `<app-training-select-view [title]="'Link title'"></app-training-select-view>`,
})
class TestHostComponent {}

describe('TrainingSelectViewPanelComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(TestHostComponent, {
      imports: [],
      declarations: [TrainingSelectViewPanelComponent, TrainingSelectViewComponent],
      providers: [],
      componentProperties: {},
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
    };
  }

  it('should render the component', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  xit('should render the ng-content content', async () => {
    const { component, getByText } = await setup();

    expect(getByText('Link title')).toBeTruthy();
  });
});
