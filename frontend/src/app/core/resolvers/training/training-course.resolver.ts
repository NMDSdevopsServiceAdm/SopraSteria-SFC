import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot, RedirectCommand } from '@angular/router';
import { TrainingCourse } from '@core/model/training-course.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

export enum TrainingCoursesToLoad {
  ALL = 'ALL',
  BY_TRAINING_RECORD_CATEGORY_ID = 'BY_TRAINING_RECORD_CATEGORY_ID',
  BY_QUERY_PARAM = 'BY_QUERY_PARAM',
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
    const categoryId = this.getCategoryId(routeSnapshot);

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

  private getCategoryId(routeSnapshot: ActivatedRouteSnapshot): number {
    const whichCoursesToGet = routeSnapshot?.data?.trainingCoursesToLoad;

    switch (whichCoursesToGet) {
      case TrainingCoursesToLoad.ALL:
        return null;
      case TrainingCoursesToLoad.BY_TRAINING_RECORD_CATEGORY_ID:
        return routeSnapshot?.parent?.data?.trainingRecord?.trainingCategory?.id;
      case TrainingCoursesToLoad.BY_QUERY_PARAM:
        const trainingCategoryJSON: string = routeSnapshot.queryParams?.trainingCategory;

        return trainingCategoryJSON ? JSON.parse(trainingCategoryJSON)?.id : null;
      default:
        return null;
    }
  }

  private handleRedirect(
    routeSnapshot: ActivatedRouteSnapshot,
    trainingCourses: TrainingCourse[],
  ): TrainingCourse[] | RedirectCommand {
    const noTrainingCoursesFound = trainingCourses?.length === 0;

    if (noTrainingCoursesFound && routeSnapshot.data?.redirectWhenNoCourses) {
      const destinationUrl = createUrlTreeFromSnapshot(
        routeSnapshot,
        routeSnapshot.data.redirectWhenNoCourses,
        routeSnapshot.queryParams,
      );
      return new RedirectCommand(destinationUrl);
    }

    return trainingCourses ?? [];
  }
}
