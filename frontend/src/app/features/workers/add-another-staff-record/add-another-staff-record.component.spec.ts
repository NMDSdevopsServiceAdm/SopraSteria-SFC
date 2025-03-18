import { render, getByText, getByLabelText } from '@testing-library/angular';
import { AddAnotherStaffRecordComponent } from './add-another-staff-record.component'
import userEvent from '@testing-library/user-event';
import { getTestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';


describe('AddAnotherStaffRecordComponent', () => {
  async function setup() {
    const { fixture, getByLabelText, getByText } = await render(
      AddAnotherStaffRecordComponent,
      {
        imports: [RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService
          },
        ]
      }
    );

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByLabelText,
      getByText,
      navigateSpy
    };
  }


  it('renders a component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('displays the header text', async () => {
    const { component, getByText } = await setup();

    expect(getByText('Do you want to add another staff record?')).toBeTruthy();
  });

  it('displays the section text', async () => {
    const { component, getByText } = await setup();

    expect(getByText('Staff records')).toBeTruthy();
  });

  it('displays the yes/no radio buttons', async () => {
    const { component, fixture, getByLabelText } = await setup();

    const yesRadioButton = getByLabelText('Yes');
    const noRadioButton = getByLabelText('No');

    console.log(yesRadioButton);

    expect(yesRadioButton).toBeTruthy();
    expect(noRadioButton).toBeTruthy();
  });



  describe('continue button', () => {
    it('is rendered', async () => {
      const { getByText } = await setup();
      expect(getByText('Continue')).toBeTruthy();
    });

    it(`navigates to staff record flow when 'yes' is selected`, async () => {
      const { fixture, getByText, navigateSpy } = await setup();

      userEvent.click(getByText('Yes'));
      userEvent.click(getByText('Continue'));
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith([
        '/workplace',
        '98a83eef-e1e1-49f3-89c5-b1287a3cc8de',
        'staff-record',
        'create-staff-record',
        'staff-details'
      ]);
    });

    it(`navigates to staff changes summary when 'no' is selected`, async () => {
      const { fixture, getByText, navigateSpy } = await setup();

      userEvent.click(getByText('No'));
      userEvent.click(getByText('Continue'));
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith([
        '/workplace',
        '98a83eef-e1e1-49f3-89c5-b1287a3cc8de',
        'staff-record',
        'update-workplace-details-after-staff-changes'
      ]);
    });

    it(`navigates to staff changes summary when neither option is selected`, async () => {
      const { fixture, getByText, navigateSpy } = await setup();

      userEvent.click(getByText('Continue'));
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith([
        '/workplace',
        '98a83eef-e1e1-49f3-89c5-b1287a3cc8de',
        'staff-record',
        'update-workplace-details-after-staff-changes'
      ]);
    });
  });
})