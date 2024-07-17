import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { Observable, of } from 'rxjs';

export const internationalRecruitmentWorkers = () => [
  {
    uid: 'a431',
    name: 'Joy Wood',
    nationality: 'Other',
    britishCitizenship: 'No',
    healthAndCareVisa: 'Yes',
    //healthAndCareVisaValue: 'Yes',
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

export const singleInternationalRecruitmentWorker = () => [
  {
    uid: 'a4314',
    name: 'Trevor Lane',
    nationality: null,
    britishCitizenship: null,
    healthAndCareVisa: null,
  },
];

export const getAllWorkersNationalityAndBritishCitizenshipResponse = {
  workers: internationalRecruitmentWorkers(),
};

export const getSingleWorkerNationalityAndBritishCitizenshipResponse = {
  workers: singleInternationalRecruitmentWorker(),
};

@Injectable({ providedIn: 'root' })
export class MockInternationalRecruitmentService extends InternationalRecruitmentService {
  private _singleWorker: boolean = false;
  private _workerAnswers: any;

  public static factory(singleWorker = false, workerAnswers = {}) {
    return (httpClient: HttpClient) => {
      const service = new MockInternationalRecruitmentService(httpClient);
      service._singleWorker = singleWorker;
      service._workerAnswers = workerAnswers;
      return service;
    };
  }

  getAllWorkersNationalityAndBritishCitizenship(establishmentuid: string): Observable<any> {
    if (this._singleWorker) {
      return of(getSingleWorkerNationalityAndBritishCitizenshipResponse);
    }
    return of(getAllWorkersNationalityAndBritishCitizenshipResponse);
  }

  getInternationalRecruitmentWorkerAnswers() {
    return this._workerAnswers;
  }
}
