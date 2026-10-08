import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router, RouterModule } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { MockCareWorkforcePathwayService } from '@core/test-utils/MockCareWorkforcePathwayService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockRouter } from '@core/test-utils/MockRouter';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { CareWorkforcePathwayWorkersSummaryComponent } from './care-workforce-pathway-workers-summary.component';
import { SelectSortByComponent } from '@shared/components/select-sort-by/select-sort-by.component';

fdescribe('CareWorkforcePathwayWorkersSummaryComponent', () => {
  const mockWorkers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];
  mockWorkers.forEach((worker) => {
    worker.careWorkforcePathwayRoleCategory = { roleCategoryId: 1, title: 'New to care', description: '' };
  });

  const setup = async (overrides: any = {}) => {
    const workersToShow = overrides.workersToShow ?? mockWorkers;
    const workerCount = overrides.workerCount ?? workersToShow.length;
    const getCWPWorkersResponse = { workers: workersToShow, workerCount: workerCount };
    const getCWPWorkersSpy = jasmine.createSpy().and.returnValue(of(getCWPWorkersResponse));

    const routerSpy = jasmine.createSpy('navigate').and.resolveTo(true);

    const setuptools = await render(CareWorkforcePathwayWorkersSummaryComponent, {
      imports: [SharedModule, RouterModule, SelectSortByComponent],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: CareWorkforcePathwayService,
          useFactory: MockCareWorkforcePathwayService.factory({
            getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer: getCWPWorkersSpy,
          }),
        },
        provideRouter([]),
        {
          provide: Router,
          useFactory: MockRouter.factory({ navigate: routerSpy }),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                workersWhoRequireCWPAnswer: getCWPWorkersResponse,
              },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const fixture = setuptools.fixture;
    const component = fixture.componentInstance;
    fixture.autoDetectChanges();

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService);
    const workerService = injector.inject(WorkerService);
    const router = injector.inject(Router) as Router;
    const route = injector.inject(ActivatedRoute);

    return {
      ...setuptools,
      component,
      fixture,
      establishmentService,
      workerService,
      getCWPWorkersSpy,
      route,
      router,
      routerSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a h1 heading', async () => {
    const { getByRole, getByTestId } = await setup();

    const h1Heading = getByRole('heading', { level: 1 });
    expect(h1Heading).toBeTruthy();
    expect(h1Heading.textContent.trim()).toEqual('Where are your staff on the Care Workforce Pathway?');

    const subHeading = getByTestId('section-heading');
    expect(subHeading).toBeTruthy();
    expect(subHeading.textContent).toEqual('Staff records');
  });

  it('should show a reveal text to explain why assign CWP role categories', async () => {
    const reveal = 'Why assign Care Workforce Pathway role categories?';
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

  it('should show a "Confirm role categories" CTA button', async () => {
    const { getByRole, routerSpy, route } = await setup();

    const button = getByRole('button', { name: 'Confirm role categories' });
    expect(button).toBeTruthy();

    userEvent.click(button);

    expect(routerSpy).toHaveBeenCalledWith(['./review-new-to-care'], { relativeTo: route });
  });

  it('should redirect to home page if all workers have been answered', async () => {
    const { fixture, routerSpy } = await setup({ workersToShow: [] });

    await fixture.whenStable();

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home' });
  });

  describe('workers table', () => {
    it('should display a row for each worker', async () => {
      const { getByTestId } = await setup();

      mockWorkers.forEach((worker, index) => {
        const workerRow = getByTestId(`worker-row-${index}`);
        const workerName = within(workerRow).getByText(worker.nameOrId);
        expect(workerName).toBeTruthy();

        const workerJobRole = within(workerRow).getByText(worker.mainJob.title!);
        expect(workerJobRole).toBeTruthy();

        const workerCWPAnswer = within(workerRow).getByText(worker.careWorkforcePathwayRoleCategory?.title!);
        expect(workerCWPAnswer).toBeTruthy();

        const chooseACategoryLink = within(workerRow).getByText('Check new roles', {
          selector: 'a',
        }) as HTMLLinkElement;
        expect(chooseACategoryLink).toBeTruthy();
      });
    });

    it('should set returnTo as this page when "Check new roles" link is clicked', async () => {
      const { router, getAllByText, workerService } = await setup();
      const setReturnToSpy = spyOn(workerService, 'setReturnTo').and.callThrough();

      const chooseACategoryLink = getAllByText('Check new roles', {
        selector: 'a',
      })[0] as HTMLLinkElement;

      userEvent.click(chooseACategoryLink);
      const urlOfThisPage = router.url;

      expect(setReturnToSpy).toHaveBeenCalledWith({ url: [urlOfThisPage] });
    });
  });

  describe('pagination and sorting', () => {
    it('should show pagination links when number of non-answered workers is larger then number of workers per page', async () => {
      const { getByTestId, getByText } = await setup({ workerCount: 20 });

      const pagination = getByTestId('pagination');
      expect(within(pagination).getByRole('link', { name: '2' })).toBeTruthy();
      expect(within(pagination).getByRole('link', { name: 'Next' })).toBeTruthy();

      expect(getByText('Check all pages before confirming.')).toBeTruthy();
    });

    it('should not show pagination links when number of non-answered workers is less then or equal number of workers per page', async () => {
      const { fixture, queryByTestId, queryByText } = await setup({ workerCount: 15 });
      fixture.detectChanges();

      expect(queryByTestId('pagination')).toBeFalsy();
      expect(queryByText('Check all pages before confirming.')).toBeFalsy();
    });

    it('should retrieve and display the workers for next page when "Next" link is clicked', async () => {
      const { fixture, getByRole, getByTestId, getCWPWorkersSpy } = await setup({ workerCount: 20 });

      const mockNextPageWorkers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];
      getCWPWorkersSpy.and.returnValue(of({ workers: mockNextPageWorkers, workerCount: 20 }));

      userEvent.click(getByRole('link', { name: 'Next' }));
      await fixture.whenStable();

      expect(getCWPWorkersSpy).toHaveBeenCalledWith('mocked-uid', {
        pageIndex: 1,
        itemsPerPage: 15,
        sortBy: 'staffNameAsc',
      });

      mockNextPageWorkers.forEach((worker, index) => {
        const workerRow = getByTestId(`worker-row-${index}`);
        const workerName = within(workerRow).getByText(worker.nameOrId);
        expect(workerName).toBeTruthy();
      });

      const pagination = getByTestId('pagination');
      expect(within(pagination).getByRole('link', { name: '1' })).toBeTruthy();
      expect(within(pagination).getByRole('link', { name: 'Previous' })).toBeTruthy();
    });

    it('should show a sort by select box if more than one worker', async () => {
      const { getByLabelText } = await setup();

      const sortBySelectBox = getByLabelText('Sort by') as HTMLSelectElement;
      expect(sortBySelectBox).toBeTruthy();

      const expectedOptions = ['Staff name (A to Z)', 'Staff name (Z to A)', 'Job role (A to Z)', 'Job role (Z to A)'];
      expectedOptions.forEach((option) => {
        expect(within(sortBySelectBox).getByText(option)).toBeTruthy();
      });
    });

    it('should not show the sort by select box if there is only one worker', async () => {
      const { queryByLabelText } = await setup({ workerCount: 1, workersToShow: [mockWorkers[0]] });
      const sortBySelectBox = queryByLabelText('Sort by') as HTMLSelectElement;
      expect(sortBySelectBox).toBeFalsy();
    });

    it('should fetch and update workers when user select another sortBy option', async () => {
      const { fixture, getByText, getByTestId, getByLabelText, getCWPWorkersSpy } = await setup();

      getCWPWorkersSpy.and.returnValue(of({ workers: [...mockWorkers].reverse(), workerCount: 20 }));

      const sortBySelectBox = getByLabelText('Sort by') as HTMLSelectElement;
      expect(sortBySelectBox).toBeTruthy();

      userEvent.selectOptions(sortBySelectBox, getByText('Staff name (Z to A)'));

      expect(getCWPWorkersSpy).toHaveBeenCalledWith('mocked-uid', {
        pageIndex: 0,
        itemsPerPage: 15,
        sortBy: 'staffNameDesc',
      });

      await fixture.whenStable();

      expect(getByTestId('worker-row-0').textContent).toContain(mockWorkers[2].nameOrId);
      expect(getByTestId('worker-row-1').textContent).toContain(mockWorkers[1].nameOrId);
      expect(getByTestId('worker-row-2').textContent).toContain(mockWorkers[0].nameOrId);
    });

    it('should persist the selected sorting order when user click another page', async () => {
      const { fixture, getByText, getByRole, getByLabelText, getCWPWorkersSpy } = await setup();

      getCWPWorkersSpy.and.returnValue(of({ workers: [...mockWorkers].reverse(), workerCount: 20 }));

      const sortBySelectBox = getByLabelText('Sort by') as HTMLSelectElement;
      userEvent.selectOptions(sortBySelectBox, getByText('Staff name (Z to A)'));

      userEvent.click(getByRole('link', { name: 'Next' }));
      await fixture.whenStable();

      expect(getCWPWorkersSpy).toHaveBeenCalledWith('mocked-uid', {
        pageIndex: 1,
        itemsPerPage: 15,
        sortBy: 'staffNameDesc',
      });
    });
  });
});
