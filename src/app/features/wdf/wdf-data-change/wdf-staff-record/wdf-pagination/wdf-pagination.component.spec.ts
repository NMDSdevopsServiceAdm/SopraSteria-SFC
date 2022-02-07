import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WdfPaginationComponent } from '@features/wdf/wdf-data-change/wdf-staff-record/wdf-pagination/wdf-pagination.component';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { Observable, Subject } from 'rxjs';

describe('WdfPagination', () => {
  const setup = async (id = '123') => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(WdfPaginationComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: Observable.from([{ id: id }]),
            snapshot: {
              paramMap: {
                get(id) {
                  return '123';
                },
              },
            },
          },
        },
      ],
      componentProperties: {
        workerList: ['1', '2', '3', '4'],
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
    const { component, fixture } = await setup('2');
    const links = fixture.debugElement.queryAll(By.css('a'));
    const previousHref = links[0].nativeElement.getAttribute('ng-reflect-router-link');
    const nextHref = links[1].nativeElement.getAttribute('ng-reflect-router-link');
    fixture.detectChanges();

    expect(component.previousID).toEqual('1');
    expect(component.nextID).toEqual('3');
    expect(previousHref).toEqual('../1');
    expect(nextHref).toEqual('../3');
  });
  it('should only show Next staff record', async () => {
    const { fixture, queryByText } = await setup('1');
    fixture.detectChanges();

    expect(queryByText('Next staff record')).toBeTruthy();
    expect(queryByText('Previous staff record')).toBeFalsy();
  });
  it('should only show Previous staff record', async () => {
    const { fixture, queryByText } = await setup('4');
    fixture.detectChanges();

    expect(queryByText('Next staff record')).toBeFalsy();
    expect(queryByText('Previous staff record')).toBeTruthy();
  });
});
