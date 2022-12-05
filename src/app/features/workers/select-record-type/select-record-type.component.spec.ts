import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { Observable } from 'rxjs';

import { WorkersModule } from '../workers.module';
import { SelectRecordTypeComponent } from './select-record-type.component';

describe('SelectRecordTypeComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText } = await render(SelectRecordTypeComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
      providers: [
        BackService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: Observable.from([{ establishmentuid: 'establishmentUid', id: 1 }]),
          },
        },
      ],
    });

    const component = fixture.componentInstance;

    const router = TestBed.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      routerSpy,
      getByText,
      getAllByText,
    };
  }

  it('should render a SelectRecordTypeComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('error messages', () => {
    it('should display an error message if no record type is selected and Continue is pressed', async () => {
      const { fixture, getByText, getAllByText } = await setup();

      fireEvent.click(getByText('Continue'));
      fixture.detectChanges();
      expect(getAllByText('Select the type of record').length).toEqual(2);
    });
  });
});
