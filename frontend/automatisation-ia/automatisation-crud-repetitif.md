Automatisation-CRUD

contexte:
- stack: Angular 21 (signals + reactive forms)
- style_reference_html: src/app/pages/admin/espaces/espaces.html, src/app/pages/admin/boutiques-admin/boutiques-admin.html
- style_reference_ts: src/app/pages/admin/espaces/espaces.ts, src/app/pages/admin/boutiques-admin/boutiques-admin.ts

regles_globales:
- garder le meme design/classes/structure que les pages de reference
- pas d'emoji dans le code
- commentaires: max 1-2 lignes simples et utiles
- console.log: eviter, au plus 1 si necessaire
- utiliser app-dialog + app-loader + composants empty list existants
- ne pas casser le code deja en place

generation:
- mode: create | update
- fichiers_a_modifier:
  - model: src/app/core/models/admin/<entity>.model.ts
  - service: src/app/core/services/admin/<entity>.service.ts
  - page_ts: src/app/pages/admin/<page>/<page>.ts
  - page_html: src/app/pages/admin/<page>/<page>.html

cruds:
1)
- entity: <nom_entite>
- crud_type: simple | pagination
- titre_page: <texte h2>
- service_methods:
  - list: <methodName>
  - create: <methodName>
  - update: <methodName>
  - delete: <methodName>
- response_shapes:
  - list: <ex: { categories: CategorieBoutique[] }>
  - create: <ex: { message: string, categorie: CategorieBoutique }>
  - update: <ex: { message: string, categorie: CategorieBoutique }>
- form_fields:
  - name: <champ>
    type: text|number|select|...
    default: <valeur>
    validators: [required, min:x, ...]
- list_ui:
  - type: row | card
  - champs_affiches: [<champ1>, <champ2>]
- pagination (si crud_type=pagination):
  - limit: <nombre>
  - page_param: page
  - total_param: totalPages
- dialogs:
  - delete_confirm: true
- extra_actions:
  - <ex: liberer, occuper> (optionnel)

contraintes_metier:
- <regles specifiques si besoin>

resultat_attendu:
- coder directement les modifications dans les fichiers cibles
- garder coherence naming + architecture existante
- fournir un resume court des changements
