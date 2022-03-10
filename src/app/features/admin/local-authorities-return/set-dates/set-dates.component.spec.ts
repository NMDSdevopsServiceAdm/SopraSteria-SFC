import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  LocalAuthoritiesReturnService,
} from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockLocalAuthoritiesReturnService } from '@core/test-utils/MockLocalAuthoritiesReturnService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { SetDatesComponent } from './set-dates.component';

describe('SetDatesComponent', () => {
  async function setup(correctDates = false) {
    const component = await render(SetDatesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        {
          provide: LocalAuthoritiesReturnService,
          useClass: MockLocalAuthoritiesReturnService,
        },
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
                  laReturnStartDate: correctDates ? new Date('2001-01-01') : new Date('2020-01-01'),
                  laReturnEndDate: new Date('2002-02-02'),
                },
              },
            },
          },
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      spy,
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

  it('should navigate back to the la page on success', async () => {
    const { component, spy } = await setup(true);

    const form = component.fixture.componentInstance.form;

    form.markAsDirty();
    component.fixture.detectChanges();

    const submitButton = component.getByText('Save and return');
    fireEvent.click(submitButton);

    component.fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(['sfcadmin', 'local-authorities-return']);
  });

  describe('error messages', () => {
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
      const submitButton = component.getByText('Save and return');
      fireEvent.click(submitButton);

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
      const submitButton = component.getByText('Save and return');
      fireEvent.click(submitButton);

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

      const submitButton = component.getByText('Save and return');
      fireEvent.click(submitButton);

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

      const submitButton = component.getByText('Save and return');
      fireEvent.click(submitButton);

      component.fixture.detectChanges();

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText('End date is not a valid date', { exact: false }).length).toBe(2);
    });

    it('should show an error if the end date is before the start date', async () => {
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

      const submitButton = component.getByText('Save and return');
      fireEvent.click(submitButton);

      component.fixture.detectChanges();

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText('End date must be after start date', { exact: false }).length).toBe(2);
    });

    it('should show an error if the start date is after the end date', async () => {
      const { component } = await setup();

      expect(component.queryByText('Start date must be before end date', { exact: false })).toBe(null);

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

      const submitButton = component.getByText('Save and return');
      fireEvent.click(submitButton);

      component.fixture.detectChanges();

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText('Start date must be before end date', { exact: false }).length).toBe(2);
    });
  });
});
