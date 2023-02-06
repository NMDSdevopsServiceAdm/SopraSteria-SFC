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

  public getTrainingStatus(expires, missing) {
    if (missing) {
      return this.MISSING;
    } else if (expires) {
      const daysDifference = this.getDaysDifference(expires);
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

  public getDaysDifference(expires: Date) {
    const expiringDate = dayjs(expires);
    const currentDate = dayjs();
    return expiringDate.diff(currentDate, 'days');
  }
}
