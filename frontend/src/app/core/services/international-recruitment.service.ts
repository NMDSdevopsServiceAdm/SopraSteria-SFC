import { Injectable } from '@angular/core';
import { Worker } from '@core/model/worker.model';

@Injectable()
export class InternationalRecruitmentService {
  constructor() {}

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
    null: {
      staffRecordValue: null,
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
    return this._employedFromOutsideUkMappings[employedFromOutsideUkDbValue]?.staffRecordValue;
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
