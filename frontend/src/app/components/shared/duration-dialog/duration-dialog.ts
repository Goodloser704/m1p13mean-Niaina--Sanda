import { Component } from '@angular/core';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-duration-dialog',
  imports: [FormsModule],
  templateUrl: './duration-dialog.html',
  styleUrl: './duration-dialog.scss',
})
export class DurationDialog {
  jour: number = 0;
  heure: number = 0;
  minute: number = 0;
  seconde: number = 0;

  close!: (result: any) => void;

  formatDuration() {
    let durationString: string = '';
  }

  submit() {
    this.close({ duration: this.duration });
  }
}
