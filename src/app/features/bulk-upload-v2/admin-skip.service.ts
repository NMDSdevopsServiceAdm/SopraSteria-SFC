import { Injectable } from '@angular/core';

@Injectable()
export class AdminSkipService {
  skippedWorkplaces: string[] = [];
  private skippedWorkplaceReferences = false;

  get skipWorkplaceReferences(){
    return this.skippedWorkplaceReferences;
  }
  set skipWorkplaceReferences(value){
    this.skippedWorkplaceReferences = value;
  }

  add(workplaceId: string) {
    if (!this.skippedWorkplaces.includes(workplaceId)) this.skippedWorkplaces.push(workplaceId);
  }

  clear() {
    this.skippedWorkplaces = [];
  }
}
