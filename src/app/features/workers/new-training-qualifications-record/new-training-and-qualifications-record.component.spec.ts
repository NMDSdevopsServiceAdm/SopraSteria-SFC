import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { WorkersModule } from '../workers.module';
import { NewTrainingAndQualificationsRecordComponent } from './new-training-and-qualifications-record.component';

describe('NewTrainingAndQualificationsRecordComponent', () => {
  const workplace = establishmentBuilder() as Establishment;

  async function setup(noQualifications = false) {
    const { fixture, getByText, getAllByText, queryByText, getByTestId } = await render(
      NewTrainingAndQualificationsRecordComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
        providers: [
          AlertService,
          WindowRef,
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                snapshot: {
                  data: {
                    establishment: workplace,
                  },
                },
              },
              snapshot: {
                data: {
                  worker: {
                    uid: 123,
                    nameOrId: 'John',
                  },
                  trainingRecords: {
                    mandatory: [],
                    nonMandatory: [
                      {
                        category: 'Health',
                        id: 1,
                        trainingRecords: [
                          {
                            accredited: true,
                            completed: new Date('10/20/2021'),
                            expires: new Date('10/20/2022'),
                            title: 'Health training',
                            trainingCategory: { id: 1, category: 'Health' },
                            uid: 'someuid',
                          },
                        ],
                      },
                      {
                        category: 'Autism',
                        id: 2,
                        trainingRecords: [
                          {
                            accredited: true,
                            completed: new Date('10/20/2021'),
                            expires: new Date('10/20/2022'),
                            title: 'Autism training',
                            trainingCategory: { id: 2, category: 'Autism' },
                            uid: 'someuid',
                          },
                        ],
                      },
                    ],
                    qualifications: noQualifications
                      ? { count: 0, groups: [] }
                      : {
                          count: 2,
                          groups: [
                            {
                              group: 'Health',
                              id: 1,
                              records: [
                                {
                                  year: '2020',
                                  notes: 'This is a test note for the first row in the Health group',
                                  title: 'Health qualification',
                                  uid: 'firstHealthQualUid',
                                },
                              ],
                            },
                            {
                              group: 'Certificate',
                              id: 2,
                              records: [
                                {
                                  year: '2021',
                                  notes: 'Test notes needed',
                                  title: 'Cert qualification',
                                  uid: 'firstCertificateUid',
                                },
                                {
                                  year: '2012',
                                  notes: 'These are some more notes in the second row of the cert table',
                                  title: 'Another name for qual',
                                  uid: 'secondCertificateUid',
                                },
                              ],
                            },
                          ],
                        },
                  },
                },
              },
            },
          },
          {
            provide: WorkerService,
            useClass: MockWorkerService,
          },
          { provide: EstablishmentService, useClass: MockEstablishmentService },
          { provide: BreadcrumbService, useClass: MockBreadcrumbService },
          { provide: PermissionsService, useClass: MockPermissionsService },
        ],
      },
    );

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const workerService = injector.inject(WorkerService) as WorkerService;
    const workerSpy = spyOn(workerService, 'setReturnTo');
    workerSpy.and.callThrough();

    const workplaceUid = component.workplace.uid;
    const workerUid = component.worker.uid;

    return {
      component,
      fixture,
      routerSpy,
      workerSpy,
      getByText,
      getAllByText,
      getByTestId,
      queryByText,
      workplaceUid,
      workerUid,
    };
  }

  it('should render a TrainingAndQualificationsRecordComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the worker name', async () => {
    const { component, getByText } = await setup();

    expect(getByText(component.worker.nameOrId)).toBeTruthy();
  });

  it('should display number of training records in the title', async () => {
    const { getByText } = await setup();
    expect(getByText('Training and qualifications (4)')).toBeTruthy();
  });

  it('should set returnTo$ in the worker service to the training and qualifications record page on init', async () => {
    const { component, workerSpy, workplaceUid, workerUid } = await setup();

    component.ngOnInit();

    expect(workerSpy).toHaveBeenCalledWith({
      url: ['/workplace', workplaceUid, 'training-and-qualifications-record', workerUid, 'training'],
    });
  });

  describe('Long-Term Absence', () => {
    it('should display the Long-Term Absence if the worker is currently flagged as long term absent', async () => {
      const { component, fixture, getByText, queryByText } = await setup();

      component.worker.longTermAbsence = 'Illness';
      fixture.detectChanges();

      expect(getByText('Long-term absent')).toBeTruthy();
      expect(queryByText('Flag long-term absence')).toBeFalsy();
    });

    it('should navigate to `/long-term-absence` when pressing the "view" button', async () => {
      const { component, fixture, getByTestId, workplaceUid, workerUid } = await setup();

      component.worker.longTermAbsence = 'Illness';
      fixture.detectChanges();

      const longTermAbsenceLink = getByTestId('longTermAbsence');
      expect(longTermAbsenceLink.getAttribute('href')).toBe(
        `/workplace/${workplaceUid}/training-and-qualifications-record/${workerUid}/long-term-absence`,
      );
    });
  });

  describe('Flag long-term absence', () => {
    it('should display the "Flag long-term absence" link if the worker is not currently flagged as long term absent', async () => {
      const { component, fixture, getByText } = await setup();

      component.worker.longTermAbsence = null;
      component.canEditWorker = true;
      fixture.detectChanges();

      expect(getByText('Flag long-term absence')).toBeTruthy();
    });

    it('should navigate to `/long-term-absence` when pressing the "Flag long-term absence" button', async () => {
      const { component, fixture, getByTestId, workplaceUid, workerUid } = await setup();

      component.worker.longTermAbsence = null;
      component.canEditWorker = true;
      fixture.detectChanges();

      const flagLongTermAbsenceLink = getByTestId('flagLongTermAbsence');
      expect(flagLongTermAbsenceLink.getAttribute('href')).toBe(
        `/workplace/${workplaceUid}/training-and-qualifications-record/${workerUid}/long-term-absence`,
      );
    });
  });

  describe('Non mandatory training', () => {
    it('should have non mandatory count of 2', async () => {
      const { getByText } = await setup();
      expect(getByText('Non-mandatory training records (2)')).toBeTruthy();
    });

    it('should render non-mandatory training component', async () => {
      const { getByTestId } = await setup();
      expect(getByTestId('non-mandatory-training')).toBeTruthy();
    });

    it('should render message wihen there is no non-mandatory training', async () => {
      const { component, fixture, getByText } = await setup();
      component.nonMandatoryTrainingCount = 0;
      fixture.detectChanges();

      const expectedText = 'No non-mandatory training records have been added for this person yet.';
      expect(getByText(expectedText)).toBeTruthy();
    });
  });

  describe('Qualifications', () => {
    describe('No qualification records', () => {
      it('should show qualification record count as 0 when no qualification records', async () => {
        const { getByText } = await setup(true);
        expect(getByText('Qualification records (0)')).toBeTruthy();
      });

      it('should show 0 qualifications message when no qualification records', async () => {
        const { getByText } = await setup(true);
        expect(getByText('No qualification records have been added for this person yet.')).toBeTruthy();
      });
    });

    it('should show qualification record count', async () => {
      const { getByText } = await setup();
      expect(getByText('Qualification records (2)')).toBeTruthy();
    });

    it('should show type heading (Health) with number of records', async () => {
      const { getByText } = await setup();
      expect(getByText('Type: Health (1)')).toBeTruthy();
    });

    it('should show qualification table headings for each type with records (2)', async () => {
      const { getAllByText } = await setup();

      expect(getAllByText('Qualification name').length).toBe(2);
      expect(getAllByText('Year achieved').length).toBe(2);
      expect(getAllByText('Notes').length).toBe(2);
    });

    it('should show Health table row with details of record', async () => {
      const { getByText } = await setup();

      expect(getByText('Health qualification')).toBeTruthy();
      expect(getByText('2020')).toBeTruthy();
      expect(getByText('This is a test note for the first row in the Health group')).toBeTruthy();
    });

    it('should contain link in qualification name in first Health table row', async () => {
      const { fixture } = await setup();

      const healthQualificationTitle = fixture.debugElement.query(
        By.css('[data-testid="Title-firstHealthQualUid"]'),
      ).nativeElement;
      expect(healthQualificationTitle.getAttribute('href')).toBe('/qualification/firstHealthQualUid');
    });

    it('should show Certificate table first row with details of record', async () => {
      const { getByText } = await setup();

      expect(getByText('Cert qualification')).toBeTruthy();
      expect(getByText('2021')).toBeTruthy();
      expect(getByText('Test notes needed')).toBeTruthy();
    });

    it('should contain link in qualification name in first certificate table row', async () => {
      const { fixture } = await setup();

      const healthQualificationTitle = fixture.debugElement.query(
        By.css('[data-testid="Title-firstCertificateUid"]'),
      ).nativeElement;
      expect(healthQualificationTitle.getAttribute('href')).toBe('/qualification/firstCertificateUid');
    });

    it('should show Certificate table second row with details of record', async () => {
      const { getByText } = await setup();

      expect(getByText('Another name for qual')).toBeTruthy();
      expect(getByText('2012')).toBeTruthy();
      expect(getByText('These are some more notes in the second row of the cert table')).toBeTruthy();
    });

    it('should contain link in qualification name in second certificate table row', async () => {
      const { fixture } = await setup();

      const healthQualificationTitle = fixture.debugElement.query(
        By.css('[data-testid="Title-secondCertificateUid"]'),
      ).nativeElement;
      expect(healthQualificationTitle.getAttribute('href')).toBe('/qualification/secondCertificateUid');
    });
  });
});
