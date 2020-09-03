import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { FluJabComponent } from './flu-jab.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

const getFluJabComponent = async () => {
  return render(FluJabComponent, {
    imports: [
      FormsModule,
      ReactiveFormsModule,
      HttpClientTestingModule,
      SharedModule
    ],
    providers: [
      {
        provide: EstablishmentService,
        useClass: MockEstablishmentService
      }
    ],
  });
}

const setup = async (fluJab = null) => {
  const httpTestingController = TestBed.inject(HttpTestingController);
  const req = httpTestingController.expectOne('/api/establishment/98a83eef-e1e1-49f3-89c5-b1287a3cc8dd/fluJab');
  req.flush([{
    "id": 11164,
    "uid": "d96d2681-4653-4709-8dda-88b695c177ea",
    "name": "Joe Bloggs",
    "fluJab": fluJab
  }]);
}

describe('FluJabComponent', () => {
  afterEach(() => {
    const httpTestingController = TestBed.inject(HttpTestingController);
    httpTestingController.verify();
  });

  it('should show each workplace worker flu jab', async () => {
    const { fixture, getByText } = await getFluJabComponent();

    await setup();

    fixture.detectChanges();

    expect(getByText('Joe Bloggs'));
  })

  it('should not select any option when worker flu jab not set', async () => {
    const { fixture } = await getFluJabComponent();

    await setup();

    fixture.detectChanges();

    const yes = fixture.nativeElement.querySelector('input[id="fluJab-0-0"]');
    const no = fixture.nativeElement.querySelector('input[id="fluJab-0-1"]');
    const dontKnow = fixture.nativeElement.querySelector('input[id="fluJab-0-2"]');

    expect(yes.checked).toBeFalsy();
    expect(no.checked).toBeFalsy();
    expect(dontKnow.checked).toBeFalsy();
  })

  it('should select "Yes" when worker has flu jab', async () => {
    const { fixture } = await getFluJabComponent();

    await setup('Yes');

    fixture.detectChanges();

    const yes = fixture.nativeElement.querySelector('input[id="fluJab-0-0"]');
    const no = fixture.nativeElement.querySelector('input[id="fluJab-0-1"]');
    const dontKnow = fixture.nativeElement.querySelector('input[id="fluJab-0-2"]');

    expect(yes.checked).toBeTruthy();
    expect(no.checked).toBeFalsy();
    expect(dontKnow.checked).toBeFalsy();
  })

  it('should select "No" when worker does not have flu jab', async () => {
    const { fixture } = await getFluJabComponent();

    await setup('No');

    fixture.detectChanges();

    const yes = fixture.nativeElement.querySelector('input[id="fluJab-0-0"]');
    const no = fixture.nativeElement.querySelector('input[id="fluJab-0-1"]');
    const dontKnow = fixture.nativeElement.querySelector('input[id="fluJab-0-2"]');

    expect(yes.checked).toBeFalsy();
    expect(no.checked).toBeTruthy();
    expect(dontKnow.checked).toBeFalsy();
  })

  it('should select "Don\'t know" when worker does not know flu jab', async () => {
    const { fixture } = await getFluJabComponent();

    await setup('Don\'t know');

    fixture.detectChanges();

    const yes = fixture.nativeElement.querySelector('input[id="fluJab-0-0"]');
    const no = fixture.nativeElement.querySelector('input[id="fluJab-0-1"]');
    const dontKnow = fixture.nativeElement.querySelector('input[id="fluJab-0-2"]');

    expect(yes.checked).toBeFalsy();
    expect(no.checked).toBeFalsy();
    expect(dontKnow.checked).toBeTruthy();
  })
});
