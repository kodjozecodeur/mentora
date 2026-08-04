# Revision Notes Engine

## Rôle

Le Revision Notes Engine transforme les fiches Markdown canoniques en objets métier consommables par Mentora.

Il ne mesure pas une compétence, ne génère pas de plan et ne rend aucune interface. La séparation est la suivante :

```text
AssessmentItem → mesure une compétence
RevisionUnit   → organise une révision
RevisionNote   → enseigne une compétence
RevisionPlan   → relie le diagnostic aux unités de révision
```

## Modules

- `parser.ts` : parse et valide le frontmatter ainsi que les cinq sections Markdown canoniques.
- `repository.ts` : construit un index immuable par `id` et `competencyId`, vérifie les doublons et les versions du pack, puis renvoie des copies indépendantes.
- `source-loader.ts` : adaptateur Node/build-time qui lit les fichiers `.md` locaux. Le repository dépend uniquement de l’interface `RevisionNoteSourceAdapter`, donc un adaptateur bundle ou catalogue distant peut être ajouté sans changer le domaine.
- `notes-engine.ts` : seam publique utilisée par le reste de l’application.
- `types.ts` : modèle métier du contenu pédagogique.

Le repository reçoit un `sourceAdapter` possédant une seule responsabilité : fournir les sources Markdown. Il ne connaît ni filesystem, ni réseau, ni format de stockage externe.

Le moteur est pur vis-à-vis de React, de `localStorage`, du Diagnostic Engine et de tout backend.

## Format éditorial

Chaque fiche contient exactement ces sections de niveau 1, dans cet ordre :

1. `Comprendre simplement`
2. `Exemple concret`
3. `Les erreurs fréquentes`
4. `À retenir`
5. `Mini exercice`

L’exemple concret utilise les labels `Situation`, `Étape N` et `Conclusion`. Chaque erreur fréquente possède `Erreur`, `Pourquoi` et `Comment éviter`. La section d’exercices contient exactement deux sous-sections avec `Énoncé`, `Réponse` et `Correction`.

Le parser est volontairement strict. Une faute de structure échoue au chargement au lieu de produire une fiche partiellement vide. Les erreurs sont typées : `RevisionNoteParseError` expose un `sourceId` et un code stable ; `RevisionNoteRepositoryError` expose les collisions d’identifiants, les incohérences de pack et les références manquantes.

## Versionnement

Les versions sont portées à la fois par le frontmatter et par `RevisionPack` :

- `curriculumVersion` identifie le programme visé ;
- `contentVersion` identifie la release éditoriale ;
- `updatedAt` indique la dernière modification ;
- `teacherValidated` indique l’état de validation pédagogique.

Le repository refuse de mélanger dans un même pack des fiches appartenant à des sujets, examens ou versions différentes. Les fichiers publiés doivent rester traçables dans Git ; une future correction doit créer une nouvelle release de contenu plutôt que modifier silencieusement une version déjà utilisée.

## Limites actuelles

- Le parser couvre le sous-ensemble Markdown nécessaire au format Mentora ; il ne cherche pas à devenir un parseur Markdown général.
- `teacherValidated` est présent mais vaut `false` pour le contenu initial ; la revue enseignante reste à effectuer.
- Le loader filesystem est un adaptateur Node/build-time. Une consommation dans un bundle navigateur nécessitera un pack statique généré ou un autre adaptateur, sans modifier l’interface du moteur.
- Le contenu reste en français et limité au pack BEPC Mathématiques 2026.
- La validation sémantique des calculs n’est pas automatisée ; elle relève de la revue pédagogique.
- Les variantes IA ne sont pas encore modélisées. Elles devront référencer une `RevisionNote` canonique et ne jamais la remplacer.
