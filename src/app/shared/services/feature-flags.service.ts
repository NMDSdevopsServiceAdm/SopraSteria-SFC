import { Injectable } from '@angular/core';
import * as configcat from 'configcat-js';
import { IConfigCatClient } from 'configcat-common/lib/ConfigCatClient';
import { LogLevel } from 'configcat-common';
import { environment } from '../../../environments/environment';


export class FeatureFlagsService {
  public configCatClient: IConfigCatClient;
  public logger = configcat.createConsoleLogger(LogLevel.Info);

  constructor(
  ) {}

  start(){
    this.configCatClient = configcat.createClientWithAutoPoll(environment.configCatKey,
      {
        pollIntervalSeconds: 2,
        logger: this.logger
      });
  }

}
