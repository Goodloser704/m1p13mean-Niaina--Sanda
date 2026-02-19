Automatisation-CRUD
generation: mode=create
cruds:
1)
- entity: categorie-boutique
- crud_type: simple
- titre_page: Gestion des catégories de boutiques
- service_methods: list=obtenirCategories, create=creerCategorie, update=updateCategorie, delete=deleteCategorie
- response_shapes: list={categories:CategorieBoutique[]}, create={message:string,categorie:CategorieBoutique}, update={message:string,categorie:CategorieBoutique}
- form_fields: nom(text, required)
- list_ui: row, champs_affiches=[nom]
- dialogs: delete_confirm=true

Automatisation-CRUD
generation: 
- mode=update(add_new_line_in_existing_files)
- fichiers_a_modifier:
  - service: src/app/core/services/commercant/boutique.service.ts
  - page_ts: src/app/pages/admin/boutiques-admin/boutiques-admin.ts
  - page_html: src/app/pages/admin/boutiques-admin/boutiques-admin.html
cruds:
1)
- entity: src/app/core/models/commercant/boutique.model.ts, src/app/core/models/pagination.model.ts
- crud_type: pagination
- titre_page: List des boutiques actives
- service_methods: list=getAllBoutiqueByStatut
- response_shapes: list={ boutiques: Boutique[], pagination: Pagination }
- list_ui: grid, champs_affiches=[photo?, nom, description, categorie, commercant(nom prenoms), espace?(code etage(niveau))]
2)
- entity: src/app/core/models/commercant/boutique.model.ts, src/app/core/models/pagination.model.ts
- crud_type: pagination
- titre_page: List des boutiques inactives
- service_methods: list=getAllBoutiqueByStatut
- response_shapes: list={ boutiques: Boutique[], pagination: Pagination }
- list_ui: grid, champs_affiches=[photo?, nom, description, categorie, commercant(nom prenoms), espace?(code etage(niveau))]
resultat_attendu:
- ajouter 2 nouveau row pour la liste des boutiques actives et inactives dans boutiques-admin.html
