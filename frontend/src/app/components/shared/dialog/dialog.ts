import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dialog',
  imports: [],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {
  @Input() dialog: string = 'Yes or No ?';

  @Output() dialogResponse = new EventEmitter<boolean>();
  @Output() clickOutside = new EventEmitter<void>();

   onChoose(value: boolean) {
    this.dialogResponse.emit(value);
  }

  onClickOutside() {
    this.clickOutside.emit();
  }
}
