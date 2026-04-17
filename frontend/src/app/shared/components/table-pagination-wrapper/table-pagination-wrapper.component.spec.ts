import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SortStaffOptions } from '@core/model/establishment.model';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { PaginationComponent } from '../pagination/pagination.component';
import { SearchInputComponent } from '../search-input/search-input.component';
import { TablePaginationWrapperComponent } from './table-pagination-wrapper.component';
import { NewPillWithLinkComponent } from '../new-pill-with-link/new-pill-with-link.component';
import { provideHttpClient } from '@angular/common/http';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';

describe('TablePaginationWrapperCompnent', () => {
  const workplaceUid = 'some-uuid';
  const setup = async (overrides: any = {}) => {
    const totalCount = overrides.totalCount ?? 20;
    const setQueryInParams = overrides.setQueryInParams ?? false;

    const setupTools = await render(TablePaginationWrapperComponent, {
      imports: [RouterModule, ReactiveFormsModule],
      declarations: [PaginationComponent, SearchInputComponent, NewPillWithLinkComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
      ],

      componentProperties: {
        totalCount,
        setQueryInParams,
        count: totalCount,
        sortByParamMap: {
          '0_asc': 'staffNameAsc',
          '0_dsc': 'staffNameDesc',
          '1_asc': 'jobRoleAsc',
          '1_dsc': 'jobRoleDesc',
        },
        sortOptions: SortStaffOptions,
        searchTerm: '',
        currentPageIndex: overrides.currentPageIndex ?? 0,
        maintainedPageIndex: overrides.maintainedPageIndex ?? null,
        wdfView: overrides.wdfView ?? false,
        showNewPill: overrides.showNewPill ?? false,
        showUpdatePayForMultipleStaffLink: overrides.showUpdatePayForMultipleStaffLink ?? false,
        workplaceUid,
      },
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    spyOnProperty(router, 'url').and.returnValue('dashboard#staff-records');

    const emitSpy = spyOn(component.fetchData, 'emit');
    const handleSearchSpy = spyOn(component, 'handleSearch').and.callThrough();
    const handlePageUpdateSpy = spyOn(component, 'handlePageUpdate').and.callThrough();

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const updateSingleFieldSpy = spyOn(establishmentService, 'updateSingleEstablishmentField').and.returnValue(
      of(null),
    );

    return {
      ...setupTools,
      component,
      emitSpy,
      handleSearchSpy,
      handlePageUpdateSpy,
      routerSpy,
      updateSingleFieldSpy,
    };
  };

  it('should create', async () => {
    const component = await setup();

    expect(component).toBeTruthy();
  });

  describe('Search', () => {
    it('should display the search box if the total worker count is greater than the items per page', async () => {
      const { getByTestId } = await setup();
      expect(getByTestId('search')).toBeTruthy();
    });

    it('should not display the search box if the total worker count is less than the items per page', async () => {
      const { queryByTestId } = await setup({ totalCount: 14 });
      expect(queryByTestId('search')).toBeFalsy();
    });

    it('should call handleSearch and emit the properties for getting the worker when searching for a worker', async () => {
      const { component, emitSpy, handleSearchSpy, getByLabelText, getByRole } = await setup();

      userEvent.type(getByLabelText('Search'), 'Someone');
      userEvent.click(getByRole('button', { name: 'search' }));

      expect(handleSearchSpy).toHaveBeenCalledWith('Someone');
      const { currentPageIndex: index, itemsPerPage, searchTerm, sortByValue } = component;
      expect(emitSpy).toHaveBeenCalledWith({ index, itemsPerPage, searchTerm, sortByValue });
    });

    it('should call handleSearch and emit the properties for getting all workers when clearing the search', async () => {
      const { component, fixture, emitSpy, handleSearchSpy, getByLabelText, getByRole, getByText } = await setup();

      userEvent.type(getByLabelText('Search'), 'Someone');
      userEvent.click(getByRole('button', { name: 'search' }));
      fixture.detectChanges();
      const clearSearch = getByText('Clear search results');
      userEvent.click(clearSearch);

      expect(handleSearchSpy.calls.mostRecent().args[0]).toEqual('');
      const { currentPageIndex: index, itemsPerPage, searchTerm, sortByValue } = component;
      expect(emitSpy).toHaveBeenCalledWith({ index, itemsPerPage, searchTerm, sortByValue });
    });

    describe('Setting query in params', () => {
      it('should set query in params on search when setQueryInParams is passed in as true', async () => {
        const { getByLabelText, getByRole, routerSpy } = await setup({ setQueryInParams: true });

        userEvent.type(getByLabelText('Search'), 'Someone');
        userEvent.click(getByRole('button', { name: 'search' }));

        expect(routerSpy).toHaveBeenCalledWith([], {
          fragment: 'staff-records',
          queryParams: { search: 'Someone', tab: 'staff' },
          queryParamsHandling: 'merge',
        });
      });

      it('should remove the query params from url when clearing the search when setQueryInParams is passed in as true', async () => {
        const { fixture, getByText, getByLabelText, getByRole, routerSpy } = await setup({ setQueryInParams: true });

        userEvent.type(getByLabelText('Search'), 'Someone');
        userEvent.click(getByRole('button', { name: 'search' }));
        fixture.detectChanges();
        const clearSearch = getByText('Clear search results');
        userEvent.click(clearSearch);

        expect(routerSpy).toHaveBeenCalledWith([], {
          fragment: 'staff-records',
        });
      });

      it('should not set query in params on search when setQueryInParams is not passed in', async () => {
        const { getByLabelText, getByRole, routerSpy } = await setup();

        userEvent.type(getByLabelText('Search'), 'Someone');
        userEvent.click(getByRole('button', { name: 'search' }));

        expect(routerSpy).not.toHaveBeenCalled();
      });

      it('should not call router navigate when clearing the search when setQueryInParams is not passed in', async () => {
        const { fixture, getByText, getByLabelText, getByRole, routerSpy } = await setup();

        userEvent.type(getByLabelText('Search'), 'Someone');
        userEvent.click(getByRole('button', { name: 'search' }));
        fixture.detectChanges();
        const clearSearch = getByText('Clear search results');
        userEvent.click(clearSearch);

        expect(routerSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('Sort', () => {
    it('should call the sortBy function when selecting a different parameter for sorting and emit properties for getting workers', async () => {
      const { component, emitSpy, getByLabelText } = await setup();

      const handleSortSpy = spyOn(component, 'sortBy').and.callThrough();

      const sortByObjectKeys = Object.keys(component.sortOptions);
      userEvent.selectOptions(getByLabelText('Sort by'), sortByObjectKeys[1]);

      expect(handleSortSpy).toHaveBeenCalledWith(sortByObjectKeys[1]);
      const { currentPageIndex: index, itemsPerPage, searchTerm, sortByValue } = component;
      expect(emitSpy).toHaveBeenCalledWith({ index, itemsPerPage, searchTerm, sortByValue });
    });
  });

  describe('handlePageUpdate', () => {
    it('should call the handlePageUpdate function when clicking Next on the pagination and emit properties for getting workers', async () => {
      const { component, fixture, emitSpy, handlePageUpdateSpy, getByText } = await setup();

      userEvent.click(getByText('Next'));
      await fixture.whenStable();

      expect(handlePageUpdateSpy).toHaveBeenCalledWith(1);
      const { currentPageIndex: index, itemsPerPage, searchTerm, sortByValue } = component;
      expect(emitSpy).toHaveBeenCalledWith({ index, itemsPerPage, searchTerm, sortByValue });
    });

    it('should call the handlePageUpdate function when clicking "3" on the pagination and emit properties for getting workers', async () => {
      const { component, fixture, emitSpy, handlePageUpdateSpy, getByText } = await setup({ totalCount: 35 });

      userEvent.click(getByText('3'));
      await fixture.whenStable();

      expect(handlePageUpdateSpy).toHaveBeenCalledWith(2);
      const { currentPageIndex: index, itemsPerPage, searchTerm, sortByValue } = component;
      expect(emitSpy).toHaveBeenCalledWith({ index, itemsPerPage, searchTerm, sortByValue });
    });
  });

  describe('page index', () => {
    it('should use the value from maintainedPageIndex', async () => {
      const { component } = await setup({ maintainedPageIndex: 1, currentPageIndex: 0 });

      expect(component.currentPageIndex).toEqual(1);
    });

    it('should use the currentPageIndex value ', async () => {
      const { component } = await setup({ currentPageIndex: 0 });

      expect(component.currentPageIndex).toEqual(0);
    });
  });

  describe('Update pay for multiple staff', () => {
    const linkText = 'Update pay for multiple staff';

    describe('when the search bar is showing', () => {
      it('should show updatePayForMultipleStaffLinkOnTopOfSearchBar with the new pill when showNewPill is true and totalCount is above itemsPerPage', async () => {
        const overrides = {
          showNewPill: true,
          showUpdatePayForMultipleStaffLink: true,
          totalCount: 16,
          wdfView: false,
        };

        const { getByTestId, queryByTestId } = await setup(overrides);

        const newPillWithLink = getByTestId('updatePayForMultipleStaffLinkOnTopOfSearchBar');

        expect(newPillWithLink).toBeTruthy();
        expect(within(newPillWithLink).getByText(linkText)).toBeTruthy();
        expect(within(newPillWithLink).queryByTestId('new-pill')).toBeTruthy();
        expect(queryByTestId('updatePayForMultipleStaffLinkWhenNoSearchBar')).toBeFalsy();
      });

      it('should show updatePayForMultipleStaffLinkOnTopOfSearchBar without the new pill when showNewPill is false and totalCount is above itemsPerPage', async () => {
        const overrides = {
          showNewPill: false,
          showUpdatePayForMultipleStaffLink: true,
          totalCount: 16,
          wdfView: false,
        };

        const { getByTestId, queryByTestId } = await setup(overrides);

        const newPillWithLink = getByTestId('updatePayForMultipleStaffLinkOnTopOfSearchBar');

        expect(newPillWithLink).toBeTruthy();
        expect(within(newPillWithLink).getByText(linkText)).toBeTruthy();
        expect(within(newPillWithLink).queryByTestId('new-pill')).toBeFalsy();
        expect(queryByTestId('updatePayForMultipleStaffLinkWhenNoSearchBar')).toBeFalsy();
      });

      it('should not show updatePayForMultipleStaffLinkOnTopOfSearchBar when totalCount is below itemsPerPage', async () => {
        const overrides = { totalCount: 6, wdfView: false };

        const { queryByTestId } = await setup(overrides);

        const newPillWithLink = queryByTestId('updatePayForMultipleStaffLinkOnTopOfSearchBar');

        expect(newPillWithLink).toBeFalsy();
      });

      it('should not show updatePayForMultipleStaffLinkOnTopOfSearchBar when totalCount is above itemsPerPage and wdfView is true', async () => {
        const overrides = { totalCount: 16, wdfView: true };

        const { queryByTestId } = await setup(overrides);

        const newPillWithLink = queryByTestId('updatePayForMultipleStaffLinkOnTopOfSearchBar');

        expect(newPillWithLink).toBeFalsy();
      });

      it('should not show updatePayForMultipleStaffLinkOnTopOfSearchBar when showUpdatePayForMultipleStaffLink is false', async () => {
        const overrides = { showUpdatePayForMultipleStaffLink: false, totalCount: 16, wdfView: false };

        const { queryByTestId } = await setup(overrides);

        const newPillWithLink = queryByTestId('updatePayForMultipleStaffLinkOnTopOfSearchBar');

        expect(newPillWithLink).toBeFalsy();
      });

      it('should navigate to the update-pay-multiple-staff page', async () => {
        const overrides = { showUpdatePayForMultipleStaffLink: true, totalCount: 16, wdfView: false };
        const { component, fixture, getByTestId, routerSpy } = await setup(overrides);

        const newPillWithLink = getByTestId('updatePayForMultipleStaffLinkOnTopOfSearchBar');
        const link = within(newPillWithLink).getByText(linkText);

        fireEvent.click(link);
        fixture.autoDetectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['workplace', component.workplaceUid, 'update-pay-multiple-staff']);
      });
    });

    describe('when the search bar is not showing', () => {
      it('should show updatePayForMultipleStaffLinkWhenNoSearchBar with the new pill when showNewPill is true, totalCount is below itemsPerPage', async () => {
        const overrides = { showNewPill: true, showUpdatePayForMultipleStaffLink: true, totalCount: 6, wdfView: false };

        const { getByTestId, queryByTestId } = await setup(overrides);

        const newPillWithLink = getByTestId('updatePayForMultipleStaffLinkWhenNoSearchBar');

        expect(newPillWithLink).toBeTruthy();
        expect(within(newPillWithLink).getByText(linkText)).toBeTruthy();
        expect(within(newPillWithLink).getByTestId('new-pill')).toBeTruthy();
        expect(queryByTestId('updatePayForMultipleStaffLinkOnTopOfSearchBar')).toBeFalsy();
      });

      it('should show updatePayForMultipleStaffLinkWhenNoSearchBar without the new pill when showNewPill is false, when totalCount is below itemsPerPage', async () => {
        const overrides = {
          showNewPill: false,
          showUpdatePayForMultipleStaffLink: true,
          totalCount: 6,
          wdfView: false,
        };

        const { getByTestId, queryByTestId } = await setup(overrides);

        const newPillWithLink = getByTestId('updatePayForMultipleStaffLinkWhenNoSearchBar');

        expect(newPillWithLink).toBeTruthy();
        expect(within(newPillWithLink).getByText(linkText)).toBeTruthy();
        expect(within(newPillWithLink).queryByTestId('new-pill')).toBeFalsy();
        expect(queryByTestId('updatePayForMultipleStaffLinkOnTopOfSearchBar')).toBeFalsy();
      });

      it('should show updatePayForMultipleStaffLinkWhenNoSearchBar when totalCount is the same as itemsPerPage', async () => {
        const overrides = { showUpdatePayForMultipleStaffLink: true, totalCount: 15, wdfView: false };

        const { getByTestId } = await setup(overrides);

        const newPillWithLink = getByTestId('updatePayForMultipleStaffLinkWhenNoSearchBar');

        expect(newPillWithLink).toBeTruthy();
      });

      it('should not show updatePayForMultipleStaffLinkWhenNoSearchBar when showUpdatePayForMultipleStaffLink is false', async () => {
        const overrides = { showUpdatePayForMultipleStaffLink: false, totalCount: 13, wdfView: false };

        const { queryByTestId } = await setup(overrides);

        const newPillWithLink = queryByTestId('updatePayForMultipleStaffLinkWhenNoSearchBar');

        expect(newPillWithLink).toBeFalsy();
      });

      it('should not show updatePayForMultipleStaffLinkWhenNoSearchBar when totalCount is above itemsPerPage', async () => {
        const overrides = { showUpdatePayForMultipleStaffLink: true, totalCount: 16, wdfView: false };

        const { queryByTestId } = await setup(overrides);

        const newPillWithLink = queryByTestId('updatePayForMultipleStaffLinkWhenNoSearchBar');

        expect(newPillWithLink).toBeFalsy();
      });

      it('should not show updatePayForMultipleStaffLinkWhenNoSearchBar when totalCount is below itemsPerPage and wdfView is true', async () => {
        const overrides = { showUpdatePayForMultipleStaffLink: true, totalCount: 6, wdfView: true };

        const { queryByTestId } = await setup(overrides);

        const newPillWithLink = queryByTestId('updatePayForMultipleStaffLinkWhenNoSearchBar');

        expect(newPillWithLink).toBeFalsy();
      });

      it('should navigate to the update-pay-multiple-staff page', async () => {
        const overrides = { showUpdatePayForMultipleStaffLink: true, totalCount: 8, wdfView: false };
        const { fixture, getByTestId, routerSpy } = await setup(overrides);

        const newPillWithLink = getByTestId('updatePayForMultipleStaffLinkWhenNoSearchBar');
        const link = within(newPillWithLink).getByText(linkText);

        fireEvent.click(link);
        fixture.autoDetectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['workplace', workplaceUid, 'update-pay-multiple-staff']);
      });
    });

    it('should call updateSingleEstablishmentField if showNewPill is true', async () => {
      const { fixture, getByText, updateSingleFieldSpy } = await setup({
        showNewPill: true,
        showUpdatePayForMultipleStaffLink: true,
        totalCount: 15,
        wdfView: false,
      });

      const link = getByText(linkText);
      fireEvent.click(link);
      fixture.autoDetectChanges();

      expect(updateSingleFieldSpy).toHaveBeenCalledWith(workplaceUid, {
        property: 'updatePayForMultiStaffViewed',
        value: true,
      });
    });

    [false, null].forEach((value) => {
      it(`should not call updateSingleEstablishmentField if showNewPill is ${value}`, async () => {
        const overrides = {
          showNewPill: value,
          showUpdatePayForMultipleStaffLink: true,
          totalCount: 15,
          wdfView: false,
        };
        const { fixture, getByText, updateSingleFieldSpy } = await setup(overrides);

        const link = getByText(linkText);
        fireEvent.click(link);
        fixture.autoDetectChanges();

        expect(updateSingleFieldSpy).not.toHaveBeenCalled();
      });
    });

    it('should clear workersGroupedByJobRole on init', async () => {
      const clearSpy = spyOn(WorkerService.prototype, 'clearWorkersGroupedByJobRole').and.callThrough();

      await setup();

      expect(clearSpy).toHaveBeenCalled();
    });
  });
});
