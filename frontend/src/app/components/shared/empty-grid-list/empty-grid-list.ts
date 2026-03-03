import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-grid-list',
  imports: [],
  templateUrl: './empty-grid-list.html',
  styleUrl: './empty-grid-list.scss',
})
export class EmptyGridList {
  @Input() label: string = '';
}
