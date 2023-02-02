import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SortStaffOptions } from '@core/model/establishment.model';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { PaginationComponent } from '../pagination/pagination.component';
import { SearchInputComponent } from '../search-input/search-input.component';
import { TablePaginationWrapperComponent } from './table-pagination-wrapper.component';

describe('TablePaginationWrapperCompnent', () => {
  const setup = async (totalCount = 20) => {
    const { fixture, getByTestId, queryByTestId, getByLabelText, getByRole, getByText } = await render(
      TablePaginationWrapperComponent,
      {
        imports: [HttpClientTestingModule, RouterModule, RouterTestingModule, ReactiveFormsModule],
        declarations: [PaginationComponent, SearchInputComponent],
        componentProperties: {
          totalCount,
          count: totalCount,
          sortByParamMap: {
            '0_asc': 'staffNameAsc',
            '0_dsc': 'staffNameDesc',
            '1_asc': 'jobRoleAsc',
            '1_dsc': 'jobRoleDesc',
          },
          sortOptions: SortStaffOptions,
          searchTerm: '',
        },
      },
    );
    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    spyOnProperty(router, 'url').and.returnValue('dashboard#staff-records');

    const emitSpy = spyOn(component.fetchData, 'emit');
    const handleSearchSpy = spyOn(component, 'handleSearch').and.callThrough();
    const handlePageUpdateSpy = spyOn(component, 'handlePageUpdate').and.callThrough();
    component.ngOnInit();

    return {
      component,
      fixture,
      getByTestId,
      queryByTestId,
      getByLabelText,
      getByRole,
      getByText,
      routerSpy,
      emitSpy,
      handleSearchSpy,
      handlePageUpdateSpy,
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
      const { queryByTestId } = await setup(14);
      expect(queryByTestId('search')).toBeFalsy();
    });

    it('should call handleSearch, add query string to url and emit the properties for getting the worker when searching for a worker', async () => {
      const { component, routerSpy, emitSpy, handleSearchSpy, getByLabelText, getByRole } = await setup();

      userEvent.type(getByLabelText('Search'), 'Someone');
      userEvent.click(getByRole('button', { name: 'search' }));

      expect(handleSearchSpy).toHaveBeenCalledWith('Someone');
      expect(routerSpy).toHaveBeenCalledWith([], {
        fragment: 'staff-records',
        queryParams: { search: 'Someone', tab: 'staff' },
        queryParamsHandling: 'merge',
      });
      const { currentPageIndex: index, itemsPerPage, searchTerm, sortByValue } = component;
      expect(emitSpy).toHaveBeenCalledWith({ index, itemsPerPage, searchTerm, sortByValue });
    });

    it('should call handleSearch, remove the query params from url and emit the properties for getting all workers when clearing the search', async () => {
      const { component, fixture, routerSpy, emitSpy, handleSearchSpy, getByLabelText, getByRole, getByText } =
        await setup();

      userEvent.type(getByLabelText('Search'), 'Someone');
      userEvent.click(getByRole('button', { name: 'search' }));
      fixture.detectChanges();
      const clearSearch = getByText('Clear search results');
      userEvent.click(clearSearch);

      expect(handleSearchSpy.calls.mostRecent().args[0]).toEqual('');
      expect(routerSpy).toHaveBeenCalledWith([], {
        fragment: 'staff-records',
      });
      const { currentPageIndex: index, itemsPerPage, searchTerm, sortByValue } = component;
      expect(emitSpy).toHaveBeenCalledWith({ index, itemsPerPage, searchTerm, sortByValue });
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

      it('should call the handlePageUpdate function when clicking `3` on the pagination and emit properties for getting workers', async () => {
        const { component, fixture, emitSpy, handlePageUpdateSpy, getByText } = await setup(35);

        userEvent.click(getByText('3'));
        await fixture.whenStable();

        expect(handlePageUpdateSpy).toHaveBeenCalledWith(2);
        const { currentPageIndex: index, itemsPerPage, searchTerm, sortByValue } = component;
        expect(emitSpy).toHaveBeenCalledWith({ index, itemsPerPage, searchTerm, sortByValue });
      });
    });
  });
});
