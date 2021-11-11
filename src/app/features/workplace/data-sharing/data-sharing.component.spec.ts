import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { DataSharingComponent } from './data-sharing.component';

describe('DataSharingComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText, getByTestId } = await render(DataSharingComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        ErrorSummaryService,
        BackService,
        FormBuilder,
        { provide: EstablishmentService, useClass: MockEstablishmentService },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;

    const updateDataSharingSpy = spyOn(establishmentService, 'updateDataSharing').and.returnValue(of(true));

    return {
      fixture,
      component,
      getByText,
      getAllByText,
      queryByText,
      getByTestId,
      updateDataSharingSpy,
    };
  }

  it('should render DataSharingComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display CQC question when establishment is regulated', async () => {
    const { component, fixture, getByText } = await setup();

    component.establishment.isRegulated = true;
    fixture.detectChanges();

    expect(getByText('Do you agree to us sharing your data with the CQC?')).toBeTruthy();
  });

  it('should not display CQC question when establishment is not regulated', async () => {
    const { component, fixture, queryByText } = await setup();

    component.establishment.isRegulated = false;
    fixture.detectChanges();

    expect(queryByText('Do you agree to us sharing your data with the CQC?')).toBeFalsy();
  });

  describe('Passing data to updateDataSharing in establishment service', async () => {
    it('should call updateDataSharing in establishment service with local authorities set to true when Yes selected', async () => {
      const { component, getByText, getByTestId, updateDataSharingSpy } = await setup();

      const laYesRadioButton = getByTestId('localAuthorities-yes');
      fireEvent.click(laYesRadioButton);

      const returnButton = getByText('Save and return');
      fireEvent.click(returnButton);

      expect(updateDataSharingSpy).toHaveBeenCalledWith(component.establishment.uid, {
        share: {
          cqc: null,
          localAuthorities: true,
        },
      });
    });

    it('should call updateDataSharing in establishment service with local authorities set to false when No selected', async () => {
      const { component, getByText, getByTestId, updateDataSharingSpy } = await setup();

      const laYesRadioButton = getByTestId('localAuthorities-no');
      fireEvent.click(laYesRadioButton);

      const returnButton = getByText('Save and return');
      fireEvent.click(returnButton);

      expect(updateDataSharingSpy).toHaveBeenCalledWith(component.establishment.uid, {
        share: {
          cqc: null,
          localAuthorities: false,
        },
      });
    });
  });

  describe('Passing data to updateDataSharing in establishment service', async () => {
    it('should call updateDataSharing in establishment service with CQC set to true when Yes selected', async () => {
      const { component, fixture, getByText, getByTestId, updateDataSharingSpy } = await setup();

      component.establishment.isRegulated = true;
      fixture.detectChanges();

      const cqcYesRadioButton = getByTestId('cqc-yes');
      fireEvent.click(cqcYesRadioButton);

      const returnButton = getByText('Save and return');
      fireEvent.click(returnButton);

      expect(updateDataSharingSpy).toHaveBeenCalledWith(component.establishment.uid, {
        share: {
          cqc: true,
          localAuthorities: null,
        },
      });
    });

    it('should call updateDataSharing in establishment service with CQC set to false when No selected', async () => {
      const { component, fixture, getByText, getByTestId, updateDataSharingSpy } = await setup();

      component.establishment.isRegulated = true;
      fixture.detectChanges();

      const cqcYesRadioButton = getByTestId('cqc-no');
      fireEvent.click(cqcYesRadioButton);

      const returnButton = getByText('Save and return');
      fireEvent.click(returnButton);

      expect(updateDataSharingSpy).toHaveBeenCalledWith(component.establishment.uid, {
        share: {
          cqc: false,
          localAuthorities: null,
        },
      });
    });
  });
});
