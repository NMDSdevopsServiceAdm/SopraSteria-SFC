import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SortStaffOptions } from '@core/model/establishment.model';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { PaginationComponent } from '../pagination/pagination.component';
import { SearchInputComponent } from '../search-input/search-input.component';
import { TablePaginationWrapperComponent } from './table-pagination-wrapper.component';

describe('TablePaginationWrapperCompnent', () => {
  const setup = async (overrides: any = {}) => {
    const totalCount = overrides.totalCount ?? 20;
    const setQueryInParams = overrides.setQueryInParams ?? false;

    const setupTools = await render(TablePaginationWrapperComponent, {
      imports: [HttpClientTestingModule, RouterModule, ReactiveFormsModule],
      declarations: [PaginationComponent, SearchInputComponent],
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
        isSearchMaintained: overrides.isSearchMaintained ?? false,
        maintainedPageIndex: overrides.maintainedPageIndex ?? null,
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

    return {
      ...setupTools,
      component,
      emitSpy,
      handleSearchSpy,
      handlePageUpdateSpy,
      routerSpy,
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

    it('should display the search box if isSearchMaintained is true', async () => {
      const { getByTestId } = await setup({ isSearchMaintained: true });
      expect(getByTestId('search')).toBeTruthy();
    });

    it('should not display the search box if isSearchMaintained is true but the total worker count is less than the items per page', async () => {
      const { queryByTestId } = await setup({ isSearchMaintained: true, totalCount: 4 });
      expect(queryByTestId('search')).toBeFalsy();
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
});
