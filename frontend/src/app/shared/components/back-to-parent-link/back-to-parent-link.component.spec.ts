import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { BackToParentComponent } from './back-to-parent-link.component';

describe('BackToParentLinkComponent', () => {
  const setup = async () => {
    const establishment = establishmentBuilder() as Establishment;

    const { fixture, getByText } = await render(BackToParentComponent, {
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule],
      providers: [WindowRef],
      componentProperties: {
        parentWorkplace: establishment,
      },
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.callThrough();

    const parentSubsidiaryViewService = injector.inject(ParentSubsidiaryViewService) as ParentSubsidiaryViewService;
    const parentSubsidiaryViewServiceSpy = spyOn(
      parentSubsidiaryViewService,
      'clearViewingSubAsParent',
    ).and.callThrough();

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;

    return {
      component,
      fixture,
      getByText,
      routerSpy,
      parentSubsidiaryViewServiceSpy,
      establishmentService,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display Back to parent name', async () => {
    const { component, getByText } = await setup();

    const expectedMessage = `Back to ${component.parentWorkplace.name}`;
    expect(getByText(expectedMessage)).toBeTruthy();
  });

  it('should clear viewing as sub on click of Back to parent name', async () => {
    const { component, getByText, parentSubsidiaryViewServiceSpy } = await setup();

    const backToParentLink = getByText(`Back to ${component.parentWorkplace.name}`);

    fireEvent.click(backToParentLink);
    expect(parentSubsidiaryViewServiceSpy).toHaveBeenCalled();
  });

  it('should set parent as workplace and primaryWorkplace in establishment service on click of Back to parent name', async () => {
    const { component, getByText, establishmentService } = await setup();

    const setWorkplaceSpy = spyOn(establishmentService, 'setWorkplace');
    const setPrimaryWorkplaceSpy = spyOn(establishmentService, 'setPrimaryWorkplace');

    const backToParentLink = getByText(`Back to ${component.parentWorkplace.name}`);

    fireEvent.click(backToParentLink);
    expect(setWorkplaceSpy).toHaveBeenCalledWith(component.parentWorkplace);
    expect(setPrimaryWorkplaceSpy).toHaveBeenCalledWith(component.parentWorkplace);
  });
});
