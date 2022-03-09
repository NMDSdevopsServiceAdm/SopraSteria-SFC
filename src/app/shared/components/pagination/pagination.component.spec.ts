import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  async function setup(noOfItemsOnPage = 15, totalNoOfItems = 43) {
    const component = await render(PaginationComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [],
      componentProperties: {
        noOfItemsOnPage,
        totalNoOfItems,
      },
    });

    return component;
  }

  it('should render a PaginationComponent', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  describe('Displaying numbers and previous/next buttons', () => {
    it('should not display Previous when on first page', async () => {
      const { queryByText } = await setup();
      expect(queryByText('Previous')).toBeFalsy();
    });

    it('should display 1 to 3 when 43 items and pages of 15', async () => {
      const { queryByText } = await setup();

      expect(queryByText('1')).toBeTruthy();
      expect(queryByText('2')).toBeTruthy();
      expect(queryByText('3')).toBeTruthy();
      expect(queryByText('4')).toBeFalsy();
    });

    it('should display 1 to 5 when 43 items and pages of 10', async () => {
      const { queryByText } = await setup(10, 43);

      expect(queryByText('1')).toBeTruthy();
      expect(queryByText('2')).toBeTruthy();
      expect(queryByText('3')).toBeTruthy();
      expect(queryByText('4')).toBeTruthy();
      expect(queryByText('5')).toBeTruthy();
      expect(queryByText('6')).toBeFalsy();
    });

    it('should not display anything when only one page worth of items', async () => {
      const { queryByText } = await setup(15, 12);

      expect(queryByText('Previous')).toBeFalsy();
      expect(queryByText('Next')).toBeFalsy();
      expect(queryByText('1')).toBeFalsy();
    });

    it('should not display Next when on final page', async () => {
      const { fixture, queryByText } = await setup();

      fixture.componentInstance.currentPageNo = 2;
      fixture.detectChanges();

      expect(queryByText('Next')).toBeFalsy();
    });

    it('should display 1 as text (not link) when on page 1', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('pageNoText-0')).toBeTruthy();
    });
  });

  describe('Display changes when setting current page', () => {
    it('should display 1 as link and 2 as text when Next clicked from first page', async () => {
      const { fixture, queryByText, queryByTestId } = await setup();

      const nextPageButton = queryByText('Next');
      nextPageButton.click();

      fixture.detectChanges();

      expect(queryByTestId('pageNoLink-0')).toBeTruthy();
      expect(queryByTestId('pageNoText-0')).toBeFalsy();

      expect(queryByTestId('pageNoText-1')).toBeTruthy();
      expect(queryByTestId('pageNoLink-1')).toBeFalsy();
    });

    it('should display 1 as text and 2 as link when Previous clicked from second page', async () => {
      const { fixture, queryByText, queryByTestId } = await setup();

      fixture.componentInstance.currentPageNo = 1;
      fixture.detectChanges();

      const previousPageButton = queryByText('Previous');
      previousPageButton.click();

      fixture.detectChanges();

      expect(queryByTestId('pageNoLink-0')).toBeFalsy();
      expect(queryByTestId('pageNoText-0')).toBeTruthy();

      expect(queryByTestId('pageNoText-1')).toBeFalsy();
      expect(queryByTestId('pageNoLink-1')).toBeTruthy();
    });
  });
});
