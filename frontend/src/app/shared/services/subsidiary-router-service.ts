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
    console.log('SubsidiaryRouterService.navigate', commands, extras);
    if (this.parentSubsidiaryViewService.getViewingSubAsParent() && (!commands[0].includes('subsidiary'))) {
      commands.splice(0, 1, commands[0].replace('/', ''));
      if(commands[0].toLowerCase() === 'dashboard' && extras?.fragment) {
        commands = [extras.fragment, this.parentSubsidiaryViewService.getSubsidiaryUid()];
        extras = undefined;
      }
      commands.unshift('subsidiary');
      console.log('SubsidiaryRouterService navigate modified: ', commands, extras);
    }
    return super.navigate(commands, extras);
  }
}