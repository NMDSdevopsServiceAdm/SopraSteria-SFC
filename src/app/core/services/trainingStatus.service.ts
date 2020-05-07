import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class TrainingStatusService {
  readonly MISSING = 2;
  readonly EXPIRED = 3;
  readonly EXPIRING = 1;
  readonly ACTIVE = 0;


  public getAggregatedStatus(trainingRecords) {
    let expired = false;
    let expiring = false;
    let trainingStatus = 0;

    trainingRecords.forEach(training => {
      trainingStatus = this.getTrainingStatus(training.expires, training.missing);
      switch (trainingStatus) {
        case this.MISSING: {
          return this.MISSING;
        }
        case this.EXPIRING: {
          expiring = true;
          break;
        }
        case this.EXPIRED: {
          expired = true;
          break;
        }
      }
    });
    if (expired) {
      return this.EXPIRED;
    } else if (expiring) {
      return this.EXPIRING;
    } else {
      return this.ACTIVE;
    }
  }

  public getTrainingStatus(expires, missing) {
    if (missing) {
      return this.MISSING;
    } else if (expires) {
      const expiringDate = moment(expires);
      const currentDate = moment();
      const daysDifference = expiringDate.diff(currentDate, 'days');
      if (daysDifference < 0) {
        return this.EXPIRED;
      } else if (daysDifference >= 0 && daysDifference <= 90) {
        return this.EXPIRING;
      } else {
        return this.ACTIVE;
      }
    }
  }
}
