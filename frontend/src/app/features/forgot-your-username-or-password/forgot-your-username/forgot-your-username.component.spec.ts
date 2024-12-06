import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ForgotYourUsernameComponent } from './forgot-your-username.component';

fdescribe('ForgotYourUsernameComponent', () => {
  const setup = async () => {
    const setupTools = await render(ForgotYourUsernameComponent, {
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, RouterTestingModule, SharedModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
          },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return { ...setupTools, component, routerSpy };
  };

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show a page heading', async () => {
    const { getByRole } = await setup();

    expect(getByRole('heading', { name: 'Forgot username' })).toBeTruthy();
  });
});
