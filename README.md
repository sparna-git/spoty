# spoty
SpOTy Sparnatural integration : SoliD PODs + Sparnatural config


- Online prototype : http://vps-6ad181ed.vps.ovh.net/ (see credentials in email)
- instance de Sparnatural, avec la config écrite à la main (http://vps-6ad181ed.vps.ovh.net/static/sparnatural/config.ttl)



## Serveurs SoliD

POD de Pierre-Antoine Champin : https://solid.champin.net/pa/public/spoty-demo/

Ou utiliser le service de POD d'Inrupt. Ou voir les services providers de POD : https://solidproject.org/for-developers#hosted-pod-services

Librairie LDO pour s'intégrer avec SOLID : https://ldo.js.org/

## Spécifications

- Il faudrait avoir une URL d'accès qui prends l'URI du container en paramètre
- Il faut que l'utilisateur puisse choisir le container dans lequel il travaille

## Documentation d'intégration de l'authentification SOLID

https://docs.inrupt.com/developer-tools/javascript/client-libraries/authentication/

https://solidproject.org/for-developers

Thomas doit se créer un WebID chez Inrupt et l'envoyer à PAC

## Code de Pierre-Antoine

https://gitlab.com/pchampin/solid-spoty en particulier le login https://gitlab.com/pchampin/solid-spoty/-/blob/main/src/components/Login.tsx?ref_type=heads

URL du graphDB actuel : http://vps-6ad181ed.vps.ovh.net:7200/

## Comunica Solid Link Traversal feature

https://comunica.dev/research/link_traversal/
https://comunica.dev/docs/query/advanced/solid/

## Documentation Comunica

Exemple requète avec config : https://comunica.dev/docs/modify/getting_started/custom_config_app/

## source onthologies 

https://w3id.org/SpOTy/

## Requête SPARQL de test pour comprendre ce que "voit" Comunica

Donne la liste de tous les types avec le nombre d'instances de chaque type:

```sparql
SELECT ?type (COUNT(?x) AS ?count) WHERE {
    ?x a ?type 
}
GROUP BY ?type
```

## Requête pour tester la bonne jointure entre le POD Solid et les langues+ontology

```sparql
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?Token_1 ?Token_1_label WHERE {
  ?Token_1 rdf:type <https://w3id.org/SpOTy/ontology#Token>.
  OPTIONAL { ?Token_1 <https://w3id.org/SpOTy/ontology#ttranscription> ?Token_1_label. }
  ?Token_1 <https://w3id.org/SpOTy/ontology#semantics> ?Semantics_2.
  ?Semantics_2 rdf:type <http://www.w3.org/2004/02/skos/core#Concept>;
    <https://w3id.org/SpOTy/ontology#code> "O".
}
LIMIT 100
```

Lien vers lapage de Comunica qui marche : https://comunica.github.io/comunica-feature-link-traversal-web-clients/builds/solid-single-pod/#datasources=https%3A%2F%2Fsolid.champin.net%2Fpa%2Fspoty%2F;https%3A%2F%2Fw3id.org%2FSpOTy%2Fontology&query=PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0ASELECT%20DISTINCT%20%3FToken_1%20%3FToken_1_label%20WHERE%20%7B%0A%20%20%3FToken_1%20rdf%3Atype%20%3Chttps%3A%2F%2Fw3id.org%2FSpOTy%2Fontology%23Token%3E.%0A%20%20OPTIONAL%20%7B%20%3FToken_1%20%3Chttps%3A%2F%2Fw3id.org%2FSpOTy%2Fontology%23ttranscription%3E%20%3FToken_1_label.%20%7D%0A%20%20%3FToken_1%20%3Chttps%3A%2F%2Fw3id.org%2FSpOTy%2Fontology%23semantics%3E%20%3FSemantics_2.%0A%20%20%3FSemantics_2%20rdf%3Atype%20%3Chttp%3A%2F%2Fwww.w3.org%2F2004%2F02%2Fskos%2Fcore%23Concept%3E%3B%0A%20%20%20%20%3Chttps%3A%2F%2Fw3id.org%2FSpOTy%2Fontology%23code%3E%20%22O%22.%0A%7D%0ALIMIT%20100
