import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Worker, WorkersResponse } from '@core/model/worker.model';
import {
  InternationalRecruitmentService,
  internationalRecruitmentWorkersResponse,
} from '@core/services/international-recruitment.service';
import { Observable, of } from 'rxjs';

const internationalRecruitmentWorkers = [
  {
    uid: 'a431',
    name: 'Joy Wood',
    nationality: 'Other',
    britishCitizenship: 'No',
    healthAndCareVisaValue: 'Yes',
  },
  {
    uid: 'a432',
    name: 'Mike Green',
    nationality: 'Other',
    britishCitizenship: 'No',
    healthAndCareVisa: 'Yes',
  },
  {
    uid: 'a4313',
    name: 'Sandy Day',
    nationality: 'Other',
    britishCitizenship: "Don't know",
    healthAndCareVisa: null,
  },
  {
    uid: 'a4314',
    name: 'Trevor Lane',
    nationality: null,
    britishCitizenship: null,
    healthAndCareVisa: null,
  },
];

const singleInternationalRecruitmentWorker = [
  {
    uid: 'a4314',
    name: 'Trevor Lane',
    nationality: null,
    britishCitizenship: null,
    healthAndCareVisa: null,
  },
];

export const getAllWorkersNationalityAndBritishCitizenshipResponse = {
  workers: internationalRecruitmentWorkers,
};

export const getSingleWorkerNationalityAndBritishCitizenshipResponse = {
  workers: singleInternationalRecruitmentWorker,
};

@Injectable({ providedIn: 'root' })
export class MockInternationalRecruitmentService extends InternationalRecruitmentService {
  private _singleWorker: boolean = false;

  public static factory(singleWorker = false) {
    return (httpClient: HttpClient) => {
      const service = new MockInternationalRecruitmentService(httpClient);
      service._singleWorker = singleWorker;
      return service;
    };
  }

  getAllWorkersNationalityAndBritishCitizenship(establishmentuid: string): Observable<any> {
    if (this._singleWorker) {
      return of(getSingleWorkerNationalityAndBritishCitizenshipResponse);
    }
    return of(getAllWorkersNationalityAndBritishCitizenshipResponse);
  }
}
