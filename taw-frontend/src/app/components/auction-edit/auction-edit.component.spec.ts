import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionEditComponent } from './auction-edit.component';

describe('AuctionEditComponent', () => {
  let component: AuctionEditComponent;
  let fixture: ComponentFixture<AuctionEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuctionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
