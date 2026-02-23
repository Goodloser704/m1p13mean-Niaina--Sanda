import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Genre, User, UserRole } from '../../../core/models/user.model';
import { Router, RouterLink } from '@angular/router';
import { Loader } from "../../shared/loader/loader";
import { compressImage } from '../../../core/functions/images-function';
import { Location } from '@angular/common';
import { LoaderService } from '../../../core/services/loader.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-inscription',
  imports: [ReactiveFormsModule, Loader, RouterLink],
  templateUrl: './inscription.html',
  styleUrl: './inscription.scss',
})
export class Inscription implements OnInit {
  loaderService = inject(LoaderService);
  error = signal<string | null>(null);

  genres = Object.values(Genre);

  photoPreview = signal<string | null>(null);
  photoSizeError = signal(false);
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  registrationRole: UserRole | null = null;
  form: any;

  location = inject(Location);

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registrationRole = authService.registrationRole();
    this.form = this.fb.nonNullable.group({
      nom: ['Razanajatovo', [Validators.required, Validators.minLength(1)]],
      prenoms: ['Sanda', [Validators.required, Validators.minLength(1)]],
      genre: ['Masculin', [Validators.required]],
      email: ['sanda@gmail.com', [Validators.required, Validators.email]],
      telephone: ['034 34 034 34'],
      mdp: ['123456', [Validators.required, Validators.minLength(6)]],
      confirmation: ['123456', [Validators.required]],
      photo: [''] // ????????
    })
  }

  ngOnInit() {
    if (!this.registrationRole) {
      console.warn("Registration role is null");
      this.router.navigate(["/login"]);
    }
  }

  // --- Fonctions de traitements ---

  async onPhotoSelected(event: Event) {
    this.photoSizeError.set(false);

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    console.log(file);

    if (file.size > 2 * (1024 * 1024)) {
      this.photoSizeError.set(true);
      input.value = "";

      return;
    }

    const compressed = await compressImage(file, 800, 0.7);

    this.form.patchValue({ photo: compressed });
    this.photoPreview.set(compressed);
  }

  clearPhoto() {
    this.form.patchValue({ photo: '' });
    this.photoPreview.set(null);
    this.photoSizeError.set(false);

    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''; // vider le champ (enleve le nom et le fichier de l'input)
    }
  }

  mdpIncorrect(): boolean {
    if (this.form.get('mdp').value.length > 0) {
      return this.form.get('mdp')?.errors?.['minlength'];
    }
    return false;
  }

  confirmedMdp(): boolean {
    if (this.form.get('confirmation').value.length > 0) {
      if (this.form.get('mdp').value !== this.form.get('confirmation').value) {
        return false;
      }
    }
    return true;
  }

  register() {
    this.loaderService.show();
    this.error.set(null);

    const newUser: Partial<User> = {
      ...this.form.getRawValue(),
      role: this.registrationRole!,
    }

    console.log(`New User: ${JSON.stringify(newUser)}`);

    this.authService.inscription(newUser as User)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        error: (err) => {
          console.error(err);
          this.error.set(`${err.error.message}`);
        }
      })
  }
}
