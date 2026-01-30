import { Component, OnInit, signal } from '@angular/core';
import { environment, title } from '../../../environments/environment';
import { LoginModal } from "../../components/login-modal/login-modal";

@Component({
  selector: 'app-header',
  imports: [LoginModal],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  title = title;
  showLogin = signal<boolean>(false);

  constructor() {}

  ngOnInit() {
    const apiUrl: string = environment.apiUrl;
    console.log(`Current API Url: ${apiUrl}`);
  }

  onShowLogin() {
    this.showLogin.update(current => !current);
  }

  onCloseLogin(value: boolean) {
    this.showLogin.set(value);
  }
}
