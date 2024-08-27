import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { workerWithWdf } from '@core/test-utils/MockWorkerService';
import { SummaryRecordChangeComponent } from '@shared/components/summary-record-change/summary-record-change.component';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { QualificationsAndTrainingComponent } from './qualifications-and-training.component';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';

fdescribe('QualificationsAndTrainingComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(QualificationsAndTrainingComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [SummaryRecordChangeComponent],
      providers: [
        InternationalRecruitmentService,
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditWorker']),
          deps: [HttpClient],
        },
      ],
      componentProperties: {
        canEditWorker: true,
        workplace: establishmentBuilder() as Establishment,
        worker: workerWithWdf() as Worker,
        wdfView: false,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
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
  });
});
