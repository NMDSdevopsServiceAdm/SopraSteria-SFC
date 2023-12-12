import { Injectable } from '@angular/core';
import { QualificationLevel } from '@core/model/qualification.model';
import { QualificationService } from '@core/services/qualification.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockQualificationService extends QualificationService {
  public getQualifications(): Observable<QualificationLevel[]> {
    return of([
      { id: 1, level: 'Entry level' },
      { id: 2, level: 'Level 1' },
      { id: 3, level: 'Level 2' },
      { id: 4, level: 'Level 3' },
      { id: 5, level: 'Level 4' },
      { id: 6, level: 'Level 5' },
      { id: 7, level: 'Level 6' },
      { id: 8, level: 'Level 7' },
      { id: 9, level: 'Level 8 or above' },
      { id: 10, level: `Don't know` },
    ]);
  }
}
