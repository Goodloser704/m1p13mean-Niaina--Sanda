import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { PanierDeleteData, PanierService } from '../../../core/services/acheteur/panier.service';
import { LoaderService } from '../../../core/services/loader.service';
import { DialogService } from '../../../core/services/dialog.service';
import { Dialog } from '../../../components/shared/dialog/dialog';
import { filter, finalize, switchMap, tap } from 'rxjs';
import { AchatService } from '../../../core/services/acheteur/achat.service';
import { Router, RouterLink } from '@angular/router';
import { TypeAchat } from '../../../core/models/acheteur/achat.model';
import { CurrencyPipe, Location } from '@angular/common';
import { PanierCard } from "../../../components/acheteur/panier-card/panier-card";

@Component({
  selector: 'app-mon-panier',
  imports: [RouterLink, CurrencyPipe, PanierCard],
  templateUrl: './mon-panier.html',
  styleUrl: './mon-panier.scss',
})
export class MonPanier implements OnInit, AfterViewInit {
  private panierService = inject(PanierService);

  panier = this.panierService.panier;
  montantTotal = this.panierService.montantTotal;
  totalArticles = this.panierService.totalArticles;

  @ViewChild('childSection') childSection!: ElementRef;

  constructor(
    private achatService: AchatService,
    private loaderService: LoaderService,
    private dialogService: DialogService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.childSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  trackByProduit(index: number, item: any) {
    return item.produitId + item.typeAchat;
  }

  validerAchat() {
    this.dialogService.open(Dialog, {
      data: { message: "Confirmer l'achat ?" }
    })
      .pipe(
        filter(result => result === true),
        tap(() => this.loaderService.show()),
        switchMap(() => {
          const panierPayload = this.panierService.getPanierValide();
          return this.achatService.validerPanier(panierPayload)
        }),
        finalize(() => this.loaderService.hide())
      )
      .subscribe({
        next: (res) => {
          try {
            console.log(res.message);

            this.panierService.vider();
            this.router.navigate(['/acheteur/mes-achats']);
          } catch (err) {
            console.error(err);
          }
        },
        error: (error) => {
          console.error(error);
          alert(error.error.message);
        }
      });
  }

  supprimerItem(data: PanierDeleteData) {
    this.dialogService.open(Dialog, {
      data: { message: "Supprimer l'article de votre panier ?" }
    })
      .pipe(filter(result => result === true))
      .subscribe(() => this.panierService.supprimerItem(data));
  }

  viderPanier() {
    this.dialogService.open(Dialog, {
      data: { message: "Voulez vous vraiment vider le panier ?" }
    })
      .subscribe({
        next: (res) => {
          try {
            if (res === true) {
              this.panierService.vider();
            }
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  back() {
    this.location.back();
  }
}
