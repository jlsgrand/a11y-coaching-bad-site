# Exercice réparation d'une page web non accessible

Votre mission, si vous l'acceptez, sera de rendre cette page web conforme au RGAA. Un grand nombre d'erreur est présent dans cette page, essayez d'en trouver le maximum, **de noter en commentaire ce que vous avez corrigé afin de pouvoir en discuter par la suite**.

Pensez à utiliser votre lecteur d'écran pour naviguer et vérifier le bon fonctionnement de la page.

## Etape 1 : Structure

- Implémentez une structure `html` pertinente en utilisant les balises sémantiques (`header`, `main`, `nav`, ...).
- Ajoutez les liens d'accès rapide
- Vérifier les landmarks ARIA (`role="banner"`, `role="navigation"`, `role="contentinfo"`)

## Etape 2 : Contenu

- Vérifiez la structure des titres (`h1`, `h2`, ...)
- La bonne structuration des listes (`ol`, `ul`, ...)
- L'utilisation des balises sémantiques pour les tableaux de données (`table`, `thead`, ...)
- La juste utilisation des alternatives textuelles pour les images (`alt`)
- La pertinence des liens

## Etape 3 : Ordre de lecture et positionnement

- Vérifiez que la navigation au clavier est possible dans la page.
- Vérifiez que le contenu de la page reste compréhensible une fois les styles désactivés.

## Etape 4 : Linéarisation du contenu

Vérifiez, lorsque vous passez sur un petit écran, que le contenu reste compréhensible. Que se passe t-il si vous zoomez à 200%, à 400% ?

## Etape 5 : Formulaires

Vérifiez la structure, les étiquettes, les boutons, les indications de saisie.

Si des champs collectent des données personnelles, assurez-vous qu’ils soient identifiables par les technologies d’assistance (`autocomplete`).

## Etape 6 : ARIA et JS

- Vérifiez le fonctionnement de la fenêtre modale
- Vérifiez les fonctionnement du formulaire d'inscription à la newsletter dans la disclosure
- Le contrôle de saisie du formulaire est-il suffisant ?

## Etape 7 : Couleurs et contraste

Le site est-il conforme aux exigences relatives au contraste des couleurs ?
