# Sprint 4A — domaine de révision

## Décisions

- `AssessmentItem`, `RevisionUnit`, `RevisionActivity`, `ExitCriterion` et `RevisionPlan` sont des concepts séparés.
- Le générateur reçoit un `DiagnosticResult` et un catalogue de `RevisionUnit`. Il ne lit pas les questions diagnostiques et ne dépend pas de l’UI.
- Le plan contient un snapshot de la version de l’algorithme, de la version du contenu et de la date de génération.
- Les compétences non maîtrisées sont ordonnées par maîtrise croissante, puis par identifiant pour garantir un résultat stable.
- Une compétence maîtrisée avec une confiance faible produit une session de vérification de priorité faible.
- Les seuils sont : `critical` pour 0–39 %, `high` pour 40–59 %, `medium` pour 60–69 % et `low` pour 70–100 %.
- La cible est au minimum 70 %, avec un plafond à 90 % et un incrément de 20 points lorsque cela est possible.
- Une unité manquante provoque une erreur explicite. Le moteur ne supprime pas silencieusement une faiblesse du plan.
- Une journée représente au plus 30 minutes estimées ; les sessions sont réparties séquentiellement.

## Compatibilité avec le Diagnostic Engine actuel

Le contrat métier fourni prévoit `confidence` par compétence, mais le dépôt actuel ne l'émet pas encore. Le champ est donc optionnel dans les types existants, sans modification du calcul du diagnostic. Le générateur utilise `low` par défaut afin de rester prudent et de rendre visible le besoin de calibration future.

## Hors périmètre

Ce sprint ne contient pas les fiches pédagogiques complètes, l'écran du plan, le stockage du plan, la synchronisation, l'export PDF ou l'IA.
