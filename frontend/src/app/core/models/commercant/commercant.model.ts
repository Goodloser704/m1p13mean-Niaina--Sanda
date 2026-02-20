export interface LoyerPaiement {
  boutiqueId: string,
  montant: number,
  periode: string //YYYY-MM
}

export interface LoyerStats {
  totalMontant: number,
  nombrePaiements: number,
  montantMoyen: number,
  montantMin: number,
  montantMax: number
}