import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { Header } from "./shared/header/header";
import { Footer } from "./shared/footer/footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  
}
