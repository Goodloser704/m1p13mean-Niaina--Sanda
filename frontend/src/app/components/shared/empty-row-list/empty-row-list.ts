import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-row-list',
  imports: [],
  templateUrl: './empty-row-list.html',
  styleUrl: './empty-row-list.scss',
})
export class EmptyRowList {
  @Input() label: string = '';
}
