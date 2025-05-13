import { Injectable } from '@angular/core';
import { CareWorkforcePathwayCategory } from '@core/model/careWorkforcePathwayCategory.model';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { build, fake, sequence } from '@jackfranklin/test-data-bot';
import { Observable, of } from 'rxjs';

const careWorkforcePathwayCategoryBuilder = build('careWorkforcePathwayCategory', {
  fields: {
    id: sequence(),
    title: fake((f) => f.lorem.sentence()),
    description: fake((f) => f.lorem.sentence()),
  },
});

@Injectable()
export class MockCareWorkforcePathwayService extends CareWorkforcePathwayService {
  getCareWorkforcePathwayCategories(): CareWorkforcePathwayCategory[] {
    return [
      { id: 1, title: 'New to Care', description: 'Starting point' },
      { id: 2, title: 'Care worker', description: 'Established' },
    ];

    //  return of ([
    //   careWorkforcePathwayCategoryBuilder
    // ])
  }
}
