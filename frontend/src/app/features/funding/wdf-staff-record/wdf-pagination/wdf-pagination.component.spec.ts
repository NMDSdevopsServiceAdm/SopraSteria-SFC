import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WdfPaginationComponent } from '@features/funding/wdf-staff-record/wdf-pagination/wdf-pagination.component';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { Observable, Subject } from 'rxjs';

describe('WdfPagination', () => {
  const setup = async (overrides: any = {}) => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(WdfPaginationComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: Observable.from([{ id: overrides.id ?? '123' }]),

            snapshot: {
              params: {
                establishmentuid: '',
              },
              paramMap: {
                get(id) {
                  return overrides.id ?? '123';
                },
              },
            },
          },
        },
      ],
      componentProperties: {
        workerList: ['1', '2', '3', '4'],
        exitUrl: overrides.exitUrl ?? { url: 'funding/test/url', fragment: 'staff-records' },
      },
    });

    const injector = getTestBed();
    const event = new NavigationEnd(42, '/', '/');
    (injector.inject(Router).events as unknown as Subject<RouterEvent>).next(event);

    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  it('should render a WdfPagination', async () => {
    const { component, fixture } = await setup();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should be able to find next and previous ids', async () => {
    const { component, fixture } = await setup({ id: '2' });
    const links = fixture.debugElement.queryAll(By.css('a'));
    const previousHref = links[1].nativeElement.getAttribute('ng-reflect-router-link');
    const nextHref = links[2].nativeElement.getAttribute('ng-reflect-router-link');
    fixture.detectChanges();

    expect(component.previousID).toEqual('1');
    expect(component.nextID).toEqual('3');
    expect(previousHref).toEqual('/funding,staff-record,1');
    expect(nextHref).toEqual('/funding,staff-record,3');
  });

  it('should only show Next staff record when current staff record is first ID in list', async () => {
    const { fixture, queryByText } = await setup({ id: '1' });
    fixture.detectChanges();

    expect(queryByText('Next staff record')).toBeTruthy();
    expect(queryByText('Previous staff record')).toBeFalsy();
  });

  it('should only show Previous staff record when current staff record is last ID in list', async () => {
    const { fixture, queryByText } = await setup({ id: '4' });
    fixture.detectChanges();

    expect(queryByText('Next staff record')).toBeFalsy();
    expect(queryByText('Previous staff record')).toBeTruthy();
  });

  it('should show a Close this staff record link with refs passed in', async () => {
    const exitUrl = { url: 'funding/test/url', fragment: 'staff-records' };

    const { component, fixture, getByText } = await setup({ exitUrl });

    const closeLink = getByText('Close this staff record');
    const closeLinkAnchorElement: DebugElement = fixture.debugElement.query(By.css('a.govuk-button'));

    expect(closeLinkAnchorElement.attributes['ng-reflect-router-link']).toContain(exitUrl.url);
    expect(closeLinkAnchorElement.attributes['ng-reflect-fragment']).toBe(exitUrl.fragment);
  });
});
