import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FormsModule } from "@angular/forms";
import AOS from 'aos';
import { LoaderService } from './core/services/loader.service';
import { Loader } from "./components/shared/loader/loader";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  loaderService = inject(LoaderService);

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
