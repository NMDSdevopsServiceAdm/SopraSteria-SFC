import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { render } from '@testing-library/angular';
import { Router } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { MockUserService } from '@core/test-utils/MockUserService';

describe('HeaderComponent', () => {

  async function setup() {
    const component =  await render(HeaderComponent, {
      imports: [
        RouterTestingModule,
        HttpClientTestingModule],
      declarations: [HeaderComponent]
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    return {
      component,
      router
    };
  }

  it('should render a HeaderComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
