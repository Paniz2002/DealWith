import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierHomepageComponent } from './cashier-homepage.component';

describe('CashierHomepageComponent', () => {
  let component: CashierHomepageComponent;
  let fixture: ComponentFixture<CashierHomepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashierHomepageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CashierHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
