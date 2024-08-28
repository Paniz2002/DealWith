import { Component } from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import {filter} from "rxjs";
import {AuctionListComponent} from "./components/auction-list/auction-list.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Deal With';
  isCustomLayout: boolean = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkCustomLayout(this.activatedRoute);
    });
  }

  checkCustomLayout(route: ActivatedRoute) {
    let child = route.firstChild;
    while (child) {
      if (child.component && child.component === AuctionListComponent) {  // Sostituisci con il tuo componente
        this.isCustomLayout = true;
        return;
      }
      child = child.firstChild;
    }
    this.isCustomLayout = false;
  }
}
