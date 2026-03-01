export enum NotificationType {
  Paiement = "Paiement",
  Achat = "Achat",
  Vente = "Vente",
  Demande = "Demande"
}

export interface Notification {
  _id: string,
  type: NotificationType,
  message: string,
  receveur: string,
  isRead: boolean,
  urlRoute: string,
  createdAt: string,
  updatedAt: string
}

export interface NotificationResponse {
  data: Notification[], 
  total: number, 
  unreadCount: number 
}