import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatUnavailableComponent } from './chat-unavailable.component';

describe('ChatUnavailableComponent', () => {
  let component: ChatUnavailableComponent;
  let fixture: ComponentFixture<ChatUnavailableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatUnavailableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatUnavailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
