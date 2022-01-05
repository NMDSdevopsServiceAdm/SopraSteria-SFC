import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ApprovalsTableComponent } from './approvals-table.component';

describe('ApprovalsTableComponent', () => {
  async function setup() {
    const component = await render(ApprovalsTableComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [],
    });

    const fixture = component.fixture;

    return {
      fixture,
      component,
    };
  }

  it('should render a ApprovalsTableComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show `CQC main service change` table headings', async () => {
    const { component } = await setup();

    expect(component.getByText('Workplace')).toBeTruthy();
    expect(component.getByText('Received')).toBeTruthy();
    expect(component.getByText('Status')).toBeTruthy();
  });
});
