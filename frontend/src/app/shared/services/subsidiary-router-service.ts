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
    if (this.parentSubsidiaryViewService.getViewingSubAsParent() && (!commands[0].includes('subsidiary'))) {
      commands.splice(0, 1, commands[0].replace('/', ''));
      if(extras?.fragment) {
        commands = [extras.fragment, this.parentSubsidiaryViewService.getSubsidiaryUid()];
        extras = undefined;
      }
      commands.unshift('subsidiary');
    }
    return super.navigate(commands, extras);
  }
}