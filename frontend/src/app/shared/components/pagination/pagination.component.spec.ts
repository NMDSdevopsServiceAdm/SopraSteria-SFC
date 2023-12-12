import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  async function setup(itemsPerPage = 15, totalNoOfItems = 43, isBigWindow = true) {
    const { fixture, queryByText, queryByTestId, rerender } = await render(PaginationComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [],
      componentProperties: {
        itemsPerPage,
        totalNoOfItems,
      },
    });

    const component = fixture.componentInstance;

    component.isBigWindow = isBigWindow;
    fixture.detectChanges();

    const emitSpy = spyOn(fixture.componentInstance.currentPageIndexChange, 'emit');

    return { component, fixture, queryByText, emitSpy, queryByTestId, rerender };
  }

  it('should render a PaginationComponent', async () => {
    const { component } = await setup();
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

    it('should not display any ellipses when there are less than 11 pages', async () => {
      const { component, fixture, queryByTestId } = await setup(15, 135);

      component.currentPageIndex = 4;
      fixture.detectChanges();

      expect(queryByTestId('elipsis-1')).toBeNull();
      expect(queryByTestId('elipsis-7')).toBeNull();
    });

    it('should not display anything when only one page worth of items', async () => {
      const { queryByText } = await setup(15, 12);

      expect(queryByText('Previous')).toBeFalsy();
      expect(queryByText('Next')).toBeFalsy();
      expect(queryByText('1')).toBeFalsy();
    });

    it('should not display Next when on final page', async () => {
      const { component, fixture, queryByText } = await setup();

      component.currentPageIndex = 2;
      fixture.detectChanges();

      expect(queryByText('Next')).toBeFalsy();
    });

    it('should display 1 as text (not link) when on page 1', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('pageNoText-0')).toBeTruthy();
    });
  });

  describe('Displaying page numbers as links/text', () => {
    it('should display 1 as text and 2 as link when on first page', async () => {
      const { component, fixture, queryByTestId } = await setup();

      component.currentPageIndex = 0;
      fixture.detectChanges();

      expect(queryByTestId('pageNoLink-0')).toBeFalsy();
      expect(queryByTestId('pageNoText-0')).toBeTruthy();

      expect(queryByTestId('pageNoText-1')).toBeFalsy();
      expect(queryByTestId('pageNoLink-1')).toBeTruthy();
    });

    it('should display 1 as link and 2 as text when on second page', async () => {
      const { fixture, component, queryByTestId } = await setup();

      component.currentPageIndex = 1;
      fixture.detectChanges();

      expect(queryByTestId('pageNoLink-0')).toBeTruthy();
      expect(queryByTestId('pageNoText-0')).toBeFalsy();

      expect(queryByTestId('pageNoText-1')).toBeTruthy();
      expect(queryByTestId('pageNoLink-1')).toBeFalsy();
    });

    it('should display 1 and 2 as links and 3 as text when on third page', async () => {
      const { fixture, component, queryByTestId } = await setup();

      component.currentPageIndex = 2;
      fixture.detectChanges();

      expect(queryByTestId('pageNoLink-0')).toBeTruthy();
      expect(queryByTestId('pageNoText-0')).toBeFalsy();

      expect(queryByTestId('pageNoText-2')).toBeTruthy();
      expect(queryByTestId('pageNoLink-2')).toBeFalsy();
    });
  });

  describe('Emitting event when clicking to page', () => {
    it('should emit 1 when Next button clicked from first page', async () => {
      const { queryByText, emitSpy } = await setup();

      const nextPageButton = queryByText('Next');
      nextPageButton.click();

      expect(emitSpy).toHaveBeenCalledWith(1);
    });

    it('should emit 0 when going to page 1 by clicking Previous button', async () => {
      const { fixture, queryByText, emitSpy } = await setup();

      fixture.componentInstance.currentPageIndex = 1;
      fixture.detectChanges();

      const previousPageButton = queryByText('Previous');
      previousPageButton.click();

      expect(emitSpy).toHaveBeenCalledWith(0);
    });

    it('should emit 2 when page 3 button clicked', async () => {
      const { queryByText, emitSpy } = await setup();

      const nextPageButton = queryByText('3');
      nextPageButton.click();

      expect(emitSpy).toHaveBeenCalledWith(2);
    });
  });

  describe('Displaying numbers when there are more than 10 pages', () => {
    it('should display page numbers 1 to 3 and final page number when on first page', async () => {
      const { queryByText } = await setup(15, 152);

      expect(queryByText('1')).toBeTruthy();
      expect(queryByText('2')).toBeTruthy();
      expect(queryByText('3')).toBeTruthy();

      expect(queryByText('4')).toBeFalsy();
      expect(queryByText('5')).toBeFalsy();
      expect(queryByText('6')).toBeFalsy();
      expect(queryByText('7')).toBeFalsy();
      expect(queryByText('8')).toBeFalsy();
      expect(queryByText('9')).toBeFalsy();
      expect(queryByText('10')).toBeFalsy();

      expect(queryByText('11')).toBeTruthy();
    });

    it('should display page numbers 11 - 9 and first page number when on last page', async () => {
      const { component, fixture, queryByText } = await setup(15, 152);

      component.currentPageIndex = 10;
      fixture.detectChanges();

      expect(queryByText('1')).toBeTruthy();

      expect(queryByText('2')).toBeFalsy();
      expect(queryByText('3')).toBeFalsy();
      expect(queryByText('4')).toBeFalsy();
      expect(queryByText('5')).toBeFalsy();
      expect(queryByText('6')).toBeFalsy();
      expect(queryByText('7')).toBeFalsy();
      expect(queryByText('8')).toBeFalsy();

      expect(queryByText('9')).toBeTruthy();
      expect(queryByText('10')).toBeTruthy();
      expect(queryByText('11')).toBeTruthy();
    });

    it('should display first, last, and pages 3-7 when on page 5', async () => {
      const { component, fixture, queryByText } = await setup(15, 153);

      component.currentPageIndex = 4;
      fixture.detectChanges();

      expect(queryByText('1')).toBeTruthy();

      expect(queryByText('2')).toBeFalsy();

      expect(queryByText('3')).toBeTruthy();
      expect(queryByText('4')).toBeTruthy();
      expect(queryByText('5')).toBeTruthy();
      expect(queryByText('6')).toBeTruthy();
      expect(queryByText('7')).toBeTruthy();

      expect(queryByText('8')).toBeFalsy();
      expect(queryByText('9')).toBeFalsy();

      expect(queryByText('11')).toBeTruthy();
    });
  });

  describe('Displaying ellipses when there are more than 10 pages', async () => {
    it('should display an elipsis after pages 1-3 when on first page', async () => {
      const { queryByText, queryByTestId } = await setup(15, 152);

      expect(queryByText('1')).toBeTruthy();
      expect(queryByText('2')).toBeTruthy();
      expect(queryByText('3')).toBeTruthy();

      expect(queryByTestId('elipsis-3')).toBeTruthy();
    });

    it('should display an ellipsis before pages 9-11 when on last page', async () => {
      const { component, fixture, queryByText, queryByTestId } = await setup(15, 152);

      component.currentPageIndex = 10;
      fixture.detectChanges();

      expect(queryByTestId('elipsis-7')).toBeTruthy();
      expect(queryByText('9')).toBeTruthy();
      expect(queryByText('10')).toBeTruthy();
      expect(queryByText('11')).toBeTruthy();
    });

    it('should display first page, pages 4-8 and ellipses either side when on page 6', async () => {
      const { component, fixture, queryByText, queryByTestId } = await setup(15, 152);

      component.currentPageIndex = 5;
      fixture.detectChanges();

      expect(queryByText('1')).toBeTruthy();
      expect(queryByTestId('elipsis-2')).toBeTruthy();
      expect(queryByText('4')).toBeTruthy();
      expect(queryByText('5')).toBeTruthy();
      expect(queryByText('6')).toBeTruthy();
      expect(queryByText('7')).toBeTruthy();
      expect(queryByText('8')).toBeTruthy();
      expect(queryByTestId('elipsis-8')).toBeTruthy();
      expect(queryByText('11')).toBeTruthy();
    });
  });

  describe('Only displaying Next and Previous when small screen', async () => {
    it('should just display Next button when on a small screen and on first page', async () => {
      const { queryByText } = await setup(15, 152, false);

      expect(queryByText('1')).toBeFalsy();
      expect(queryByText('2')).toBeFalsy();
      expect(queryByText('3')).toBeFalsy();

      expect(queryByText('Next')).toBeTruthy();
      expect(queryByText('Previous')).toBeFalsy();
    });

    it('should just display Previous button when on a small screen and on final page', async () => {
      const { component, queryByText, fixture } = await setup(15, 152, false);

      component.currentPageIndex = 10;
      fixture.detectChanges();

      expect(queryByText('9')).toBeFalsy();
      expect(queryByText('10')).toBeFalsy();
      expect(queryByText('11')).toBeFalsy();

      expect(queryByText('Next')).toBeFalsy();
      expect(queryByText('Previous')).toBeTruthy();
    });

    it('should just display Next and Previous buttons when on a small screen and on a page which is not first or last', async () => {
      const { component, queryByTestId, queryByText, fixture } = await setup(15, 152, false);

      component.currentPageIndex = 5;
      fixture.detectChanges();

      expect(queryByTestId('elipsis-2')).toBeFalsy();
      expect(queryByText('4')).toBeFalsy();
      expect(queryByText('5')).toBeFalsy();
      expect(queryByText('6')).toBeFalsy();
      expect(queryByText('7')).toBeFalsy();
      expect(queryByText('8')).toBeFalsy();
      expect(queryByTestId('elipsis-8')).toBeFalsy();

      expect(queryByText('Next')).toBeTruthy();
      expect(queryByText('Previous')).toBeTruthy();
    });
  });

  describe('re-render of component updates', () => {
    it('updates the display if the totalNoOfItems is updated', async () => {
      const { queryByText, rerender } = await setup(5, 10, true);

      expect(queryByText('1')).toBeTruthy();
      expect(queryByText('2')).toBeTruthy();
      expect(queryByText('Next')).toBeTruthy();

      rerender({ totalNoOfItems: 4 });

      expect(queryByText('1')).toBeFalsy();
      expect(queryByText('2')).toBeFalsy();
      expect(queryByText('Next')).toBeFalsy();
    });
  });
});
