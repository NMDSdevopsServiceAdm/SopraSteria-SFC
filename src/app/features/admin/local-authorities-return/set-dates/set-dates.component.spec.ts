import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  LocalAuthoritiesReturnService,
} from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SetDatesComponent } from './set-dates.component';

describe('SetDatesComponent', () => {
  async function setup() {
    const component = await render(SetDatesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        LocalAuthoritiesReturnService,
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                dates: {
                  laReturnStartDate: new Date('2020-01-01'),
                  laReturnEndDate: new Date('2002-02-02'),
                },
              },
            },
          },
        },
      ],
    });

    return {
      component,
    };
  }

  it('should render a SetDatesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the current dates in the input boxes', async () => {
    const { component } = await setup();

    const form = component.fixture.componentInstance.form;

    expect(form.get('laReturnStartDate').value.day).toEqual(1);
    expect(form.get('laReturnStartDate').value.month).toEqual(1);
    expect(form.get('laReturnStartDate').value.year).toEqual(2020);

    expect(form.get('laReturnEndDate').value.day).toEqual(2);
    expect(form.get('laReturnEndDate').value.month).toEqual(2);
    expect(form.get('laReturnEndDate').value.year).toEqual(2002);
  });

  it('should show a blank error when nothing in the start date input boxes', async () => {
    const { component } = await setup();

    expect(component.queryByText('Start date is required', { exact: false })).toBe(null);

    const form = component.fixture.componentInstance.form;
    form.setValue({
      laReturnStartDate: {
        day: null,
        month: null,
        year: null,
      },
      laReturnEndDate: {
        day: 12,
        month: 12,
        year: 2012,
      },
    });
    component.fixture.componentInstance.onSubmit();

    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('Start date is required', { exact: false }).length).toBe(2);
  });

  it('should show a an error if an invalid date', async () => {
    const { component } = await setup();

    expect(component.queryByText('Start date is not a valid date', { exact: false })).toBe(null);

    const form = component.fixture.componentInstance.form;
    form.setValue({
      laReturnStartDate: {
        day: 50,
        month: 14,
        year: 2098,
      },
      laReturnEndDate: {
        day: 12,
        month: 12,
        year: 2012,
      },
    });
    component.fixture.componentInstance.onSubmit();

    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('Start date is not a valid date', { exact: false }).length).toBe(2);
  });

  it('should show a blank error when nothing in the end date input boxes', async () => {
    const { component } = await setup();

    expect(component.queryByText('End date is required', { exact: false })).toBe(null);

    const form = component.fixture.componentInstance.form;
    form.setValue({
      laReturnStartDate: {
        day: 11,
        month: 11,
        year: 2011,
      },
      laReturnEndDate: {
        day: null,
        month: null,
        year: null,
      },
    });
    component.fixture.componentInstance.onSubmit();

    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('End date is required', { exact: false }).length).toBe(2);
  });

  it('should show a an error if an invalid date', async () => {
    const { component } = await setup();

    expect(component.queryByText('End date is not a valid date', { exact: false })).toBe(null);

    const form = component.fixture.componentInstance.form;
    form.setValue({
      laReturnStartDate: {
        day: 11,
        month: 11,
        year: 2011,
      },
      laReturnEndDate: {
        day: 50,
        month: 89,
        year: 2029,
      },
    });
    component.fixture.componentInstance.onSubmit();

    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('End date is not a valid date', { exact: false }).length).toBe(2);
  });

  it('should ahow an error if the end date is before the start date', async () => {
    const { component } = await setup();

    expect(component.queryByText('End date must be after start date', { exact: false })).toBe(null);

    const form = component.fixture.componentInstance.form;
    form.setValue({
      laReturnStartDate: {
        day: 11,
        month: 11,
        year: 2011,
      },
      laReturnEndDate: {
        day: 10,
        month: 10,
        year: 2010,
      },
    });

    component.fixture.componentInstance.onSubmit();

    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('End date must be after start date', { exact: false }).length).toBe(2);
  });
});
