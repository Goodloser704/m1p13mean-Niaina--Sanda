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
