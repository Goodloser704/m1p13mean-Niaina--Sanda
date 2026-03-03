import { Component } from '@angular/core';
import { Footer } from "../../footer/footer";
import { RouterOutlet } from "@angular/router";
import { AdminHeader } from "../../header/admin-header/admin-header";

@Component({
  selector: 'app-admin-layout',
  imports: [Footer, RouterOutlet, AdminHeader],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {

}
