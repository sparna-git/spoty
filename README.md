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

## Comunica Solid Link Traversal feature

https://comunica.dev/research/link_traversal/
https://comunica.dev/docs/query/advanced/solid/

## Documentation Comunica

Exemple requète avec config : https://comunica.dev/docs/modify/getting_started/custom_config_app/
