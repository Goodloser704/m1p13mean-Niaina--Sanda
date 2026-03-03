/**
 * 🏪 Utilitaires pour les boutiques
 */

/**
 * Vérifie si une boutique est ouverte à un moment donné
 * @param {Object} boutique - La boutique avec horairesHebdo
 * @param {Date} date - La date à vérifier (par défaut: maintenant)
 * @returns {Object} { estOuverte: boolean, raison: string }
 */
function estBoutiqueOuverte(boutique, date = new Date()) {
  // NE PAS vérifier statutBoutique - on se base uniquement sur les horaires
  // Le statutBoutique est pour l'administration, pas pour les horaires d'ouverture
  
  // Si pas d'horaires définis, considérer comme toujours ouverte
  if (!boutique.horairesHebdo || boutique.horairesHebdo.length === 0) {
    return {
      estOuverte: true,
      raison: 'Horaires non définis'
    };
  }

  // Obtenir le jour de la semaine (0 = Dimanche, 1 = Lundi, ..., 6 = Samedi)
  const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const jourActuel = joursSemaine[date.getDay()];

  // Chercher l'horaire pour ce jour
  const horaireJour = boutique.horairesHebdo.find(h => h.jour === jourActuel);

  if (!horaireJour) {
    return {
      estOuverte: false,
      raison: `Fermé le ${jourActuel}`
    };
  }

  // Vérifier l'heure actuelle
  const heureActuelle = date.getHours() * 100 + date.getMinutes(); // Format HHMM
  
  // Convertir les heures au format HHMM (ex: "09:30" -> 930, "14:00" -> 1400)
  const [heureDebutH, heureDebutM] = horaireJour.debut.split(':').map(Number);
  const [heureFinH, heureFinM] = horaireJour.fin.split(':').map(Number);
  const heureDebut = heureDebutH * 100 + heureDebutM;
  const heureFin = heureFinH * 100 + heureFinM;

  console.log(`🕐 Vérification horaires: ${jourActuel} ${date.getHours()}:${date.getMinutes()} (${heureActuelle}) vs ${horaireJour.debut}-${horaireJour.fin} (${heureDebut}-${heureFin})`);

  if (heureActuelle < heureDebut) {
    return {
      estOuverte: false,
      raison: `Ouvre à ${horaireJour.debut}`
    };
  }

  if (heureActuelle >= heureFin) {
    return {
      estOuverte: false,
      raison: `Fermé (fermeture à ${horaireJour.fin})`
    };
  }

  return {
    estOuverte: true,
    raison: `Ouvert jusqu'à ${horaireJour.fin}`
  };
}

/**
 * Obtient les horaires d'ouverture formatés pour affichage
 * @param {Object} boutique - La boutique avec horairesHebdo
 * @returns {Array} Liste des horaires formatés
 */
function getHorairesFormattes(boutique) {
  if (!boutique.horairesHebdo || boutique.horairesHebdo.length === 0) {
    return [];
  }

  const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  return joursSemaine.map(jour => {
    const horaire = boutique.horairesHebdo.find(h => h.jour === jour);
    return {
      jour,
      horaire: horaire ? `${horaire.debut} - ${horaire.fin}` : 'Fermé'
    };
  });
}

module.exports = {
  estBoutiqueOuverte,
  getHorairesFormattes
};
