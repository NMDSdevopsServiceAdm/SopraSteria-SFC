import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Worker } from '@core/model/worker.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface internationalRecruitmentWorkersResponse {
  id: number;
  uid: string;
  name: string;
  nationality: string;
  britishCitizenship: string;
  healthAndCareVisaValue: string;
}

@Injectable()
export class InternationalRecruitmentService {
  constructor(private http: HttpClient) {}

  private _employedFromOutsideUkMappings = {
    Yes: {
      databaseValue: 'Yes',
      questionValues: {
        tag: 'Outside the UK',
        value: 'Yes',
      },
      staffRecordValue: 'From outside the UK',
    },
    No: {
      databaseValue: 'No',
      questionValues: {
        tag: 'Inside the UK',
        value: 'No',
      },
      staffRecordValue: 'From inside the UK',
    },
    "Don't know": {
      databaseValue: "Don't know",
      questionValues: {
        tag: 'I do not know',
        value: "Don't know",
      },
      staffRecordValue: 'Not known',
    },
  };

  private _employedFromOutsideUkAnswers = [
    this._employedFromOutsideUkMappings['Yes'].questionValues,
    this._employedFromOutsideUkMappings['No'].questionValues,
    this._employedFromOutsideUkMappings[`Don't know`].questionValues,
  ];

  public getEmployedFromOutsideUkAnswers() {
    return this._employedFromOutsideUkAnswers;
  }

  public getEmployedFromOutsideUkStaffRecordValue(employedFromOutsideUkDbValue) {
    return this._employedFromOutsideUkMappings[employedFromOutsideUkDbValue]?.staffRecordValue || null;
  }

  public shouldSeeInternationalRecruitmentQuestions(worker: Worker) {
    return (
      this._isWorkerFromOtherNationWithUnknownCitizenship(worker) ||
      this._isWorkerWithoutBritishCitizenshipAndUnknownNationality(worker)
    );
  }

  private _isWorkerFromOtherNationWithUnknownCitizenship(worker) {
    return worker.nationality?.value === 'Other' && ['No', "Don't know", null].includes(worker.britishCitizenship);
  }

  private _isWorkerWithoutBritishCitizenshipAndUnknownNationality(worker) {
    return worker.nationality?.value === "Don't know" && worker.britishCitizenship === 'No';
  }

  public getAllWorkersNationalityAndBritishCitizenship(establishmentuid): Observable<any> {
    return this.http
      .get<any>(`${environment.appRunnerEndpoint}/api/establishment/${establishmentuid}/internationalRecruitment`)
      .pipe(map((data) => data));
  }
}
