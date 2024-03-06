import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ParentSubsidiaryViewService } from './parent-subsidiary-view.service';

@Injectable()
export class SubsidiaryRouterService extends Router {
  constructor(
    private parentSubsidiaryViewService: ParentSubsidiaryViewService
  ) {
    super()
  }

  navigate(commands: any[], extras?: any): Promise<boolean> {
    if (this.parentSubsidiaryViewService.getViewingSubAsParent()) {
      if(!commands[0].includes('subsidiary')) {
        commands.unshift('subsidiary');
      }
    }
    return super.navigate(commands, extras);
  }
}