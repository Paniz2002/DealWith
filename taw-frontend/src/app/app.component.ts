import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { environments } from '../environments/environments';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'taw-frontend';
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: any) {
    fetch(environments.BACKEND_URL + '/api/auth/logout').then(() => {
      localStorage.clear();
    });
  }
}
