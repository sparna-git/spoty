
import "./assets/stylesheets/index.scss"

//import { QueryEngine } from '@comunica/query-sparql-solid';
import { QueryEngine } from '@comunica/query-sparql-link-traversal-solid';
//import { QueryEngine } from '@comunica/query-sparql';
import {
    login,
    handleIncomingRedirect,
    getDefaultSession,
    fetch,
    Session
  } from "@inrupt/solid-client-authn-browser";

  // Import from "@inrupt/solid-client"
  import {
    addUrl,
    addStringNoLocale,
    createSolidDataset,
    createThing,
    getPodUrlAll,
    getSolidDataset,
    getThingAll,
    getStringNoLocale,
    removeThing,
    saveSolidDatasetAt,
    setThing
  } from "@inrupt/solid-client";

  
  const buttonLogin:any = document.querySelector("#btnLogin");
  const buttonLaunch:any = document.querySelector("#btnLaunch");
  const textareaQuery:any = document.querySelector("#query");
    // Query to test a join between POD & ontology
/*
    textareaQuery.value = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?Token_1 ?Token_1_label WHERE {
  ?Token_1 rdf:type <https://w3id.org/SpOTy/ontology#Token>.
  OPTIONAL { ?Token_1 <https://w3id.org/SpOTy/ontology#ttranscription> ?Token_1_label. }
  ?Token_1 <https://w3id.org/SpOTy/ontology#semantics> ?Semantics_2.
  ?Semantics_2 rdf:type <http://www.w3.org/2004/02/skos/core#Concept>;
    <https://w3id.org/SpOTy/ontology#code> "O".
}
LIMIT 100
`*/


    // Query that works on POD content only
/**/
textareaQuery.value = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?Token_1 ?Token_1_label WHERE {
  ?Token_1 rdf:type <https://w3id.org/SpOTy/ontology#Token>.
  OPTIONAL { ?Token_1 <https://w3id.org/SpOTy/ontology#ttranscription> ?Token_1_label. }
}
LIMIT 100
`


    // Query that works on ontology content only
    /*textareaQuery.value = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?x WHERE {
  ?x rdf:type <http://www.w3.org/2004/02/skos/core#Concept>;
    <https://w3id.org/SpOTy/ontology#code> "O".
}
LIMIT 100
`;*/

/*
textareaQuery.value = `
SELECT ?type (COUNT(?x) AS ?count) WHERE {
  ?x a ?type 
}
GROUP BY ?type
`;*/ 

  // 1a. Start Login Process. Call login() function.
  function loginToSelectedIdP() {
    const SELECTED_IDP = 'https://login.inrupt.com';
  
    return login({
      oidcIssuer: SELECTED_IDP,
      redirectUrl: new URL("/", window.location.href).toString()+`dev-page/`,
      clientName: "SpOTy test"
    });
  }

  async function handleRedirectAfterLogin() {
    await handleIncomingRedirect(); // no-op if not part of login redirect
  
    const session = getDefaultSession();
    if (session.info.isLoggedIn) {
      // Update the page with the status.
      //document.getElementById("myWebID").value = session.info.webId;
  
      // Enable Read button to read Pod URL
      //buttonRead.removeAttribute("disabled");
      
      testSparqlQuery(session);
    }
  }
  handleRedirectAfterLogin();

  
  buttonLogin.onclick = function () {
    loginToSelectedIdP();
  };
  buttonLaunch.onclick = function () {
    let session:Session =getDefaultSession();
    console.log('session -----') ;
    console.log(session) ;
    testSparqlQuery(session);
  };

  async function testSparqlQuery(session:Session) {
    let myEngine = new QueryEngine();
    console.log(textareaQuery.value) ;

    let bindingsStream = await myEngine.queryBindings(textareaQuery.value, {
    sources: [
        //session.info.webId,
        'https://solid.champin.net/pa/spoty/', 
        // POD de Thomas
        // 'https://storage.inrupt.com/fa747398-3bdd-4c3b-be0e-a646ac9f71f2/',
        //'https://w3id.org/SpOTy/ontology',
        'https://perso.liris.cnrs.fr/pierre-antoine.champin/2023/SpOTy/ontology',
        { type: 'file', value: 'https://w3id.org/SpOTy/languages' },
    ],
    lenient: true,
      '@comunica/actor-http-inrupt-solid-client-authn:session': session,
    });



    // Consume results as a stream (best performance)
    bindingsStream.on('data', (binding) => {
      console.log(binding.toString()); // Quick way to print bindings for testing

    });
    bindingsStream.on('end', () => {
      // The data-listener will not be called anymore once we get here.
      console.log('end query results'); 
    });
    bindingsStream.on('error', (error) => {
      console.error(error);
    });
  }

  
/*
// Consume results as an array (easier)
const bindings = await bindingsStream.toArray();
console.log(bindings[0].get('s').value);
console.log(bindings[0].get('s').termType);

*/