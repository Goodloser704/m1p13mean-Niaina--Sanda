import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FormsModule } from "@angular/forms";
import AOS from 'aos';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  constructor(private router: Router) {}
  
  ngAfterViewInit(): void {
    AOS.init({ once: true });

    this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      AOS.refresh();
    }
  });
  }
}
