import { Component } from '@angular/core';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-duration-dialog',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './duration-dialog.html',
  styleUrl: './duration-dialog.scss',
})
export class DurationDialog {
  close!: (result: string | null) => void;

  form: any;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      jour: [0, [Validators.min(0)]],
      heure: [0, [Validators.min(0), Validators.max(23)]],
      minute: [0, [Validators.min(0), Validators.max(59)]],
      seconde: [0, [Validators.min(0), Validators.max(59)]],
    });
  }

  private pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  get formattedDuration(): string | null {
    if (this.form.invalid) return null;

    const { jour, heure, minute, seconde } = this.form.value;
    const totalHeures = (jour! * 24) + heure!;

    return `${this.pad(totalHeures)}:${this.pad(minute!)}:${this.pad(seconde!)}`;
  }

  submit() {
    if (this.form.invalid) return;

    console.log(`Duration: ${this.formattedDuration}`);
    this.close(this.formattedDuration);
  }
}
