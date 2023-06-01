import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { ComparisonGroupHeaderComponent } from '@shared/components/benchmarks-tab/comparison-group-header/comparison-group-header.component';

describe('ComparisonGroupHeaderComponent', () => {
  let component: ComparisonGroupHeaderComponent;
  let fixture: ComponentFixture<ComparisonGroupHeaderComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule, HttpClientTestingModule],
        declarations: [],
        providers: [],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ComparisonGroupHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.meta = { workplaces: 1, staff: 1, localAuthority: 'Test LA' };
    expect(component).toBeTruthy();
  });

  describe('can view full benchmarks content', () => {
    it('should have the right text with only one workplace', async () => {
      component.canViewFullContent = true;
      component.meta = { workplaces: 1, staff: 1, localAuthority: 'Test LA' };
      fixture.detectChanges();
      const componenttext = fixture.debugElement.query(By.css('p')).nativeElement;
      expect(componenttext.innerHTML).toContain(
        `<b>Your comparison group</b> is 1 staff from 1 workplace using ASC-WDS and providing the same main service as you in your local authority.`,
      );
    });

    it('should have the right text with correct comma placement', async () => {
      component.canViewFullContent = true;
      component.meta = { workplaces: 1000, staff: 1000, localAuthority: 'Test LA' };
      fixture.detectChanges();
      const componenttext = fixture.debugElement.query(By.css('p')).nativeElement;
      expect(componenttext.innerHTML).toContain(
        `<b>Your comparison group</b> is 1,000 staff from 1,000 workplaces using ASC-WDS and providing the same main service as you in your local authority.`,
      );
    });

    it('should have the last updated date if date supplied', () => {
      component.canViewFullContent = true;
      component.meta = {
        workplaces: 1000,
        staff: 1000,
        lastUpdated: new Date('2020-11-10T13:20:29.304Z'),
        localAuthority: 'Test LA',
      };
      fixture.detectChanges();
      const componenttext = fixture.debugElement.query(By.css('p')).nativeElement;
      expect(componenttext.innerHTML).toContain(`The comparison group data was last updated 10 November 2020`);
    });
    it('should not have the last updated date if date not supplied', () => {
      component.canViewFullContent = true;
      component.meta = { workplaces: 1000, staff: 1000, localAuthority: 'Test LA' };
      fixture.detectChanges();
      const componenttext = fixture.debugElement.query(By.css('p')).nativeElement;
      expect(componenttext.innerHTML).not.toContain(`The comparison group data was last updated`);
    });
  });

  describe('cannot view full benchmarks content', () => {
    it('should have the right text with only one workplace', async () => {
      component.meta = { workplaces: 1, staff: 1, localAuthority: 'Test LA' };
      fixture.detectChanges();
      const componenttext = fixture.debugElement.query(By.css('p')).nativeElement;
      expect(componenttext.innerHTML).toContain(
        `<b>Your comparison group</b> is 1 staff from 1 workplace using ASC-WDS and providing adult social care in your local authority.`,
      );
    });

    it('should have the right text with correct comma placement', async () => {
      component.meta = { workplaces: 1000, staff: 1000, localAuthority: 'Test LA' };
      fixture.detectChanges();
      const componenttext = fixture.debugElement.query(By.css('p')).nativeElement;
      expect(componenttext.innerHTML).toContain(
        `<b>Your comparison group</b> is 1,000 staff from 1,000 workplaces using ASC-WDS and providing adult social care in your local authority.`,
      );
    });

    it('should have the last updated date if date supplied', () => {
      component.meta = {
        workplaces: 1000,
        staff: 1000,
        lastUpdated: new Date('2020-11-10T13:20:29.304Z'),
        localAuthority: 'Test LA',
      };
      fixture.detectChanges();
      const componenttext = fixture.debugElement.query(By.css('p')).nativeElement;
      expect(componenttext.innerHTML).toContain(`The comparison group data was last updated 10 November 2020`);
    });
    it('should not have the last updated date if date not supplied', () => {
      component.meta = { workplaces: 1000, staff: 1000, localAuthority: 'Test LA' };
      fixture.detectChanges();
      const componenttext = fixture.debugElement.query(By.css('p')).nativeElement;
      expect(componenttext.innerHTML).not.toContain(`The comparison group data was last updated`);
    });
  });

  describe('no comparison group', () => {
    it('should have the right text with no data', async () => {
      fixture.detectChanges();
      const componenttext = fixture.debugElement.query(By.css('p')).nativeElement;
      expect(componenttext.innerHTML).toContain(
        `<b>Your comparison group</b> information is not available at the moment.`,
      );
    });
  });
});
