import { Injectable } from '@angular/core';

import { MockWorkerService } from './MockWorkerService';

@Injectable()
export class MockWorkerServiceWithWorker extends MockWorkerService {
  get worker() {
    return {
      uid: '2',
    };
  }
}
