import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Contracts } from '@core/model/contracts.enum';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockJobService } from '@core/test-utils/MockJobService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { TotalStaffQuestionComponent } from './total-staff-question.component';

const { build, fake, sequence } = require('@jackfranklin/test-data-bot');

describe('TotalStaffQuestionComponent', () => {
  const establishmentBuilder = build('Establishment', {
    fields: {
      id: sequence(),
      uid: fake((f) => f.datatype.uuid()),
      nameOrId: fake((f) => f.lorem.sentence()),
    },
  });

  async function setup(shareWith: any = null) {
    const establishment = establishmentBuilder() as Establishment;

    const { fixture, getByText, getByLabelText, getAllByText } = await render(TotalStaffQuestionComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      declarations: [],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        UntypedFormBuilder,
        {
          provide: WindowRef,
          useValue: WindowRef,
        },
        {
          provide: Contracts,
          useValue: Contracts,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(0, Roles.Admin),
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentService.factory(shareWith),
          deps: [HttpClient],
        },
        {
          provide: JobService,
          useValue: MockJobService,
        },
        {
          provide: AuthService,
          useValue: MockAuthService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: [{ path: 1 }, { path: 2 }],
            },
            parent: {
              snapshot: {
                url: [{ path: 'workplace' }],
                data: {
                  establishment,
                  primaryWorkplace: establishment,
                },
              },
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getByLabelText,
      getAllByText,
    };
  }

  it('should render a TotalStaff component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should be able to submit when given correct data', async () => {
    const { component, fixture } = await setup();
    fixture.detectChanges();
    spyOn(component, 'onSubmit');
    const submit = fixture.nativeElement.querySelector('button[type="submit"]');
    submit.click();
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should set submitted to true', async () => {
    const { component, fixture, getByText } = await setup();
    const form = component.form;
    form.controls.totalStaff.setValue(10);
    const button = getByText('Save and return');

    fireEvent.click(button);
    fixture.detectChanges();

    expect(component.submitted).toBeTruthy();
  });

  it('should be able to pass validation when given correct data', async () => {
    const { component } = await setup();
    const form = component.form;
    form.controls.totalStaff.setValue('10');
    expect(form.valid).toBeTruthy();
  });

  describe('error messages', () => {
    it('shows the correct error message when total staff is blank', async () => {
      const { component, fixture, getByText, getAllByText } = await setup();
      const form = component.form;

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      const errorMsgs = getAllByText('Enter how many members of staff your workplace has');

      expect(form.valid).toBeFalsy();
      expect(errorMsgs).toBeTruthy();
      expect(errorMsgs.length).toEqual(2);
    });

    it('shows the correct error message when a letter is inputted in the total staff input', async () => {
      const { component, fixture, getByText, getAllByText, getByLabelText } = await setup();
      const form = component.form;

      const input = getByLabelText('Number of staff');
      userEvent.type(input, 'x');

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      const errorMsgs = getAllByText('Enter the number of staff as a digit, like 7');

      expect(form.valid).toBeFalsy();
      expect(errorMsgs).toBeTruthy();
      expect(errorMsgs.length).toEqual(2);
    });

    it('shows the correct error message when a decimal is inputted in the total staff input', async () => {
      const { component, fixture, getByText, getAllByText, getByLabelText } = await setup();
      const form = component.form;

      const input = getByLabelText('Number of staff');
      userEvent.type(input, '1.3');

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      const errorMsgs = getAllByText('Number of staff must be a whole number between 0 and 999');

      expect(form.valid).toBeFalsy();
      expect(errorMsgs).toBeTruthy();
      expect(errorMsgs.length).toEqual(2);
    });

    it('shows the correct error message when a negative number is inputted in the total staff input', async () => {
      const { component, fixture, getByText, getAllByText, getByLabelText } = await setup();
      const form = component.form;

      const input = getByLabelText('Number of staff');
      userEvent.type(input, '-1');

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      const errorMsgs = getAllByText('Number of staff must be a whole number between 0 and 999');

      expect(form.valid).toBeFalsy();
      expect(errorMsgs).toBeTruthy();
      expect(errorMsgs.length).toEqual(2);
    });

    it('shows the correct error message when a number greater than 999 is inputted in the total staff input', async () => {
      const { component, fixture, getByText, getAllByText, getByLabelText } = await setup();
      const form = component.form;

      const input = getByLabelText('Number of staff');
      userEvent.type(input, '1000');

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      const errorMsgs = getAllByText('Number of staff must be a whole number between 0 and 999');

      expect(form.valid).toBeFalsy();
      expect(errorMsgs).toBeTruthy();
      expect(errorMsgs.length).toEqual(2);
    });

    it('validates input is greater than or equal to 0', async () => {
      const { component } = await setup();
      const form = component.form;
      form.controls.totalStaff.setValue('0');
      expect(form.valid).toBeTruthy();
    });

    it('validates input can be equal to 999', async () => {
      const { component } = await setup();
      const form = component.form;
      form.controls.totalStaff.setValue('999');
      expect(form.valid).toBeTruthy();
    });
  });

  it('should return to data sharing page when you click on the back link', async () => {
    const shareWith: any = { cqc: false, localAuthorities: false };
    const { component } = await setup(shareWith);
    expect(component.previousRoute).toEqual(['/workplace', `${component.establishment.uid}`, 'sharing-data']);
  });

  it('should go on to vacancies page if you click submit', async () => {
    const { component } = await setup();
    expect(component.nextRoute).toEqual(['/workplace', `${component.establishment.uid}`, 'vacancies']);
  });
});
