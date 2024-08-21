import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionDetailsCountdownComponent } from './auction-details-countdown.component';

describe('AuctionDetailsCountdownComponent', () => {
  let component: AuctionDetailsCountdownComponent;
  let fixture: ComponentFixture<AuctionDetailsCountdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionDetailsCountdownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuctionDetailsCountdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
