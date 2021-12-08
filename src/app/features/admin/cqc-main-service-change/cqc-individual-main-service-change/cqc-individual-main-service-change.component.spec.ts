import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CqcIndividualMainServiceChangeComponent } from './cqc-individual-main-service-change.component';

describe('CqcIndividualMainServiceChangeComponent', () => {
  async function setup() {
    const component = await render(CqcIndividualMainServiceChangeComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
    });

    return {
      component,
    };
  }

  it('should render a CqcIndividualMainServiceChangeComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
