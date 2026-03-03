import { Component, Input } from '@angular/core';
import { PaginationType } from '../../../core/functions/pagination-function';
import { NgClass } from "@angular/common";

@Component({
  selector: 'app-pagination-component',
  imports: [NgClass],
  templateUrl: './pagination-component.html',
  styleUrl: './pagination-component.scss',
})
export class PaginationComponent {
  @Input() pagination!: PaginationType;
}
