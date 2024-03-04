import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class SubsidiaryRouterService extends Router {
  constructor() {
    super()
  }

  navigate(commands: any[], extras?: any): Promise<boolean> {
    const modifiedCommands = commands.map(command => {
      console.log("SubsidiaryRouterService.navigate: ", command, extras); // TODO
      if (typeof command === 'string' && command.startsWith('workplace')) {
        return `subsidiary/${command}`;
      }
      return command;
    });
    return super.navigate(modifiedCommands, extras);
  }
}