import {Component, Input} from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-chat-unavailable',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './chat-unavailable.component.html',
  styleUrl: './chat-unavailable.component.css'
})
export class ChatUnavailableComponent {
  @Input() isPrivate!: boolean;
}
