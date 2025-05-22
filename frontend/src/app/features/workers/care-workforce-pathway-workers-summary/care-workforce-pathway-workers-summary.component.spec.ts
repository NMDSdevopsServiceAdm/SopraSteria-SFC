import { of } from 'rxjs';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { MockCareWorkforcePathwayService } from '@core/test-utils/MockCareWorkforcePathwayService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { CareWorkforcePathwayWorkersSummaryComponent } from './care-workforce-pathway-workers-summary.component';
import { MockRouter } from '@core/test-utils/MockRouter';

describe('CareWorkforcePathwayWorkersSummaryComponent', () => {
  const mockWorkers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];

  const setup = async (overrides: any = {}) => {
    const workersToShow = overrides.workersToShow ?? mockWorkers;
    const getWorkersSpy = jasmine.createSpy().and.returnValue(of({ workers: workersToShow }));

    const routerSpy = jasmine.createSpy('navigate').and.resolveTo(true);

    const setuptools = await render(CareWorkforcePathwayWorkersSummaryComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: CareWorkforcePathwayService,
          useFactory: MockCareWorkforcePathwayService.factory({
            getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer: getWorkersSpy,
          }),
        },
        {
          provide: Router,
          useFactory: MockRouter.factory({ navigate: routerSpy }),
        },
        provideRouter([]),
      ],
    });

    const fixture = setuptools.fixture;
    const component = fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const workerService = injector.inject(WorkerService) as WorkerService;
    const router = injector.inject(Router) as Router;

    return {
      ...setuptools,
      component,
      fixture,
      establishmentService,
      workerService,
      router,
      routerSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a h1 heading', async () => {
    const { getByRole } = await setup();

    const h1Heading = getByRole('heading', { level: 1 });
    expect(h1Heading).toBeTruthy();
    expect(h1Heading.textContent).toEqual('Where are your staff on the care workforce pathway?');
  });

  it('should show a reveal text to explain what is the care workforce pathway', async () => {
    const reveal = "What's the care workforce pathway (CWP)?";
    const revealText = [
      'The care workforce pathway outlines the knowledge, skills, values and behaviours needed for a career in adult social care. It provides a clear career structure for your staff.',
      "You'll use the pathway to set out how staff can gain skills, learn and develop, and progress in their careers.",
      'Read more about the care workforce pathway',
    ];

    const { getByTestId } = await setup();

    const revealElement = getByTestId('reveal-whatsCareWorkforcePathway');
    expect(revealElement.textContent).toContain(reveal);
    revealText.forEach((paragraph) => {
      expect(revealElement.textContent).toContain(paragraph);
    });
  });

  describe('workers table', () => {
    it('should display a row for each worker whose CWP role category was empty', async () => {
      const { fixture, getByTestId } = await setup();
      fixture.detectChanges();

      mockWorkers.forEach((worker, index) => {
        const workerRow = getByTestId(`worker-row-${index}`);
        const workerNameLink = within(workerRow).getByText(worker.nameOrId, { selector: 'a' }) as HTMLLinkElement;
        expect(workerNameLink).toBeTruthy();
        expect(workerNameLink.href).toContain(`${worker.uid}/staff-record-summary`);

        const chooseACategoryLink = within(workerRow).getByText('Choose a category', {
          selector: 'a',
        }) as HTMLLinkElement;
        expect(chooseACategoryLink).toBeTruthy();
        expect(chooseACategoryLink.href).toContain(`${worker.uid}/staff-record-summary/care-workforce-pathway`);
      });
    });

    it('should set return to this page when Choose a category link is clicked', async () => {
      const { router, fixture, getAllByText, workerService } = await setup();
      const setReturnToSpy = spyOn(workerService, 'setReturnTo').and.callThrough();
      fixture.detectChanges();

      const chooseACategoryLink = getAllByText('Choose a category', {
        selector: 'a',
      })[0] as HTMLLinkElement;

      userEvent.click(chooseACategoryLink);
      const urlOfThisPage = router.url;

      expect(setReturnToSpy).toHaveBeenCalledWith({ url: [urlOfThisPage] });
    });
  });

  it('should show a return to home button', async () => {
    const { getByRole, routerSpy } = await setup();

    const returnToHomeButton = getByRole('button', { name: 'Return to home' });
    expect(returnToHomeButton).toBeTruthy();

    userEvent.click(returnToHomeButton);

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home' });
  });

  it('should redirect to home page if all workers have been answered', async () => {
    const { fixture, routerSpy } = await setup({ workersToShow: [] });

    await fixture.whenStable();

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home' });
  });
});
