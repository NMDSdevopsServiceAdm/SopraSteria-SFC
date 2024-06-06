import { Injectable } from '@angular/core';
import { Worker } from '@core/model/worker.model';

@Injectable()
export class InternationalRecruitmentService {
  constructor() {}

  public convertEmployedFromOutsideUkValue(worker: Worker) {
    return worker.employedFromOutsideUk === 'Yes'
      ? 'Outside the UK'
      : worker.employedFromOutsideUk === 'No'
      ? 'Inside the UK'
      : worker.employedFromOutsideUk === "Don't know"
      ? 'Not known'
      : null;
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
}
