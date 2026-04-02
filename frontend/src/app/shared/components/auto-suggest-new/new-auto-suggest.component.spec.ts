import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAutoSuggestComponent } from './new-auto-suggest.component';

describe('NewAutoSuggestComponent', () => {
  let component: NewAutoSuggestComponent;
  let fixture: ComponentFixture<NewAutoSuggestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAutoSuggestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAutoSuggestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
