import "./assets/stylesheets/index.scss";
import "@yaireo/tagify/dist/tagify.css";

import { QueryEngine } from 'spoty-query-engine';
import * as RDF from '@rdfjs/types';

var QueryEngineBase = require('@comunica/actor-init-query').QueryEngineBase;

const myEngine = new QueryEngine();
console.log(myEngine) ;
const engine = new QueryEngineBase(require('spoty-query-engine'));
console.log(engine) ;
async function timer(ms:any) { return new Promise(res => setTimeout(res, ms)); }
(<any>window).podQueryEngine = async function (sparql:string, session:any, podUrl:any) {
 
  console.log('Query launched with :'+ sparql);
  console.log(session);
  // Query that works on ontology content only
    /**/ let textareaQuery = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?x WHERE {
  ?x rdf:type <http://www.w3.org/2004/02/skos/core#Concept>;
    <https://w3id.org/SpOTy/ontology#code> "O".
}
LIMIT 100
`;

  let test =`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?Sentence_1 ?Sentence_1_label WHERE {
  ?Sentence_1 rdf:type <https://w3id.org/SpOTy/ontology#Sentence>.
  OPTIONAL { ?Sentence_1 <https://schema.org/identifier> ?Sentence_1_label. }
  ?Sentence_1 <https://w3id.org/SpOTy/ontology#firstToken> ?Token_2.
  ?Token_2 rdf:type <https://w3id.org/SpOTy/ontology#Token>.
}
LIMIT 1000`;

//with all sources
  let test1 = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?Token_1 ?Token_1_label WHERE {
  ?Token_1 rdf:type <https://w3id.org/SpOTy/ontology#Token>.
  OPTIONAL { ?Token_1 <https://w3id.org/SpOTy/ontology#ttranscription> ?Token_1_label. }
  ?Token_1 <https://w3id.org/SpOTy/ontology#semantics> ?Semantics_2.
  ?Semantics_2 rdf:type <http://www.w3.org/2004/02/skos/core#Concept>;
    <https://w3id.org/SpOTy/ontology#code> "O".
}
LIMIT 10`;


	const bindingsStream = await myEngine.queryBindings(sparql, {
	  sources: [
      podUrl, 
       /*'https://w3id.org/SpOTy/languages',
        'https://w3id.org/SpOTy/ontology',
        'https://solid.champin.net/pa/public/spoty/ontology',
        'https://solid.champin.net/pa/public/spoty/languages'*/
        //{ type: 'file', value: 'https://w3id.org/SpOTy/ontology' },
        //{ type: 'file', value: 'https://w3id.org/SpOTy/languages' },
      ],
      fetch: session.fetch,
      lenient: true,
      //'@comunica/actor-rdf-resolve-hypermedia-links-traverse:traverse': false,
      '@comunica/actor-rdf-resolve-hypermedia-links-traverse:traverse': true,
      '@comunica/actor-http-inrupt-solid-client-authn:session': session,
	});

  
  var onQueryProcess = true;
  var results:any = [] ;
  var results_keys:any = [] ;

	bindingsStream.on('data', (binding:any) => {
	    console.log(JSON.parse(binding.toString())) ; // Quick way to print bindings for testing

      results_keys = [] ;
      let result = JSON.parse(binding.toString());
      Object.keys(result).forEach(key => {
        results_keys.push(key) ;
        //console.log(key);        // the name of the current key.
        result[key] = {value: result[key] }; // the value of the current key.
      });
      
      console.log(result) ;

      results.push(result) ;


      

      
	    //console.log(binding.has('s')); // Will be true
	    
	    // Obtaining values
	    /*console.log(binding.get('s').value);
	    console.log(binding.get('s').termType);
	    console.log(binding.get('p').value);
	    console.log(binding.get('o').value);*/
	});

	bindingsStream.on('end', () => {
	    // The data-listener will not be called anymore once we get here.
	    console.log("Query execution has ended !");
      onQueryProcess = false;
	});

	bindingsStream.on('error', (error:any) => {
	    console.error(error);
	});

  

  for(var start = 1; onQueryProcess; start++) {
    console.log('waiting results...');
    if (onQueryProcess ) {
    await timer(3000);

    }

    
  }

  results = {
    "head" : {
      "vars" : results_keys 
    },
    "results" : {
      "bindings" : results
    }
  }

  return results ;
}


//var Tagify = require('@yaireo/tagify');

//import {LoggerPretty} from "@comunica/logger-pretty";

//import { QueryEngine } from '@comunica/query-sparql-solid';
//import { QueryEngine } from '@comunica/query-sparql-link-traversal-solid';
//import { QueryEngine } from '@comunica/query-sparql-link-traversal-solid';
//import { QueryEngine } from '../custom_package_v2';
//import { QueryEngine } from '../engine-default';
//import { QueryEngine } from '@comunica/query-sparql';

var RdfString = require('rdf-string');
var resolve = require('relative-to-absolute-iri').resolve;
var solidAuth = require('@rubensworks/solid-client-authn-browser'); // for servce worker
//var solidAuth = require('@inrupt/solid-client-authn-browser');
if (typeof global.process === 'undefined')
  global.process = require('process');

/*import {
    login,
    handleIncomingRedirect,
    getDefaultSession,
    fetch,
    Session
  } from "@rubensworks/solid-client-authn-browser";*/
import {
    login,
    handleIncomingRedirect,
    getDefaultSession,
    fetch,
    Session
  } from "@inrupt/solid-client-authn-browser";/**/

  import {
    /*Session,
    ISessionOptions,
    ILoginInputOptions,
    ISessionInfo,
    IStorage,
    NotImplementedError,
    ConfigurationError,
    InMemoryStorage,*/
    node,
    browser,
  } from '@rubensworks/solid-client-authn-isomorphic';

  // Import from "@inrupt/solid-client"
 /* import {
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
  } from "@inrupt/solid-client";*/

 //import {  login, getDefaultSession, Session, handleIncomingRedirect } from '@inrupt/solid-client-authn-browser'


  // Escapes special HTML characters and convert URLs into links
  function escape(text:string) {
    return (text + '').split('\n').map(function (line) {
      return line
        .replace(/(<)|(>)|(&)/g, escapeMatch)
        .replace(/([\s"])(https?:\/\/[^\s<>"]+)/g, escapeMatchUrl);
    }).join('<br/>');
  }
  function escapeMatch(match:any, lt:any, gt:any, amp:any) {
    return lt && '&lt;' || gt && '&gt;' || amp && '&amp;';
  }
  function escapeMatchUrl(match:any, preUrl:any, url:any) {
    return preUrl + '<a href="' + url + '" target=_blank>' + url + '</a>';
  }

  // Escapes the string for usage as a regular expression
  function toRegExp(string:any) {
    return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }

  // Converts the array to a hash with the elements as keys
  function toHash(array:any, val:any) {
    var hash:any = {}, length = array ? array.length : 0;
    for (var i = 0; i < length; i++)
      hash[array[i]] = val;
    return hash;
  }

  // Parses a yyyy-mm-dd date string into a Date
  function parseDate(date:any) {
    if (date) {
      try { return new Date(Date.parse(date)); }
      catch (e) { /* ignore invalid dates */ }
    }
  }


  // Shortens an URL to the given length
  function shortenUrl(url:any, length:any) {
    if (url.length > length)
      return '&hellip;' + url.slice(url.length - length, url.length);
    return url;
  }

class SolidQueryUi extends HTMLElement {

  displayLogs: boolean = false;
  displayQueryState: boolean = false;
  displayQueryControls: boolean = false;

  //elements
  logsElement: HTMLElement;
  stateElement: HTMLElement;
  controlsElement: HTMLElement;
  stopQuerytButton: HTMLButtonElement;

  serviceWorker: Worker;
  solidSession: Session;
  queryWorkerSessionHandler: any ;
  writeEnd: any;
  resultCount: number;
  sparqlQuery: string;
  bypassCache: any;
  session: Session;
  datasources: any;
  options: {
    datasources: [],
    queries: [],
    prefixes: [],
    queryContext: string,
    resultsToTree: false,
    queryFormat: string,
    httpProxy: false,
    datetime: any,
    bypassCache: any,
  };
  contextDefault: any;
  writeResult:any;
  onQueryProcess: any;
  allResultsRecived: any;

    
  constructor() {
    // Always call super first in constructor
    super();
    this.initElement()
  }

  
  async timer(ms:any) { return new Promise(res => setTimeout(res, ms)); }
  
  initElement() {
    console.log(this) ;
    this.displayLogs = (this.getAttribute('display-logs') === "true");
    this.displayQueryState = (this.getAttribute('display-query-state') === "true");
    this.displayQueryControls = (this.getAttribute('display-query-controls') === "true") ;
    this.addUiUx() ;

    this.initClassLdfQueryUI() ;
    
    /*this.connected = false;
    this.initEventListners()
    this.handleRedirectAfterLogin();
    this.welcomMessage = 'Please connect to Solid';*/
  }

  addUiUx() {

    if(this.displayQueryState) {
      this.stateElement = document.createElement("span");
      this.stateElement.classList.add('solid-query-state');
      this.appendChild(this.stateElement);
    }
    if(this.displayLogs) {
      this.logsElement = document.createElement("span");
      this.logsElement.classList.add('solid-query-logs');
      this.appendChild(this.logsElement);
    }
    if(this.displayQueryControls) {
      this.controlsElement = document.createElement("span");
      this.controlsElement.classList.add('solid-query-controls');
      this.appendChild(this.controlsElement);

      this.stopQuerytButton = document.createElement("button");
      this.stopQuerytButton.classList.add('solid-stop-query');
      this.stopQuerytButton.disabled = true;
      this.stopQuerytButton.innerText = "Stop search process";
      this.controlsElement.appendChild(this.stopQuerytButton);
    }
  }

  
  initClassLdfQueryUI () {
    this.options = {
      datasources: [],
      queries: [],
      prefixes: [],
      queryContext: '',
      resultsToTree: false,
      queryFormat: 'sparql',
      httpProxy: false,
      datetime: Date.now(),
      bypassCache: false,
    };

    this.initWorquer()  ;
    this.create();
    
    this.initEventListners();
    //queryui._startExecution();
  }
  initEventListners() {
    this.stopQuerytButton.addEventListener('click', () => {
      console.log('clicked') ;
      this.stopExecution(false) ;
    });
    
    /*this.addEventListener('endQuery', () => {
      console.log('endQuery event') ;
      this.onQueryProcess = false ;
      this.stopQuerytButton.disabled = true;
      console.log(this.allResultsRecived) ;
    });*/
  }

  async playLdfQueryUI (stringQuery:string) {

    this.changeQuery(stringQuery) ;
    return await this.startExecution();
  }

  changeQuery(query:string) {
    this.sparqlQuery = query ;
  }

  async startExecution () {
    this.onQueryProcess = true ;
    this.allResultsRecived = [] ;
    var datasources = this.datasources || [];
    if (!datasources.length)
      return alert('Please choose a datasource to execute the query.');


    // Clear results and log
    /*this.$stop.show();
    this.$start.hide();*/
    //this._resultsScroller.removeAll();
    /*this._resultAppender.clear();
    this._logAppender.clear();*/

    // Reset worker if we want to bypass the cache
    if (this.options.bypassCache)
      //this._stopExecutionForcefully();

    this.resultCount = 0;
    //this._startTimer();

    // Let the worker execute the query
    var context = {
      ...this.getQueryContext(),
      sources: datasources.map(function (datasource:any) {
        var type;
        var posAt = datasource.indexOf('@');
        if (posAt > 0) {
          type = datasource.substr(0, posAt);
          datasource = datasource.substr(posAt + 1, datasource.length);
        }
        datasource = resolve(datasource, window.location.href);
        return { type: type, value: datasource };
      }),
      //lenient: true
      //SolidQueryUi: this
    };
    this.serviceWorker.postMessage({
      type: 'query',
      query: this.sparqlQuery,
      context: context,
      resultsToTree: false,
    });
    this.stopQuerytButton.disabled = false;
    //let allResult = await this.attendreResults() ;
    //console.log(allResult);
    for(var start = 1; this.onQueryProcess; start++) {
      console.log('index waiting results...');
      if (this.onQueryProcess) {
      await this.timer(3000);

      }
      
    }
    if(this.allResultsRecived.length > 0) {
      console.log(this.allResultsRecived[0]) ;
      let firstResultKeys = Object.keys(this.allResultsRecived[0]);
      return await {
        "head" : {
          "vars" : firstResultKeys
        },
        "results" : {
          "bindings" : this.allResultsRecived
        }
      } ;


    } else {
      return {} ;
    }
    //return allResult ;
  }


  
                  
 /*
  attendreResults():Promise<any> {
   if (this.onQueryProcess) {
      return await setTimeout(async () => {
        console.log(`Patienter... en process ${this.onQueryProcess}`);
        return await this.attendreResults();
      }, 30000);
      
    } else {
      console.log("Processus terminé, on peu enoyer les résultats");
      
      console.log(this.allResultsRecived) ;
      if(this.allResultsRecived.length > 0) {
        return async {
          "head" : {
            "vars" : [
              "Sentence_1",
              "Sentence_1_label"
            ]
          },
          "results" : {
            "bindings" : this.allResultsRecived
          }
        } ;
      } else {
        return await {} ;
      }
      //return 'All results' ;
    //}
  }*/

  
  stopExecution (error:any) {
    // Stop the worker
    this.serviceWorker.postMessage({ type: 'stop' });
    this.onQueryProcess= false;
    this.writeResult = this.writeEnd = null;
    this.stopQuerytButton.disabled = true;

    const event = new CustomEvent("endQuery", { detail: 'hoho' });
    this.dispatchEvent(event);
    /*this.stopExecutionBase(error);*/
  }
  writeEndRsult  () {
    if (!this.resultCount){
      console.log('This query has no results.');
    }
  }

  createQueryWorkerSessionHandler () {
    if (this.solidSession) {
      this.queryWorkerSessionHandler = new solidAuth.WindowToWorkerHandler(this, this.serviceWorker, this.solidSession);
    }
  }
  
  endResults () {
    if (this.writeEnd) {
      this.writeEndRsult();
      this.stopExecution(false);
    }
      console.log('Worker stoped, end of query');
      this.onQueryProcess= false;
  }

  addResult(result:any) {
    console.log(result) ;
      this.resultCount++;
      this.logsElement.innerHTML = this.resultCount.toString() ;
      this.allResultsRecived.push(result);
    
  }

  create () {
    var self = this,
    options = this.options,
    datasources = [
      'https://solid.champin.net/pa/spoty/', 
      /*'https://w3id.org/SpOTy/languages',
      'https://w3id.org/SpOTy/ontology'*/
    ],
    
    bypassCache = this.bypassCache = false;
    this.session = getDefaultSession() ;

    this.sparqlQuery = ``; 

    console.log(this.session) ;

    // Replace non-existing elements by an empty text box
    this.datasources = datasources;
    const solidSession = this.solidSession = this.session;
    this.createQueryWorkerSessionHandler();
    this.serviceWorker.postMessage({
      type: 'getWebIdName',
      webId: solidSession.info.webId,
      context: self.getQueryContext(),
    });
    

  }
  getQueryContext () {
    var context = {
      ...(this.contextDefault || {}),
      datetime: parseDate(Date.now()),
      queryFormat: this.options.queryFormat,
      httpProxy: this.options.httpProxy,
      workerSolidAuth: !!this.solidSession,
    };
    if (this.options.queryContext) {
      try {
        var queryContextObject = JSON.parse(this.options.queryContext);
        Object.assign(context, queryContextObject);
      }
      catch (e) {
        console.log(e.message + '\n');
      }
    }
    return context;
  }

  
  initWorquer () {
    this.resultCount = 0 ;
    var self = this;
    this.serviceWorker = new Worker('assets/js/ldf-client-worker_v2.js');
    //this.serviceWorker = new Worker('assets/js/ldf-client-worker.min.js?v=1');
    this.queryWorkerSessionHandler = undefined;
    this.serviceWorker.onmessage = function (message:any) {
      if (self.queryWorkerSessionHandler && self.queryWorkerSessionHandler.onmessage(message))
        return;

      var data = message.data;
      switch (data.type) {
      case 'queryInfo': return self.initResults(data.queryType);
      //case 'queryInfo': return console.log(data);
      case 'result':    return self.addResult(data.result);
      //case 'result':    return console.log(data);
      case 'end':       return self.endResults();
      //case 'log':       return self._logAppender(data.log);
      //case 'log':       return console.log(data);
      //case 'error':     return this.onerror(data.error);
      case 'error':     return console.log(data);
      //case 'webIdName': return self._setWebIdName(data.name);
      case 'webIdName': return console.log(data);
      //default:          return console.log(data);
      }
    };
    this.serviceWorker.onerror = function (error:any) {
      self.stopExecution(error);
    };
  }
  initResults(data:any) {
    console.log(data);
  }
}



class SolidConnect extends HTMLElement {
  static observedAttributes = ["color", "size"];

  _srcIDP: string;
  _source: string;
  _additionalSources: Array<string>;
  _connected: boolean;
  _userWebIdName: string;
  _welcomMessage: string;
  _enabledConnectSubmit: boolean = false;
  _logedSession: any = false;
  connectButton: HTMLButtonElement;
  userWebIdElement: HTMLElement;
  welcomElement: HTMLElement;
  idpInput: HTMLInputElement;
  sourcesInput: HTMLInputElement;
  suggestedIdpSrc: Array<string>;
  suggestedSources: Array<string>;


  constructor() {
    // Always call super first in constructor
    super();
    this.initElement()
  }
  get connected(): boolean { return this._connected; }
  set connected(value: boolean) { 
    this._connected = value; 
    if( this._connected ) {
      this.connectButton.innerText = "Disconnect";
      this.sourcesInput.disabled = false;
      this.idpInput.hidden = true;
    } else {
      this.connectButton.innerText = "Connect";
      this.sourcesInput.disabled = true;
      this.idpInput.hidden = false;
    }
  }
  get userWebIdName(): string { return this._userWebIdName; }
  set userWebIdName(value: string) {
    this._userWebIdName = value;
    this.userWebIdElement.innerText = 'Connected as '+value;
  }
  get welcomMessage(): string { return this._welcomMessage; }
  set welcomMessage(value: string) {
    this._welcomMessage = value;
    this.welcomElement.innerText = value;
  }
  get srcIDP(): string { return this._srcIDP; }
  set srcIDP(value: string) {
    this._srcIDP = value;
  }
  get source(): string { return this._source; }
  set source(value: string) {
    this._source = value;
  }
  get additionalSources(): Array<string> { return this._additionalSources; }
  set additionalSources(value: Array<string>) {
    this._additionalSources = value;
  }
  get enabledConnectSubmit(): boolean { return this._enabledConnectSubmit; }
  set enabledConnectSubmit(value: boolean) {
    this._enabledConnectSubmit = value;
    if (value === true) {
      this.connectButton.disabled = false;
    } else {
      this.connectButton.disabled = true;
    }
  }

  
  get logedSession(): any { return this._logedSession; }
  set logedSession(value: any) {
    this._logedSession = value;
  }


  initElement() {
    console.log(this) ;
    this.suggestedIdpSrc = this.getAttribute('suggest-idp-src').split(',');
    this.suggestedSources = this.getAttribute('suggest-sources').split(',');
    this.additionalSources = this.getAttribute('additional-sources').split(',');
    this.addUiUx() ;
    
    this.connected = false;
    this.initEventListners()
    this.handleRedirectAfterLogin();
    this.welcomMessage = 'Please connect to Solid';
    this.source = ''; 
  }
  addUiUx() {
    this.welcomElement = document.createElement("span");
    this.welcomElement.classList.add('welecom-text');
    this.appendChild(this.welcomElement);

    this.idpInput = document.createElement("input");
    this.idpInput.setAttribute('type', 'text');
    this.idpInput.setAttribute('placeholder', 'Enter IDP Url');
    this.idpInput.setAttribute('list', 'datalistIdp');
    this.idpInput.classList.add('src-idp');
    this.appendChild(this.idpInput);

    let datalistIdp = document.createElement("datalist");
    datalistIdp.setAttribute('id', 'datalistIdp');
    for (let idp of this.suggestedIdpSrc) {
      let option = document.createElement("option");
      option.value = idp;
      datalistIdp.appendChild(option);
    }
    this.appendChild(datalistIdp);

    //Tagify
    this.sourcesInput = document.createElement("input");
    this.sourcesInput.setAttribute('type', 'text');
    this.sourcesInput.disabled = true;
    this.sourcesInput.setAttribute('placeholder', 'Enter Source Url');
    this.sourcesInput.setAttribute('name', 'data-sources');
    this.sourcesInput.setAttribute('list', 'datalistSources');
    this.sourcesInput.classList.add('data-sources');
    this.appendChild(this.sourcesInput);
    /*var tagify = new Tagify(this.sourcesInput, {
      // A list of possible tags. This setting is optional if you want to allow
      // any possible tag to be added without suggesting any to the user.
      whitelist: []
    });
    tagify.setPlaceholder('Enter sources Urls');*/

    let datalistSources = document.createElement("datalist");
    datalistSources.setAttribute('id', 'datalistSources');
    for (let source of this.suggestedSources) {
      let option = document.createElement("option");
      option.value = source;
      datalistSources.appendChild(option);
    }
    this.appendChild(datalistSources);
    

    this.userWebIdElement = document.createElement("span");
    this.userWebIdElement.classList.add('user-webId-name');
    this.appendChild(this.userWebIdElement);

    this.connectButton = document.createElement("button");
    this.connectButton.classList.add('connect-idp');
    this.connectButton.disabled = true;
    this.appendChild(this.connectButton);
  }

  initEventListners() {
    this.connectButton.addEventListener('click', () => {
      console.log('clicked') ;
      this.srcIDP = this.idpInput.value;
      this.loginToSelectedIdP();
    });
    
    this.idpInput.addEventListener("change", (event:any) => {
      console.log(this.isValidUrl(event.target.value as string)) ;
      if (this.isValidUrl(event.target.value as string)) {
        this.enabledConnectSubmit = true ;
      } else {
        this.enabledConnectSubmit = false; 
      }
    });

    this.sourcesInput.addEventListener("change", (event:any) => {
      console.log(this.isValidUrl(event.target.value as string)) ;
      if (this.isValidUrl(event.target.value as string)) {
        this.source = event.target.value as string;
      } else {
        this.source = ''; 
      }
    });
  }

  loginToSelectedIdP() {
    const SELECTED_IDP = this.srcIDP;
    sessionStorage.setItem("SELECTED_IDP", SELECTED_IDP);
  
    return login({
      oidcIssuer: SELECTED_IDP,
      redirectUrl: new URL("", window.location.href).toString(),
      clientName: "SpOTy test"
    });
  }

  async handleRedirectAfterLogin() {

    /*await handleIncomingRedirect({
      url: new URL("/", window.location.href).toString()+`dev-page/`,
      restorePreviousSession: true,
    }).then((info) => {
      console.log(`Logged in with WebID [${info.webId}]`);
    }).catch((e) => {
      console.error("Failed to log in", e);
    });*/

    await handleIncomingRedirect(); // no-op if not part of login redirect
  
    const session = getDefaultSession();
    if (session.info.isLoggedIn) {

      this.connected = true;
      console.log(session.info) ;
      var res = session.info.webId.split("/");
      this.welcomMessage = '' ;
      this.userWebIdName = res[(res.length - 1)];
      this.enabledConnectSubmit = true;
      this.srcIDP = sessionStorage.getItem("SELECTED_IDP") ;
      this.idpInput.value = this.srcIDP ;
      //this.userWebIdName = session.info.webId.replace(this.srcIDP+'/', '') ;
      // Update the page with the status.
      //document.getElementById("myWebID").value = session.info.webId;
  
      // Enable Read button to read Pod URL
      //buttonRead.removeAttribute("disabled");
      
      //testSparqlQuery(session);

      this.logedSession = session;
    } else {
      this.logedSession = false;
    }
  }
  

  connectedCallback() {
    console.log("Custom element added to page.");
  }

  disconnectedCallback() {
    console.log("Custom element removed from page.");
  }

  adoptedCallback() {
    console.log("Custom element moved to new page.");
  }

  attributeChangedCallback(name:any, oldValu:any, newValue:any) {
    console.log(`Attribute ${name} has changed.`);
  }

  isValidUrl(urlString:string) {
    let url;
    try { 
          url =new URL(urlString); 
    }
    catch(e){ 
      return false; 
    }
    return url.protocol === "http:" || url.protocol === "https:";
}
}


customElements.define("solid-connect", SolidConnect);
customElements.define("solid-query-ui", SolidQueryUi);