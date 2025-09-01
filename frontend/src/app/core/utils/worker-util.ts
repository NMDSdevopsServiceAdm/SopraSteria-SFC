import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';

export const shouldSeeDHAWorkerQuestion = (workplace: Establishment, worker: Worker): boolean => {
  const workplaceMainServiceCanDoDHA = !!workplace.mainService?.canDoDelegatedHealthcareActivities;
  const workplaceSaidTheyDontDoDHA = workplace.staffDoDelegatedHealthcareActivities === 'No';
  const workerJobRoleCanDoDHA = worker?.mainJob?.canDoDelegatedHealthcareActivities;

  return workplaceMainServiceCanDoDHA && !workplaceSaidTheyDontDoDHA && workerJobRoleCanDoDHA;
};
