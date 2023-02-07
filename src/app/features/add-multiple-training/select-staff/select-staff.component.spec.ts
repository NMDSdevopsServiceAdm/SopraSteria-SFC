import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { MockWorkerService, workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { AddMultipleTrainingModule } from '../add-multiple-training.module';
import { SelectStaffComponent } from './select-staff.component';

const createWorkers = (noOfWorkers) => {
  const workers: Worker[] = [];
  for (let i = 0; i < noOfWorkers; i++) {
    const worker = workerBuilder();
    workers.push(worker as Worker);
  }
  return workers;
};

describe('SelectStaffComponent', () => {
  async function setup(noOfWorkers = 3, accessedFromSummary = false) {
    const workers = createWorkers(noOfWorkers);
    const {
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByText,
      queryAllByText,
      queryByLabelText,
      queryByTestId,
    } = await render(SelectStaffComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, AddMultipleTrainingModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: TrainingService,
          useClass: MockTrainingService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [{ path: accessedFromSummary ? 'confirm-training' : 'add-multiple-training' }],
              },
              data: {
                workers: {
                  workers: workers,
                },
              },
              params: {
                establishmentuid: '1234-5678',
              },
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const trainingService = injector.inject(TrainingService) as TrainingService;
    const workerService = injector.inject(WorkerService) as WorkerService;

    const spy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const trainingSpy = spyOn(trainingService, 'resetSelectedStaff').and.callThrough();
    const updateSelectedStaffSpy = spyOn(trainingService, 'updateSelectedStaff');
    const workerSpy = spyOn(workerService, 'getAllWorkers').and.callThrough();
    const searchSpy = spyOn(component, 'handleSearch').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByText,
      queryAllByText,
      queryByLabelText,
      queryByTestId,
      router,
      spy,
      trainingSpy,
      updateSelectedStaffSpy,
      workerSpy,
      searchSpy,
      workers,
    };
  }

  it('should render a SelectStaffComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render `Continue` and `Cancel` buttons when it is not accessed from the confirm training page', async () => {
    const { getByText } = await setup();

    expect(getByText('Continue')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should render `Save and return` and `Cancel` buttons when it is accessed from the confirm training page', async () => {
    const { getByText } = await setup(3, true);

    expect(getByText('Save and return')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should render a table with the establishment staff in it and the number of workers above the table', async () => {
    const { component, fixture, getByText, workers } = await setup();

    component.paginatedWorkers = workers;
    fixture.detectChanges();

    const numberOfWorkersText = getByText(
      `Showing ${component.paginatedWorkers.length} of ${component.totalWorkerCount} staff`,
    );
    expect(numberOfWorkersText).toBeTruthy();
    workers.forEach((worker) => {
      expect(getByText(`${worker.nameOrId}`)).toBeTruthy();
      expect(getByText(`${worker.mainJob.title}`)).toBeTruthy();
    });
  });

  it('should render count box, select links and select all link, but no deselect links, when nothing is selected', async () => {
    const { component, fixture, getByText, queryByText, getByTestId, getAllByText, queryAllByText, workers } =
      await setup();

    component.paginatedWorkers = workers;
    fixture.detectChanges();

    expect(getByText('Select all')).toBeTruthy();
    expect(queryByText('Deselect all')).toBeFalsy();
    expect(getAllByText('Select').length).toEqual(3);
    expect(queryAllByText('Deselect').length).toEqual(0);
    const selectedStaffPanel = getByTestId('selectedStaffPanel');
    expect(within(selectedStaffPanel).getByText('0')).toBeTruthy();
  });

  it('should change link text and update the count box when a staff member is selected', async () => {
    const { component, fixture, getAllByText, getByTestId, getByText, workers } = await setup();

    component.paginatedWorkers = workers;
    fixture.detectChanges();

    const firstWorkerSelectLink = getAllByText('Select')[0];
    fireEvent.click(firstWorkerSelectLink);
    fixture.detectChanges();

    const selectedStaffPanel = getByTestId('selectedStaffPanel');

    expect(getByText('Deselect')).toBeTruthy();
    expect(getAllByText('Select').length).toEqual(2);
    expect(getByText('Select all')).toBeTruthy();
    expect(within(selectedStaffPanel).getByText('1')).toBeTruthy();
  });

  it('should change link text and update count box when a staff member is deselected', async () => {
    const { component, fixture, getAllByText, queryByText, getByTestId, getByText, workers } = await setup();

    component.paginatedWorkers = workers;
    fixture.detectChanges();

    const firstWorkerSelectLink = getAllByText('Select')[0];
    fireEvent.click(firstWorkerSelectLink);
    fixture.detectChanges();

    const deselectLink = getByText('Deselect');
    fireEvent.click(deselectLink);
    fixture.detectChanges();

    const selectedStaffPanel = getByTestId('selectedStaffPanel');

    expect(queryByText('Deselect')).toBeFalsy();
    expect(getAllByText('Select').length).toEqual(3);
    expect(within(selectedStaffPanel).getByText('0')).toBeTruthy();
  });

  it('should select all staff and update count when select all is clicked', async () => {
    const { component, fixture, getAllByText, getByTestId, getByText, workers } = await setup();

    component.paginatedWorkers = workers;
    fixture.detectChanges();

    const selectAllLink = getByText('Select all');
    fireEvent.click(selectAllLink);
    fixture.detectChanges();

    const selectedStaffPanel = getByTestId('selectedStaffPanel');

    expect(getByText('Deselect all')).toBeTruthy();
    expect(getAllByText('Deselect').length).toEqual(3);
    expect(within(selectedStaffPanel).getByText('3')).toBeTruthy();
  });

  it('should change select all link text when each staff is selected individually', async () => {
    const { component, fixture, getAllByText, getByTestId, getByText, workers } = await setup();

    component.paginatedWorkers = workers;
    fixture.detectChanges();

    const selectLinks = getAllByText('Select');
    selectLinks.forEach((link) => {
      fireEvent.click(link);
    });

    fixture.detectChanges();

    const selectedStaffPanel = getByTestId('selectedStaffPanel');

    expect(getByText('Deselect all')).toBeTruthy();
    expect(getAllByText('Deselect').length).toEqual(3);
    expect(within(selectedStaffPanel).getByText('3')).toBeTruthy();
  });

  it('should select all staff (including those on different page) and update count when select all is clicked and there is pagination', async () => {
    const { component, fixture, getAllByText, getByTestId, getByText, workers } = await setup(20);

    component.paginatedWorkers = workers;
    fixture.detectChanges();

    const selectAllLink = getByText('Select all');
    fireEvent.click(selectAllLink);
    fixture.detectChanges();

    const selectedStaffPanel = getByTestId('selectedStaffPanel');

    expect(getByText('Deselect all')).toBeTruthy();
    expect(getAllByText('Deselect').length).toEqual(20);
    expect(within(selectedStaffPanel).getByText('20')).toBeTruthy();
  });

  it('should deselect all staff and update count when deselect all is clicked', async () => {
    const { component, fixture, getAllByText, queryAllByText, getByTestId, queryByText, getByText, workers } =
      await setup();

    component.paginatedWorkers = workers;
    fixture.detectChanges();

    const selectAllLink = getByText('Select all');
    fireEvent.click(selectAllLink);
    fixture.detectChanges();

    const deselectAllLink = getByText('Deselect all');
    fireEvent.click(deselectAllLink);
    fixture.detectChanges();

    const selectedStaffPanel = getByTestId('selectedStaffPanel');

    expect(queryByText('Deselect all')).toBeFalsy();
    expect(queryAllByText('Deselect').length).toEqual(0);
    expect(getAllByText('Select').length).toEqual(3);
    expect(within(selectedStaffPanel).getByText('0')).toBeTruthy();
  });

  it('should change deselect all link text and update count when a staff member is deselected', async () => {
    const { component, fixture, getAllByText, getByTestId, queryByText, getByText, workers } = await setup();

    component.paginatedWorkers = workers;
    fixture.detectChanges();

    const selectAllLink = getByText('Select all');
    fireEvent.click(selectAllLink);
    fixture.detectChanges();

    const deselectStaffLink = getAllByText('Deselect')[0];
    fireEvent.click(deselectStaffLink);
    fixture.detectChanges();

    const selectedStaffPanel = getByTestId('selectedStaffPanel');

    expect(queryByText('Deselect all')).toBeFalsy();
    expect(getAllByText('Deselect').length).toEqual(2);
    expect(getByText('Select')).toBeTruthy();
    expect(within(selectedStaffPanel).getByText('2')).toBeTruthy();
  });

  describe('Search bar', () => {
    it('should not show the search box when there are fewer than 16 staff', async () => {
      const { component, fixture, queryByLabelText, workers } = await setup(15);

      component.paginatedWorkers = workers;
      fixture.detectChanges();

      expect(queryByLabelText('Search for staff')).toBeFalsy();
    });

    it('should not show the search box when there are more than 15 staff', async () => {
      const { component, fixture, getByLabelText, workers } = await setup(16);

      component.paginatedWorkers = workers;
      fixture.detectChanges();

      expect(getByLabelText('Search for staff')).toBeTruthy();
    });

    it('should call getAllWorkers with correct search term if passed and display the search results in a table', async () => {
      const { component, fixture, getByLabelText, getByTestId, workerSpy, searchSpy, workers } = await setup(16);
      component.paginatedWorkers = workers;
      fixture.detectChanges();

      const searchInput = getByLabelText('Search for staff');
      userEvent.type(searchInput, `${workers[0].nameOrId}{enter}`);
      component.searchResults = [workers[0]];
      fixture.detectChanges();

      const expectedEmit = {
        pageIndex: 0,
        itemsPerPage: 15,
        sortBy: 'staffNameAsc',
        searchTerm: workers[0].nameOrId,
      };

      expect(workerSpy.calls.mostRecent().args[1]).toEqual(expectedEmit);
      expect(searchSpy).toHaveBeenCalledOnceWith(workers[0].nameOrId);

      const searchResults = getByTestId('searchResults');
      expect(within(searchResults).getByText('Showing search results')).toBeTruthy();
      expect(within(searchResults).getByText('Clear search results')).toBeTruthy();
      expect(within(searchResults).getByText(workers[0].nameOrId)).toBeTruthy();
      expect(within(searchResults).getByText(workers[0].mainJob.title)).toBeTruthy();
    });

    it('should show a message if there are no results from the search', async () => {
      const { component, fixture, getByLabelText, getByTestId, workers } = await setup(16);
      component.paginatedWorkers = workers;
      fixture.detectChanges();

      const searchInput = getByLabelText('Search for staff');
      userEvent.type(searchInput, `Search returning nothing{enter}`);
      component.searchResults = [];
      fixture.detectChanges();

      const searchResults = getByTestId('searchResults');
      expect(within(searchResults).getByText('There are no matching results')).toBeTruthy();
      expect(within(searchResults).getByText('Clear search results')).toBeTruthy();
      expect(within(searchResults).getByText('Make sure that your spelling is correct.')).toBeTruthy();
    });

    it('should clear the search and remove the search results when the clear search link is clicked', async () => {
      const { component, fixture, getByLabelText, getByTestId, queryByTestId, workers } = await setup(16);
      const cancelSearchSpy = spyOn(component, 'handleResetSearch').and.callThrough();

      component.paginatedWorkers = workers;
      fixture.detectChanges();

      const searchInput = getByLabelText('Search for staff');
      userEvent.type(searchInput, `${workers[0].nameOrId}{enter}`);
      component.searchResults = [workers[0]];
      fixture.detectChanges();

      const searchResults = getByTestId('searchResults');
      const clearSearchLink = within(searchResults).getByText('Clear search results');
      fireEvent.click(clearSearchLink);

      expect(queryByTestId('searchResults')).toBeFalsy();
      expect(cancelSearchSpy).toHaveBeenCalled();
    });
  });

  describe('Continue', () => {
    it('should store the selected staff in the training service when selecting all staff and pressing continue', async () => {
      const { component, fixture, getByText, workers, updateSelectedStaffSpy } = await setup();

      component.paginatedWorkers = workers;
      fixture.detectChanges();

      const selectAllLink = getByText('Select all');
      fireEvent.click(selectAllLink);
      fixture.detectChanges();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(updateSelectedStaffSpy).toHaveBeenCalledWith(workers);
    });

    it('should store the selected staff in the training service when selecting individual staff and pressing continue', async () => {
      const { component, fixture, getByText, getAllByText, workers, updateSelectedStaffSpy } = await setup();

      component.paginatedWorkers = workers;
      fixture.detectChanges();

      const selectLink = getAllByText('Select')[0];
      fireEvent.click(selectLink);
      fixture.detectChanges();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(updateSelectedStaffSpy).toHaveBeenCalledWith([workers[0]]);
    });

    it('should navigate to the training details page when pressing continue', async () => {
      const { component, fixture, getByText, spy, workers } = await setup();

      component.paginatedWorkers = workers;
      fixture.detectChanges();

      const selectAllLink = getByText('Select all');
      fireEvent.click(selectAllLink);
      fixture.detectChanges();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith([
        'workplace',
        component.workplaceUid,
        'add-multiple-training',
        'training-details',
      ]);
    });

    it('should return an error if no staff have been selected', async () => {
      const { component, fixture, getByText, getAllByText, workers } = await setup();

      component.paginatedWorkers = workers;
      fixture.detectChanges();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);
      fixture.detectChanges();

      expect(getAllByText('Select who you want to add a record for').length).toEqual(2);
    });

    it('should navigate to the confirm training page when page has been accessed from that page and pressing Save and return', async () => {
      const { component, fixture, getByText, spy, workers } = await setup(3, true);

      component.paginatedWorkers = workers;
      fixture.detectChanges();

      const selectAllLink = getByText('Select all');
      fireEvent.click(selectAllLink);
      fixture.detectChanges();

      const continueButton = getByText('Save and return');
      fireEvent.click(continueButton);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith([
        'workplace',
        component.workplaceUid,
        'add-multiple-training',
        'confirm-training',
      ]);
    });
  });

  describe('Prefill', () => {
    it('should show all staff selected if rendering this page having already selected all staff', async () => {
      const { component, fixture, getByText, getAllByText, getByTestId, workers } = await setup();

      component.trainingService.selectedStaff = workers;
      component.ngOnInit();
      component.paginatedWorkers = workers;
      fixture.detectChanges();

      const selectedStaffPanel = getByTestId('selectedStaffPanel');

      expect(getByText('Deselect all')).toBeTruthy();
      expect(getAllByText('Deselect').length).toEqual(3);
      expect(within(selectedStaffPanel).getByText('3')).toBeTruthy();
    });

    it('should show the staff selected if rendering this page having already selected some staff', async () => {
      const { component, fixture, getByText, getAllByText, getByTestId, workers } = await setup();

      component.trainingService.selectedStaff = [workers[0]];
      component.ngOnInit();
      component.paginatedWorkers = workers;
      fixture.detectChanges();

      const selectedStaffPanel = getByTestId('selectedStaffPanel');

      expect(getByText('Select all')).toBeTruthy();
      expect(getByText('Deselect')).toBeTruthy();
      expect(getAllByText('Select').length).toEqual(2);
      expect(within(selectedStaffPanel).getByText('1')).toBeTruthy();
    });
  });

  describe('onCancel()', () => {
    it('should reset selected staff in training service and navigate to dashboard if primary user', async () => {
      const { component, fixture, getByText, spy, trainingSpy } = await setup();

      component.primaryWorkplaceUid = '1234-5678';
      component.setReturnLink();
      fixture.detectChanges();

      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(trainingSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
    });

    it(`should reset selected staff in training service and navigate to subsidiary's dashboard if not primary user`, async () => {
      const { component, fixture, getByText, spy, trainingSpy } = await setup();

      component.primaryWorkplaceUid = '5678-9001';
      component.setReturnLink();
      fixture.detectChanges();

      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(trainingSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(['/workplace', '1234-5678'], { fragment: 'training-and-qualifications' });
    });

    it('should navigate to the confirm training page when page has been accessed from that page and pressing Cancel', async () => {
      const { fixture, getByText, trainingSpy, spy } = await setup(3, true);

      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);
      fixture.detectChanges();

      expect(trainingSpy).not.toHaveBeenCalled();
      expect(spy.calls.mostRecent().args[0]).toEqual(['../']);
    });
  });

  describe('setReturnLink', () => {
    it('should set returnLink to the dashboard if the establishment uid is the same as the primary uid', async () => {
      const { component, fixture } = await setup();

      component.primaryWorkplaceUid = '1234-5678';
      component.setReturnLink();
      fixture.detectChanges();

      expect(component.returnLink).toEqual(['/dashboard']);
    });

    it(`should set returnLink to the subsidiary's dashboard if the establishment uid is not the same as the primary uid`, async () => {
      const { component, fixture } = await setup();

      component.primaryWorkplaceUid = '5678-9001';
      component.setReturnLink();
      fixture.detectChanges();

      expect(component.returnLink).toEqual(['/workplace', '1234-5678']);
    });
  });
});
