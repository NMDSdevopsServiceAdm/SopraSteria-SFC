import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CQCMainServiceChangeListComponent } from './cqc-main-service-change-list.component';

fdescribe('CQCMainServiceChangeListComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText } = await render(CQCMainServiceChangeListComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [],
    });

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      getByText,
      getAllByText,
    };
  }

  it('should render a CQCMainServiceChangeListComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show `CQC main service change` header', async () => {
    const { getByText } = await setup();

    expect(getByText('CQC main service change')).toBeTruthy();
  });

  it('should show `CQC main service change` table headings', async () => {
    const { getByText } = await setup();

    expect(getByText('Workplace')).toBeTruthy();
    expect(getByText('Received')).toBeTruthy();
    expect(getByText('Status')).toBeTruthy();
  });
});
