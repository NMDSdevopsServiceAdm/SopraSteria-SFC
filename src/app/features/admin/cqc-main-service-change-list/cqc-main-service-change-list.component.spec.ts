import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CQCMainServiceChangeListComponent } from './cqc-main-service-change-list.component';

describe('CQCMainServiceChangeListComponent', () => {
  async function setup() {
    const component = await render(CQCMainServiceChangeListComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
    });

    const fixture = component.fixture;

    return {
      component,
      fixture,
    };
  }

  it('should render a CQCMainServiceChangeListComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
