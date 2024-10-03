
import "./assets/stylesheets/index.scss"
// Import from "@inrupt/solid-client-authn-browser"
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
  
  import { SCHEMA_INRUPT, RDF, AS } from "@inrupt/vocab-common-rdf";
  //import { QueryEngine } from '@comunica/query-sparql-solid';
  import { QueryEngine } from '@comunica/query-sparql-link-traversal-solid';
  //import { QueryEngine } from '@comunica/query-sparql';
  
  const selectorIdP:any = document.querySelector("#select-idp");
  const selectorPod:any = document.querySelector("#select-pod");
  const buttonLogin:any = document.querySelector("#btnLogin");
  const buttonRead:any = document.querySelector("#btnRead");
  const buttonCreate:any = document.querySelector("#btnCreate");
  const labelCreateStatus:any = document.querySelector("#labelCreateStatus");

  const buttonLogOut:any = document.querySelector("#btnLogout");
  
  buttonRead.setAttribute("disabled", "disabled");
  buttonLogin.setAttribute("disabled", "disabled");
  buttonCreate.setAttribute("disabled", "disabled");


  function checkSession() {
    //localStorage.setItem("userSession", null);
    console.log('checkSession') ;
    console.log(new URL("/", window.location.href).toString()) ;

    const userJson = localStorage.getItem("userSession");
    if(userJson != null) {
        const session = JSON.parse(userJson);

        if (session.info.isLoggedIn) {
          console.log(session.info.webId) ;
          // Update the page with the status.
          (<HTMLInputElement>document.getElementById("myWebID")).value = session.info.webId;
    
          // Enable Read button to read Pod URL
          buttonRead.removeAttribute("disabled");
        }
    }
  }

  // 1a. Start Login Process. Call login() function.
  function loginToSelectedIdP() {
    const SELECTED_IDP = (document.getElementById("select-idp") as HTMLInputElement).value;
  
    return login({
      oidcIssuer: SELECTED_IDP,
      redirectUrl: new URL("/", window.location.href).toString()+`dev-page/`,
      clientName: "SpOTy"
    });
  }

  function logout() {
    localStorage.removeItem("userSession");
  }
  
  // 1b. Login Redirect. Call handleIncomingRedirect() function.
  // When redirected after login, finish the process by retrieving session information.
  async function handleRedirectAfterLogin() {
    await handleIncomingRedirect(); // no-op if not part of login redirect
    const session = getDefaultSession();
    //localStorage.removeItem("userSession");
    console.log(localStorage.getItem("userSession")) ;
    if (localStorage.getItem("userSession") == null) {
        localStorage.setItem("userSession", JSON.stringify(session));
    }
    
    // test the query execution right after login
    testSparqlQuery(session);

    checkSession();
  }
  
  // The example has the login redirect back to the root page.
  // The page calls this method, which, in turn, calls handleIncomingRedirect.
  handleRedirectAfterLogin();
  
  // 2. Get Pod(s) associated with the WebID
  async function getMyPods() {
    const webID = (<HTMLInputElement>document.getElementById("myWebID")).value;
    const mypods = await getPodUrlAll(webID, { fetch: fetch });

    mypods.forEach((mypod) => {
      let podOption = document.createElement("option");
      podOption.textContent = mypod;
      podOption.value = mypod;
      selectorPod.appendChild(podOption);
    });

    const session:Session = getDefaultSession();  
    // testSparqlQuery(session);
  }

  async function testSparqlQuery(theSession:Session) {
    console.log("Testing SPARQL query with following session :")
    console.log(theSession)
    const myEngine = new QueryEngine();

    // Query to test a join between POD & ontology
/*
    let SPARQL_QUERY = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?Token_1 ?Token_1_label WHERE {
  ?Token_1 rdf:type <https://w3id.org/SpOTy/ontology#Token>.
  OPTIONAL { ?Token_1 <https://w3id.org/SpOTy/ontology#ttranscription> ?Token_1_label. }
  ?Token_1 <https://w3id.org/SpOTy/ontology#semantics> ?Semantics_2.
  ?Semantics_2 rdf:type <http://www.w3.org/2004/02/skos/core#Concept>;
    <https://w3id.org/SpOTy/ontology#code> "O".
}
LIMIT 100
`
*/

    // Query that works on POD content only
/*
    let SPARQL_QUERY = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?Token_1 ?Token_1_label WHERE {
  ?Token_1 rdf:type <https://w3id.org/SpOTy/ontology#Token>.
  OPTIONAL { ?Token_1 <https://w3id.org/SpOTy/ontology#ttranscription> ?Token_1_label. }
}
LIMIT 100
`
*/

    // Query that works on ontology content only
    let SPARQL_QUERY = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?x WHERE {
  ?x rdf:type <http://www.w3.org/2004/02/skos/core#Concept>;
    <https://w3id.org/SpOTy/ontology#code> "O".
}
LIMIT 100
`

    console.log("calling Comunica engine...")
    const bindingsStream = await myEngine.queryBindings(SPARQL_QUERY, 
      {
        sources: [
            'https://solid.champin.net/pa/spoty/', 
            // POD de Thomas
            // 'https://storage.inrupt.com/fa747398-3bdd-4c3b-be0e-a646ac9f71f2/',
            'https://w3id.org/SpOTy/ontology',
            //{ type: 'file', value: 'https://w3id.org/SpOTy/languages' },
        ],
        lenient: true,
        // Pass your authenticated session
        '@comunica/actor-http-inrupt-solid-client-authn:session': theSession
      }
    );
        
    bindingsStream.on('data', (binding) => {
      // Quick way to print bindings for testing
      console.log(binding.toString());         
      // Obtaining values
      // console.log(binding.get('s').value);
    });

    bindingsStream.on('end', () => {
        console.log("Comunica query execution has ended !")
    });

  }
  
  // 3. Create the Reading List
  async function createList() {
    labelCreateStatus.textContent = "";
    const SELECTED_POD = (<HTMLInputElement>document.getElementById("select-pod")).value;
  
    // For simplicity and brevity, this tutorial hardcodes the  SolidDataset URL.
    // In practice, you should add in your profile a link to this resource
    // such that applications can follow to find your list.
    const readingListUrl = `${SELECTED_POD}getting-started/readingList/myList`;
  
    let titles = (<HTMLInputElement>document.getElementById("titles")).value.split("\n");
  
    // Fetch or create a new reading list.
    let myReadingList:any;
  
    try {
      // Attempt to retrieve the reading list in case it already exists.
      myReadingList = await getSolidDataset(readingListUrl, { fetch: fetch });
      // Clear the list to override the whole list
      let items = getThingAll(myReadingList);
      items.forEach((item) => {
        myReadingList = removeThing(myReadingList, item);
      });
    } catch (error) {
      if (typeof error.statusCode === "number" && error.statusCode === 404) {
        // if not found, create a new SolidDataset (i.e., the reading list)
        myReadingList = createSolidDataset();
      } else {
        console.error(error.message);
      }
    }
  
    // Add titles to the Dataset
    let i = 0;
    titles.forEach((title) => {
      if (title.trim() !== "") {
        let item = createThing({ name: "title" + i });
        item = addUrl(item, RDF.type, AS.Article);
        item = addStringNoLocale(item, SCHEMA_INRUPT.name, title);
        myReadingList = setThing(myReadingList, item);
        i++;
      }
    });
  
    try {
      // Save the SolidDataset
      let savedReadingList = await saveSolidDatasetAt(
        readingListUrl,
        myReadingList,
        { fetch: fetch }
      );
  
      labelCreateStatus.textContent = "Saved";
  
      // Refetch the Reading List
      savedReadingList = await getSolidDataset(readingListUrl, { fetch: fetch });
  
      let items = getThingAll(savedReadingList);
  
      let listcontent = "";
      for (let i = 0; i < items.length; i++) {
        let item = getStringNoLocale(items[i], SCHEMA_INRUPT.name);
        if (item !== null) {
          listcontent += item + "\n";
        }
      }
  
      (<HTMLInputElement>document.getElementById("savedtitles")).value = listcontent;
    } catch (error) {
      console.log(error);
      labelCreateStatus.textContent = "Error" + error;
      labelCreateStatus.setAttribute("role", "alert");
    }
  }
  
  buttonLogin.onclick = function () {
    loginToSelectedIdP();
  };
  buttonLogOut.onclick = function () {
    logout();
  };
  
  buttonRead.onclick = function () {
    getMyPods();
  };
  
  buttonCreate.onclick = function () {
    createList();
  };
  
  selectorIdP.addEventListener("change", idpSelectionHandler);
  function idpSelectionHandler() {
    if (selectorIdP.value === "") {
      buttonLogin.setAttribute("disabled", "disabled");
    } else {
      buttonLogin.removeAttribute("disabled");
    }
  }
  
  selectorPod.addEventListener("change", podSelectionHandler);
  function podSelectionHandler() {
    if (selectorPod.value === "") {
      buttonCreate.setAttribute("disabled", "disabled");
    } else {
      buttonCreate.removeAttribute("disabled");
    }
  }