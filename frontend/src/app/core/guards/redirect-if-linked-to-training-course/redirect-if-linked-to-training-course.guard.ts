import { inject } from '@angular/core';
import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';
import { TrainingRecord } from '@core/model/training.model';
import { WorkerService } from '@core/services/worker.service';

export const redirectIfLinkedToTrainingCourse: CanActivateFn = async (route) => {
  const { establishmentuid, id: workerUid, trainingRecordId: trainingRecordUid } = route.params ?? {};

  const routeForTrainingRecordWithCourse = route?.data?.routeForTrainingRecordWithCourse;

  if (!routeForTrainingRecordWithCourse) {
    return true;
  }

  const workerService = inject(WorkerService);
  const trainingRecord: TrainingRecord = await workerService
    .getTrainingRecord(establishmentuid, workerUid, trainingRecordUid)
    .toPromise();

  if (trainingRecord && trainingRecord.isMatchedToTrainingCourse) {
    return createUrlTreeFromSnapshot(route, routeForTrainingRecordWithCourse);
  }

  return true;
};
