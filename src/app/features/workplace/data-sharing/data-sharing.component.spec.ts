import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { DataSharingComponent } from './data-sharing.component';

describe('DataSharingComponent', () => {
  async function setup(shareWith = { cqc: null, localAuthorities: null }) {
    const { fixture, getByText, getAllByText, queryByText, getByTestId } = await render(DataSharingComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule.withRoutes([{ path: 'dashboard', component: DashboardComponent }]),
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        ErrorSummaryService,
        BackService,
        FormBuilder,
        { provide: EstablishmentService, useFactory: MockEstablishmentService.factory(shareWith) },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(null);
    const updateDataSharingSpy = spyOn(establishmentService, 'updateDataSharing').and.returnValue(of(true));
    const updateSharingPermissionsBannerSpy = spyOn(
      establishmentService,
      'updateSharingPermissionsBanner',
    ).and.returnValue(of(true));

    return {
      fixture,
      component,
      getByText,
      getAllByText,
      queryByText,
      getByTestId,
      routerSpy,
      updateDataSharingSpy,
      updateSharingPermissionsBannerSpy,
    };
  }

  it('should render DataSharingComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Top of page paragraph and reveals', async () => {
    it('should display CQC paragraph when establishment is regulated', async () => {
      const { component, fixture, queryByText } = await setup();

      component.establishment.isRegulated = true;
      fixture.detectChanges();

      expect(
        queryByText("We'd like to share your data with the Care Quality Commission (CQC) and local authorities."),
      ).toBeTruthy();
    });

    it('should not display CQC paragraph when establishment is not regulated', async () => {
      const { component, fixture, queryByText } = await setup();

      component.establishment.isRegulated = false;
      fixture.detectChanges();

      expect(
        queryByText("We'd like to share your data with the Care Quality Commission (CQC) and local authorities."),
      ).toBeFalsy();
    });

    it('should display CQC paragraph in `Why share your data?` question when establishment is regulated', async () => {
      const { component, fixture, queryByText } = await setup();

      component.establishment.isRegulated = true;
      fixture.detectChanges();

      const expectedText =
        'The CQC use the data as part of their overall suite of intelligence about adult social care providers and the wider sector.';

      expect(queryByText(expectedText)).toBeTruthy();
    });

    it('should not display CQC paragraph in `Why share your data?` question when establishment is not regulated', async () => {
      const { component, fixture, queryByText } = await setup();

      component.establishment.isRegulated = false;
      fixture.detectChanges();

      const expectedText =
        'The CQC use the data as part of their overall suite of intelligence about adult social care providers and the wider sector.';

      expect(queryByText(expectedText)).toBeFalsy();
    });

    it('should display CQC reveal when establishment is regulated', async () => {
      const { component, fixture, getByText } = await setup();

      component.establishment.isRegulated = true;
      fixture.detectChanges();

      expect(getByText('Not everything is shared with the CQC')).toBeTruthy();
    });

    it('should not display CQC reveal when establishment is not regulated', async () => {
      const { component, fixture, queryByText } = await setup();

      component.establishment.isRegulated = false;
      fixture.detectChanges();

      expect(queryByText('Not everything is shared with the CQC')).toBeFalsy();
    });
  });

  describe('CQC and Localauthority questions', async () => {
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
  });

  describe('Passing data for local authorities to updateDataSharing in establishment service', async () => {
    it('should call updateDataSharing in establishment service with local authorities set to true when Yes selected', async () => {
      const { component, getByText, getByTestId, updateDataSharingSpy } = await setup();

      const laYesRadioButton = getByTestId('localAuthorities-yes');
      fireEvent.click(laYesRadioButton);

      const returnButton = getByText('Save and return');
      fireEvent.click(returnButton);

      expect(updateDataSharingSpy).toHaveBeenCalledWith(component.establishment.uid, {
        shareWith: {
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
        shareWith: {
          cqc: null,
          localAuthorities: false,
        },
      });
    });
  });

  describe('Passing data for cqc to updateDataSharing in establishment service', async () => {
    it('should call updateDataSharing in establishment service with CQC set to true when Yes selected', async () => {
      const { component, fixture, getByText, getByTestId, updateDataSharingSpy } = await setup();

      component.establishment.isRegulated = true;
      fixture.detectChanges();

      const cqcYesRadioButton = getByTestId('cqc-yes');
      fireEvent.click(cqcYesRadioButton);

      const returnButton = getByText('Save and return');
      fireEvent.click(returnButton);

      expect(updateDataSharingSpy).toHaveBeenCalledWith(component.establishment.uid, {
        shareWith: {
          cqc: true,
          localAuthorities: null,
        },
      });
    });

    it('should call updateDataSharing in establishment service with CQC set to false when No selected', async () => {
      const { component, fixture, getByText, getByTestId, updateDataSharingSpy } = await setup();

      component.establishment.isRegulated = true;
      fixture.detectChanges();

      const cqcNoRadioButton = getByTestId('cqc-no');
      fireEvent.click(cqcNoRadioButton);

      const returnButton = getByText('Save and return');
      fireEvent.click(returnButton);

      expect(updateDataSharingSpy).toHaveBeenCalledWith(component.establishment.uid, {
        shareWith: {
          cqc: false,
          localAuthorities: null,
        },
      });
    });
  });

  describe('Setting radio buttons when establishment has shareWith data set', async () => {
    it('should set Yes radio button when establishment has shareWith localAuthorities set to true', async () => {
      const { component } = await setup({ cqc: null, localAuthorities: true });
      const shareWithForm = component.form.value.shareWith;

      expect(shareWithForm.localAuthorities).toBe(true);
    });

    it('should set No radio button when establishment has shareWith localAuthorities set to false', async () => {
      const { component } = await setup({ cqc: null, localAuthorities: false });
      const shareWithForm = component.form.value.shareWith;

      expect(shareWithForm.localAuthorities).toBe(false);
    });

    it('should set Yes radio button when establishment has shareWith cqc set to true', async () => {
      const { component } = await setup({ cqc: true, localAuthorities: null });
      const shareWithForm = component.form.value.shareWith;

      expect(shareWithForm.cqc).toBe(true);
    });

    it('should set No radio button when establishment has shareWith cqc set to false', async () => {
      const { component } = await setup({ cqc: false, localAuthorities: null });
      const shareWithForm = component.form.value.shareWith;

      expect(shareWithForm.cqc).toBe(false);
    });

    it('should not set radio buttons when establishment has shareWith localAuthorities and cqc set to null', async () => {
      const { component } = await setup({ cqc: null, localAuthorities: null });
      const shareWithForm = component.form.value.shareWith;

      expect(shareWithForm.localAuthorities).toBe(null);
      expect(shareWithForm.cqc).toBe(null);
    });
  });

  it('should have link to vacancies page on continue button', async () => {
    const { fixture, getByText, routerSpy } = await setup();
    fixture.componentInstance.return = null;
    fixture.detectChanges();

    const workplaceUid = fixture.componentInstance.establishment.uid;
    const continueButton = getByText('Save and continue');
    fireEvent.click(continueButton);

    expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceUid, 'vacancies']);
  });

  describe('removing sharing permission banner function', () => {
    it('should call updateSharingPermissionsBanner when the save and return button is clicked', async () => {
      const { component, fixture, getByText, updateSharingPermissionsBannerSpy } = await setup();

      component.establishment.showSharingPermissionsBanner = true;
      fixture.detectChanges();

      const returnButton = getByText('Save and return');
      fireEvent.click(returnButton);

      expect(updateSharingPermissionsBannerSpy).toHaveBeenCalled();
    });

    it('should call updateSharingPermissionsBanner when the cancel button is clicked', async () => {
      const { component, fixture, getByText, updateSharingPermissionsBannerSpy } = await setup();

      component.establishment.showSharingPermissionsBanner = true;
      fixture.detectChanges();

      const returnButton = getByText('Cancel');
      fireEvent.click(returnButton);

      expect(updateSharingPermissionsBannerSpy).toHaveBeenCalled();
    });
  });
});
