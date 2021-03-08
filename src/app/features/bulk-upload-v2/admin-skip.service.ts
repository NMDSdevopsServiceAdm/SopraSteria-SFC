import { Injectable } from '@angular/core';

@Injectable()
export class AdminSkipService {
  skippedWorkplaces: string[] = [];

  add(workplaceId: string) {
    if (!this.skippedWorkplaces.includes(workplaceId)) this.skippedWorkplaces.push(workplaceId);
  }

  clear() {
    this.skippedWorkplaces = [];
  }
}
