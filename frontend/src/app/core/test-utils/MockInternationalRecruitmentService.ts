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

export const getAllWorkersNationalityAndBritishCitizenshipResponse = {
  workers: internationalRecruitmentWorkers,
};

@Injectable({ providedIn: 'root' })
export class MockInternationalRecruitmentService extends InternationalRecruitmentService {
  public static factory() {
    return (httpClient: HttpClient) => {
      const service = new MockInternationalRecruitmentService(httpClient);
      return service;
    };
  }

  getAllWorkersNationalityAndBritishCitizenship(establishmentuid: string): Observable<any> {
    return of(getAllWorkersNationalityAndBritishCitizenshipResponse);
  }
}
