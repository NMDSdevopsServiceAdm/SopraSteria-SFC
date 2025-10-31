import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockCWPRoleCategories } from '@core/test-utils/MockCareWorkforcePathwayService';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { workerWithWdf } from '@core/test-utils/MockWorkerService';
import { SummaryRecordChangeComponent } from '@shared/components/summary-record-change/summary-record-change.component';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { QualificationsAndTrainingComponent } from './qualifications-and-training.component';

describe('QualificationsAndTrainingComponent', () => {
  async function setup(overrides: any = {}) {
    const configs = { isWdf: false, canEditWorker: true, ...overrides };

    const { isWdf, canEditWorker } = configs;
    const mockWorker = { ...workerWithWdf(), ...(overrides.workerOverrides ?? {}) };

    const setupTools = await render(QualificationsAndTrainingComponent, {
      imports: [SharedModule, RouterModule],
      declarations: [SummaryRecordChangeComponent],
      providers: [
        InternationalRecruitmentService,
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(canEditWorker ? ['canEditWorker'] : []),
          deps: [HttpClient],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {} },
          },
        },
      provideHttpClient(), provideHttpClientTesting(),],
      componentProperties: {
        canEditWorker: canEditWorker,
        workplace: establishmentBuilder() as Establishment,
        worker: mockWorker as Worker,
        wdfView: isWdf,
      },
    });

    const fixture = setupTools.fixture;
    const component = fixture.componentInstance;

    return {
      ...setupTools,
      component,
      fixture,
    };
  }

  it('should render a QualificationsAndTrainingComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('care certificate', () => {
    it('should render Add link with the staff-record-summary/care-certificate url when care certificate is not answered', async () => {
      const { fixture, component, getByText } = await setup();

      component.worker.careCertificate = null;
      fixture.detectChanges();

      const careCertificateSection = getByText('Care Certificate').parentElement;
      const addLink = within(careCertificateSection).getByText('Add');

      expect(addLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/care-certificate`,
      );
    });

    it('should render Change link with the staff-record-summary/care-certificate url when care certificate is already answered', async () => {
      const { fixture, component, getByText } = await setup();

      component.worker.careCertificate = 'Yes, completed';
      fixture.detectChanges();

      const careCertificateSection = getByText('Care Certificate').parentElement;
      const currentAnswer = within(careCertificateSection).getByText('Yes, completed');
      const changeLink = within(careCertificateSection).getByText('Change');

      expect(currentAnswer).toBeTruthy();
      expect(changeLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/care-certificate`,
      );
    });
  });

  describe('level 2 care certificate', () => {
    it('should render Add link with the staff-record-summary/level-2-adult-social-care-certificate url when level 2 care certificate is not answered', async () => {
      const { fixture, component, getByText } = await setup();

      component.worker.level2CareCertificate = null;
      fixture.detectChanges();

      const level2CareCertificateSection = getByText('Level 2 Adult Social Care Certificate').parentElement;
      const addLink = within(level2CareCertificateSection).getByText('Add');

      expect(addLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/level-2-care-certificate`,
      );
    });

    it('should render Change link with the staff-record-summary/level-2-adult-social-care-certificate url when care certificate is already answered', async () => {
      const { fixture, component, getByText } = await setup();

      component.worker.level2CareCertificate.value = 'Yes, started';
      fixture.detectChanges();

      const level2CareCertificateSection = getByText('Level 2 Adult Social Care Certificate').parentElement;
      const currentAnswer = within(level2CareCertificateSection).getByText('Yes, started');
      const changeLink = within(level2CareCertificateSection).getByText('Change');

      expect(currentAnswer).toBeTruthy();
      expect(changeLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/level-2-care-certificate`,
      );
    });

    it('should not render Add or Change link when canEditWorker is false', async () => {
      const { fixture, component, getByText } = await setup({ isWdf: false, canEditWorker: false });

      component.worker.level2CareCertificate.value = 'Yes, started';
      fixture.detectChanges();

      const level2CareCertificateSection = getByText('Level 2 Adult Social Care Certificate').parentElement;
      const addLink = within(level2CareCertificateSection).queryByText('Add');
      const changeLink = within(level2CareCertificateSection).queryByText('Change');

      expect(addLink).toBeFalsy();
      expect(changeLink).toBeFalsy();
    });

    describe('funding version', () => {
      it('should render Add link to the funding question page in funding version of summary page when level 2 care certificate is not answered', async () => {
        const { fixture, component, getByText } = await setup({ isWdf: true });

        component.worker.level2CareCertificate = null;
        fixture.detectChanges();

        const level2CareCertificateSection = getByText('Level 2 Adult Social Care Certificate').parentElement;
        const addLink = within(level2CareCertificateSection).getByText('Add');

        expect(addLink.getAttribute('href')).toBe(
          `/funding/staff-record/${component.worker.uid}/level-2-care-certificate`,
        );
      });

      it('should render Change link to the funding question page in funding version of summary page when level 2 care certificate is answered', async () => {
        const { fixture, component, getByText } = await setup({ isWdf: true });

        component.worker.level2CareCertificate.value = 'Yes, started';
        fixture.detectChanges();

        const level2CareCertificateSection = getByText('Level 2 Adult Social Care Certificate').parentElement;
        const addLink = within(level2CareCertificateSection).getByText('Change');

        expect(addLink.getAttribute('href')).toBe(
          `/funding/staff-record/${component.worker.uid}/level-2-care-certificate`,
        );
      });
    });
  });

  describe('Care workforce pathway role category', () => {
    it('should render Add link and a dash when the question is not answered', async () => {
      const workerOverrides = { careWorkforcePathwayRoleCategory: null };
      const { component, getByText } = await setup({ workerOverrides });

      const section = getByText('Care workforce pathway role category').parentElement;
      const addLink = within(section).getByText('Add');

      expect(within(section).getByText('-')).toBeTruthy();

      expect(addLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/care-workforce-pathway`,
      );
    });

    it('should render Change link when the question is answered', async () => {
      const workerOverrides = { careWorkforcePathwayRoleCategory: MockCWPRoleCategories.NewToCare };
      const { component, getByText } = await setup({ workerOverrides });

      const section = getByText('Care workforce pathway role category').parentElement;
      const changeLink = within(section).getByText('Change');

      expect(within(section).getByText('New to care')).toBeTruthy();

      expect(changeLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/care-workforce-pathway`,
      );
    });

    it('should render Change link and "Not known" when the answer is "I do not know"', async () => {
      const workerOverrides = { careWorkforcePathwayRoleCategory: MockCWPRoleCategories.IDoNotKnow };
      const { component, getByText } = await setup({ workerOverrides });

      const section = getByText('Care workforce pathway role category').parentElement;
      const changeLink = within(section).getByText('Change');

      expect(within(section).getByText('Not known')).toBeTruthy();

      expect(changeLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/care-workforce-pathway`,
      );
    });

    it('should render Change link and "Role not included" when the answer is "None of the above"', async () => {
      const workerOverrides = { careWorkforcePathwayRoleCategory: MockCWPRoleCategories.NoneOfTheAbove };
      const { component, getByText } = await setup({ workerOverrides });

      const section = getByText('Care workforce pathway role category').parentElement;
      const changeLink = within(section).getByText('Change');

      expect(within(section).getByText('Role not included')).toBeTruthy();

      expect(changeLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/care-workforce-pathway`,
      );
    });
  });
});