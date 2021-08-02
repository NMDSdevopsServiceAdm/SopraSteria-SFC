import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { MonitorComponent } from './monitor.component';

describe('MonitorComponent', () => {
  async function setup() {
    const component = await render(MonitorComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: BreadcrumbService, useClass: MockBreadcrumbService }],
    });

    return {
      component,
    };
  }

  it('should render a MonitorComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show accordian headings', async () => {
    const { component } = await setup();

    expect(component.getByText('B - North East')).toBeTruthy();
    expect(component.getByText('C - East Midlands')).toBeTruthy();
    expect(component.getByText('D - South West')).toBeTruthy();
    expect(component.getByText('E - West Midlands')).toBeTruthy();
    expect(component.getByText('F - North West')).toBeTruthy();
    expect(component.getByText('G - London')).toBeTruthy();
    expect(component.getByText('H - South East')).toBeTruthy();
    expect(component.getByText('I - Eastern')).toBeTruthy();
    expect(component.getByText('J - Yorkshire and Humber')).toBeTruthy();
  });

  it('should show an open all button', async () => {
    const { component } = await setup();

    expect(component.getByText('Open all')).toBeTruthy();
  });

  it('should show a reset returns data button', async () => {
    const { component } = await setup();

    expect(component.getByText('Reset returns data')).toBeTruthy();
  });
});
