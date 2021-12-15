import { Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrainingStatusService {
  readonly MISSING = 2;
  readonly EXPIRED = 3;
  readonly EXPIRING = 1;
  readonly ACTIVE = 0;

  public expiresSoonAlertDate$: BehaviorSubject<string> = new BehaviorSubject(null);

  public getAggregatedStatus(trainingRecords) {
    let expired = false;
    let expiring = false;
    let missing = false;
    let trainingStatus = 0;

    trainingRecords.forEach((training) => {
      trainingStatus = this.getTrainingStatus(training.expires, training.missing);
      switch (trainingStatus) {
        case this.MISSING: {
          missing = true;
          break;
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
    } else if (missing) {
      return this.MISSING;
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
      const expiringDate = dayjs(expires);
      const currentDate = dayjs();
      const daysDifference = expiringDate.diff(currentDate, 'days');
      if (daysDifference < 0) {
        return this.EXPIRED;
      } else if (daysDifference >= 0 && daysDifference <= parseInt(this.expiresSoonAlertDate$.value)) {
        return this.EXPIRING;
      }
    }
    return this.ACTIVE;
  }

  public trainingStatusForRecord(trainingRecord) {
    return this.getTrainingStatus(trainingRecord.expires, trainingRecord.missing);
  }

  public trainingStatusCount(training, status) {
    return training.filter((trainingRecord) => {
      return this.trainingStatusForRecord(trainingRecord) === status;
    }).length;
  }
}
