import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InviteResponse } from '@core/model/userDetails.model';
import { BackLinkService } from '@core/services/backLink.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { SharedModule } from '@shared/shared.module';
import { BehaviorSubject } from 'rxjs';

import { ChangeUserResearchComponent } from './change-user-research.component';

describe('ChangeUserResearchComponent', () => {
  let component: ChangeUserResearchComponent;
  let fixture: ComponentFixture<ChangeUserResearchComponent>;

  let routerSpy: jasmine.SpyObj<Router>;
  let createAccountServiceMock: any;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: () => null,
        },
      },
    };

    createAccountServiceMock = {
      userResearchInviteResponse$: new BehaviorSubject<InviteResponse>(InviteResponse.Yes),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SharedModule],
      declarations: [ChangeUserResearchComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        {
          provide: BackLinkService,
          useValue: { showBackLink: jasmine.createSpy() },
        },
        { provide: CreateAccountService, useValue: createAccountServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeUserResearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should store response and navigate on submit', () => {
    const nextSpy = spyOn(createAccountServiceMock.userResearchInviteResponse$, 'next');

    component.form.patchValue({
      inviteResponse: InviteResponse.No,
    });

    component.onSubmit();

    expect(nextSpy).toHaveBeenCalledWith(InviteResponse.No);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/account-management']);
  });
});
