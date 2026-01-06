import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RedirectCommand } from '@angular/router';
import { TrainingCourse } from '@core/model/training-course.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

export enum TrainingCoursesToLoad {
  ALL = 'ALL',
  BY_CATEGORY_ID_OF_TRAINING_RECORD = 'BY_CATEGORY_ID_OF_TRAINING_RECORD',
  BY_CATEGORY_ID_OF_QUERY_PARAM = 'BY_CATEGORY_ID_OF_QUERY_PARAM',
}

@Injectable({
  providedIn: 'root',
})
export class TrainingCourseResolver {
  constructor(
    private trainingCourseService: TrainingCourseService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
  ) {}

  async resolve(routeSnapshot: ActivatedRouteSnapshot): Promise<TrainingCourse[] | RedirectCommand> {
    const workplaceUid = routeSnapshot.paramMap.get('establishmentuid') || this.establishmentService.establishmentId;
    const categoryId = routeSnapshot?.parent?.data?.trainingRecord?.trainingCategory?.id;

    const canViewWorker = this.permissionsService.can(workplaceUid, 'canViewWorker');

    if (!canViewWorker) {
      return [];
    }

    const backendCall = categoryId
      ? this.trainingCourseService.getTrainingCoursesByCategory(workplaceUid, categoryId)
      : this.trainingCourseService.getAllTrainingCourses(workplaceUid);

    const trainingCourses = await backendCall.toPromise();

    const redirectWhenNoCourses = routeSnapshot.data?.redirectWhenNoCourses;
    if (!redirectWhenNoCourses) {
      return trainingCourses;
    }

    return this.handleRedirect(routeSnapshot, trainingCourses);
  }

  async handleRedirect(
    routeSnapshot: ActivatedRouteSnapshot,
    trainingCourses: TrainingCourse[],
  ): Promise<TrainingCourse[] | RedirectCommand> {
    const categoryIdFromQueryParem = routeSnapshot.queryParams?.trainingCategory?.id;
    if (categoryIdFromQueryParem) {
      trainingCourses = trainingCourses.filter((course) => course.id === categoryIdFromQueryParem);
    }

    const noTrainingCoursesFound = trainingCourses?.length === 0;

    if (noTrainingCoursesFound) {
      const redirectWhenNoCourses = routeSnapshot.data?.redirectWhenNoCourses;

      if (redirectWhenNoCourses) {
        return new RedirectCommand(redirectWhenNoCourses);
      }

      return [];
    }

    return trainingCourses;
  }
}
