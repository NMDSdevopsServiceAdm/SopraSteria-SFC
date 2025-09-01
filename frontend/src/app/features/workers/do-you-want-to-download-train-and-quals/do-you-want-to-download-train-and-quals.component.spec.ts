import { fireEvent, render, within } from '@testing-library/angular';
import { DoYouWantToDowloadTrainAndQualsComponent } from './do-you-want-to-download-train-and-quals.component';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkersModule } from '../workers.module';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { Establishment } from '@core/model/establishment.model';
import { getTestBed } from '@angular/core/testing';

describe('DoYouWantToDowloadTrainAndQualsComponent', () => {
  const yesRadio = 'Yes, I want to download the summary and any certificates';
  const noRadio = 'No, I do not want to download the summary and any certificates';

  async function setup(overrides: any = {}) {
    const workplace = establishmentBuilder() as Establishment;

    const setupTools = await render(DoYouWantToDowloadTrainAndQualsComponent, {
      imports: [RouterModule, HttpClientTestingModule, WorkersModule],
      providers: [
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  establishment: workplace,
                },
                url: [{ path: 'download-staff-train-and-quals' }],
              },
            },
            snapshot: {
              data: {
                establishment: workplace,
              },
            },
          },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      ...setupTools,
      routerSpy,
    };
  }

  it('should render a DoYouWantToDowloadTrainAndQualsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the worker name and page heading', async () => {
    const { component, getByText, getByTestId } = await setup();

    const sectionHeading = getByTestId('section-heading');
    const headingText = getByText(
      'Do you want to download their training and qualifications summary, and any certificates, before you delete this staff record?',
    );

    expect(within(sectionHeading).getByText(component.worker.nameOrId)).toBeTruthy();
    expect(headingText).toBeTruthy();
  });

  it('should render the radio buttons', async () => {
    const { component, getByLabelText } = await setup();

    expect(getByLabelText(yesRadio)).toBeTruthy();
    expect(getByLabelText(noRadio)).toBeTruthy();
  });

  it('should render the continue button ', async () => {
    const { component, getByText } = await setup();

    expect(getByText('Continue')).toBeTruthy();
  });

  it('should render the cancel link with the correct url to go back to staff-record-summary', async () => {
    const { component, fixture, getByText, routerSpy } = await setup();

    const cancelLink = getByText('Cancel');

    fireEvent.click(cancelLink);
    fixture.detectChanges();

    expect(getByText('Cancel')).toBeTruthy();
    expect(cancelLink.getAttribute('href')).toEqual(
      `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary`,
    );
  });

  it('navigates to delete-staff-record', async () => {
    const { component, fixture, getByText, routerSpy } = await setup();

    const continueButton = getByText('Continue');

    fireEvent.click(getByText(yesRadio));
    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith([
      '/workplace',
      component.workplace.uid,
      'staff-record',
      component.worker.uid,
      'delete-staff-record',
    ]);
  });
});
