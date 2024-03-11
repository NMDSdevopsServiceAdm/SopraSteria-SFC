import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ParentSubsidiaryViewService } from './parent-subsidiary-view.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { URLStructure } from '@core/model/url.model';

const exitSubsidiaryViewPages = [
  'login',
  'satisfaction-survey',
]

@Injectable()
export class SubsidiaryRouterService extends Router {

  constructor(
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private establishmentService: EstablishmentService,
  ) {
    super()
  }

  // any navigation to ... should clear the parentViewingSubAsParent flag
  // ref header.component
  // '/'
  // '/registration'
  // '/login'
  // etc...
  navigate(commands: any[], extras?: any): Promise<boolean> {
    console.log('SubsidiaryRouterService.navigate', commands, extras);

    if (exitSubsidiaryViewPages.some(command => commands[0].includes(command))) {
        this.parentSubsidiaryViewService.clearViewingSubAsParent();
    }

    // if viewingSubsidaryAsParent, then all routes should be prefixed with 'subsidiary'
    if (this.parentSubsidiaryViewService.getViewingSubAsParent() && (!commands[0].includes('subsidiary'))) {
      // If routing to the dashboard, override fragments
      if(commands[0].toLowerCase().includes('dashboard') && extras?.fragment) {
        commands = [extras.fragment, this.parentSubsidiaryViewService.getSubsidiaryUid()];
        extras = undefined;
    } else {
      // Remove forward slashes from the route
      for(let i = 0; i < commands.length; i++) {
        const splitString = commands[i].split('/').filter((command) => command.length > 0);
        Array.prototype.splice.apply(commands, [i, 1].concat(splitString));
      }
    }
      commands.unshift('subsidiary');
      console.log('SubsidiaryRouterService navigate modified: ', commands, extras);
    }

    return super.navigate(commands, extras);
  }
}