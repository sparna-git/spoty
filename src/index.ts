
import "./assets/stylesheets/index.scss";
import "@yaireo/tagify/dist/tagify.css";

var Tagify = require('@yaireo/tagify');

//import {LoggerPretty} from "@comunica/logger-pretty";

//import { QueryEngine } from '@comunica/query-sparql-solid';
//import { QueryEngine } from '@comunica/query-sparql-link-traversal-solid';
//import { QueryEngine } from '@comunica/query-sparql-link-traversal-solid';
//import { QueryEngine } from '../custom_package_v2';
//import { QueryEngine } from '../engine-default';
//import { QueryEngine } from '@comunica/query-sparql';

var RdfString = require('rdf-string');
var resolve = require('relative-to-absolute-iri').resolve;
var solidAuth = require('@rubensworks/solid-client-authn-browser');
if (typeof global.process === 'undefined')
  global.process = require('process');

import {
    login,
    handleIncomingRedirect,
    getDefaultSession,
    fetch,
    Session
  } from "@rubensworks/solid-client-authn-browser";

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

  declare global {
    interface Window {
        Comunica:any;
    }
}
let Comunica = window.Comunica; // ok now
  const buttonLogin:any = document.querySelector("#btnLogin");
  const buttonLaunch:any = document.querySelector("#btnLaunch");
  const textareaQuery:any = document.querySelector("#query");
  let queryui:any = null ;
  
    // Query to test a join between POD & ontology
/**/
    textareaQuery.value = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?Token_1 ?Token_1_label WHERE {
  ?Token_1 rdf:type <https://w3id.org/SpOTy/ontology#Token>.
  OPTIONAL { ?Token_1 <https://w3id.org/SpOTy/ontology#ttranscription> ?Token_1_label. }
  ?Token_1 <https://w3id.org/SpOTy/ontology#semantics> ?Semantics_2.
  ?Semantics_2 rdf:type <http://www.w3.org/2004/02/skos/core#Concept>;
    <https://w3id.org/SpOTy/ontology#code> "O".
}
LIMIT 1
`


    // Query that works on POD content only
/*
textareaQuery.value = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?Token_1 ?Token_1_label WHERE {
  ?Token_1 rdf:type <https://w3id.org/SpOTy/ontology#Token>.
  OPTIONAL { ?Token_1 <https://w3id.org/SpOTy/ontology#ttranscription> ?Token_1_label. }
}
LIMIT 100
`*/


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
      
      //testSparqlQuery(session);
      initClassLdfQueryUI(textareaQuery, session)
    }
  }
  //handleRedirectAfterLogin();

  
  buttonLogin.onclick = function () {
    loginToSelectedIdP();
  };
  buttonLaunch.onclick = function () {
    let session:Session =getDefaultSession();
    console.log('session -----') ;
    console.log(session) ;
    //testSparqlQuery(session);
    playLdfQueryUI(textareaQuery.value)   ;
  };

  function initClassLdfQueryUI(textareaQuery:any, session:any) {

    queryui = new (LdfQueryUI as any)(textareaQuery, null, session) ;
    queryui._create();
    queryui._startExecution();
  }
  function playLdfQueryUI(textareaQuery:any) {

    queryui._changeQuery(textareaQuery) ;
    queryui._startExecution();
  }

  async function testSparqlQuery(session:Session) {



    /*let myEngine = new QueryEngine();
    console.log(textareaQuery.value) ;
    console.log(window.Comunica)
    //let bindingsStream = await new Comunica.QueryEngine().queryBindings(textareaQuery.value, {
    let bindingsStream = await myEngine.queryBindings(textareaQuery.value, {
    sources: [
        //session.info.webId,
        'https://solid.champin.net/pa/spoty/', 
        //'https://localhost:8443/spoty/',
        // POD de Thomas
        // 'https://storage.inrupt.com/fa747398-3bdd-4c3b-be0e-a646ac9f71f2/',
        //'https://w3id.org/SpOTy/ontology',
        'https://w3id.org/SpOTy/languages',
        //'https://perso.liris.cnrs.fr/pierre-antoine.champin/2023/SpOTy/ontology',
        { type: 'file', value: 'https://w3id.org/SpOTy/ontology' },
        //{ type: 'file', value: 'https://w3id.org/SpOTy/languages' },
    ],
    //lenient: true,
    // Pass the authenticated fetch function
    fetch: session.fetch,
      '@comunica/actor-http-inrupt-solid-client-authn:session': session,
    });





    // Consume results as a stream (best performance)
    bindingsStream.on('data', (binding:any) => {
      console.log(binding.toString()); // Quick way to print bindings for testing

    });
    bindingsStream.on('end', () => {
      // The data-listener will not be called anymore once we get here.
      console.log('end query results'); 
    });
    bindingsStream.on('error', (error:any) => {
      console.error(error);
    });*/
  }
  const LdfQueryUI = function ($element:any, options:any, session:any) {

    // Create the query execution Web Worker
    this._createQueryWorker();
  }

  LdfQueryUI.prototype = {
// Default widget options
    options: {
      datasources: [],
      queries: [],
      prefixes: [],
      queryContext: '',
      resultsToTree: false,
      queryFormat: 'sparql',
      httpProxy: false
    },

    session: null,

    _changeQuery: function(query:any) {
      this.sparqlQuery = query ;
    },
    

    // Initializes the widget
    _create: function () {
      var self = this,
          options = this.options,
          $element = this.element,
          $stop = this.$stop = document.querySelector('.stop'),
          $start = this.$start = document.querySelector('.start'),
          $queryTexts = document.querySelector('.querytext'),
          $queryContexts = document.querySelector('.querycontext'),
          $queryResultsToTrees = document.querySelector('.results-to-tree'),
          $queryTextsIndexed = this.$queryTextsIndexed = {},
          $queryContextsIndexed = this.$queryContextsIndexed = {},
          $queryResultsToTreesIndexed = this.$queryResultsToTreesIndexed = {},
          $queries = document.querySelector("#query"),
          $log = document.querySelector('.log'),
          $results = document.querySelector('.results'),
          $resultsText = document.createElement("div"),
          $datasources = [
          'https://solid.champin.net/pa/spoty/', 
            'https://w3id.org/SpOTy/languages',
            'https://w3id.org/SpOTy/ontology'
          ],
          
          $bypassCache = this.$bypassCache = false,
          $solidIdp = 'https://login.inrupt.com',
          $showDetails = true;
          this.$details = document.createElement('div');
          this.session = getDefaultSession() ;

          this.sparqlQuery = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?Token_1 ?Token_1_label WHERE {
  ?Token_1 rdf:type <https://w3id.org/SpOTy/ontology#Token>.
  OPTIONAL { ?Token_1 <https://w3id.org/SpOTy/ontology#ttranscription> ?Token_1_label. }
}
LIMIT 100
          `; 

          console.log(this.session) ;

      // Replace non-existing elements by an empty text box
      this.datasources = $datasources;
      /*if (!$results.length) $results = document.createElement("div");
      if (!$log.length) $log = document.createElement("div");*/

      $results.append($resultsText);
      //this._resultsScroller = new FastScroller($results, renderResult);
      this._resultAppender = appenderFor($results);
      this._logAppender = appenderFor($log);
      this.$timing = document.querySelector('.timing');


      
      const $solidSession = this.$solidSession = this.session;
      this._createQueryWorkerSessionHandler();
      this._queryWorker.postMessage({
        type: 'getWebIdName',
        webId: $solidSession.info.webId,
        context: self._getQueryContext(),
      });
      
      /*$solidSession.handleIncomingRedirect({
        url: window.location.href,
        restorePreviousSession: false,
      })
      .then(() => {
       
        if ($solidSession.info.isLoggedIn) {
          
          self._setWebIdName();


          // Request the user's name from the worker
          this._queryWorker.postMessage({
            type: 'getWebIdName',
            webId: $solidSession.info.webId,
            context: self._getQueryContext(),
          });
        } else {
          
          
        }
      });*/

    },   

    // Set the name inside the WebID field, or a shortened version of the WebID URL if name is undefined
    _setWebIdName: function (name:any) {
      
    }, 
    
    _createQueryWorkerSessionHandler: function () {
      if (this.$solidSession)
        this._queryWorkerSessionHandler = new solidAuth.WindowToWorkerHandler(this, this._queryWorker, this.$solidSession);
    },

    // Starts query execution
    _startExecution: function () {
      var datasources = this.datasources || [];
      if (!datasources.length && !this.$allowNoSources)
        return alert('Please choose a datasource to execute the query.');


      // Clear results and log
      /*this.$stop.show();
      this.$start.hide();*/
      //this._resultsScroller.removeAll();
      this._resultAppender.clear();
      this._logAppender.clear();

      // Reset worker if we want to bypass the cache
      if (this.options.bypassCache)
        this._stopExecutionForcefully();

      // Scroll page to the results
      //$('html,body').animate({ scrollTop: this.$stop.offset().top });

      // Start the timer
      this._resultCount = 0;
      //this._startTimer();

      // Let the worker execute the query
      var context = {
        ...this._getQueryContext(),
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
      };
      /*var prefixesString = '';
      if (this.options.queryFormat === 'sparql') {
        for (var prefix in this.options.prefixes)
          prefixesString += 'PREFIX ' + prefix + ': <' + this.options.prefixes[prefix] + '>\n';
      }*/

      this._queryWorker.postMessage({
        type: 'query',
        query: this.sparqlQuery,
        context: context,
        resultsToTree: false,
      });
    },

    _getQueryContext: function () {
      var context = {
        ...(this.$contextDefault || {}),
        datetime: parseDate(this.options.datetime),
        queryFormat: this.options.queryFormat,
        httpProxy: this.options.httpProxy,
        workerSolidAuth: !!this.$solidSession,
      };
      if (this.options.queryContext) {
        try {
          var queryContextObject = JSON.parse(this.options.queryContext);
          Object.assign(context, queryContextObject);
        }
        catch (e) {
          this._resultAppender(e.message + '\n');
        }
      }
      return context;
    },

    // Stops query execution forcefully
    _stopExecutionForcefully: function (error:any) {
      // Kill the worker and restart
      this._queryWorker.terminate();
      this._createQueryWorker();
      this._createQueryWorkerSessionHandler();

      this._stopExecutionBase(error);
    },

    _stopExecutionBase: function (error:any) {
      // Stop the timer
      //this._stopTimer();

      // Reset the UI

      if (error && error.message)
        this._resultAppender('# ' + error.message);
      this._resultAppender.flush();
      this._logAppender.flush();
      this._writeResult = this._writeEnd = null;
    },

    _stopExecution: function (error:any) {
      // Stop the worker
      this._queryWorker.postMessage({ type: 'stop' });

      this._stopExecutionBase(error);
    },
    
    _createQueryWorker: function () {
      var self = this;
      //this._queryWorker = new Worker('assets/js/ldf-client-worker_v2.js');
      this._queryWorker = new Worker('assets/js/ldf-client-worker.min.js?v=1');
      this._queryWorkerSessionHandler = undefined;
      this._queryWorker.onmessage = function (message:any) {
        if (self._queryWorkerSessionHandler && self._queryWorkerSessionHandler.onmessage(message))
          return;

        var data = message.data;
        switch (data.type) {
        //case 'queryInfo': return self._initResults(data.queryType);
        case 'queryInfo': return console.log(data);
        //case 'result':    return self._addResult(data.result);
        case 'result':    return console.log(data);
        case 'end':       return self._endResults();
        //case 'log':       return self._logAppender(data.log);
        //case 'log':       return console.log(data);
        //case 'error':     return this.onerror(data.error);
        case 'error':     return console.log(data);
        //case 'webIdName': return self._setWebIdName(data.name);
        case 'webIdName': return console.log(data);
        //default:          return console.log(data);
        }
      };
      this._queryWorker.onerror = function (error:any) {
        self._stopExecution(error);
      };
    },

    
    // Initializes the result display, depending on the query type
    _initResults: function (queryType:any) {
      var resultAppender = this._resultAppender;
      switch (queryType) {
      // For SELECT queries, add the rows to the result
      case 'bindings':
        this._writeResult = function (row:any) {
          let render_result = renderResult(row) ;
          //this._resultsScroller.addContent([row]);
          this._resultAppender(render_result) ;
          console.log('bindings row') ;
          console.log(row) ;
        };
        this._writeEnd = function () {
          if (!this._resultCount)
            resultAppender('This query has no results.');
        };
        break;
      // For CONSTRUCT and DESCRIBE queries,
      // write a Turtle representation of the triples
      /*case 'quads':
        var streamWriter = new N3.StreamWriter(this.options)
          .on('data', resultAppender)
          .on('error', (err) => { throw err; });
        this._writeResult = function (triple) { streamWriter.write(RdfString.stringQuadToQuad(triple)); };
        this._writeEnd = function () { streamWriter.end(); };
        break;
      // For ASK queries, write whether an answer exists
      case 'boolean':
        this._writeResult = function (exists) { resultAppender(exists); };
        this._writeEnd = $.noop;
        break;*/
      // Other queries cannot be displayed
      default:
        resultAppender(queryType + ' queries are unsupported.');
      }
    },

    // Adds a result to the display
    _addResult: function (result:any) {
      if (this._writeResult) {
        this._resultCount++;
        this._writeResult(result);

      }
    },
    
    // Finalizes the display after all results have been added
    _endResults: function () {
      if (this._writeEnd) {
        this._writeEnd();
        this._stopExecution();
      }
    },
};
  // Creates a function that appends text to the given element in a throttled way
  function appenderFor($element:any ) {
    var buffer:any, allowedAppends:any, timeout:any, delay = 100;
    // Resets the element
    function clear() {
      buffer = '';
      $element.innerHtml = '';
      allowedAppends = 50;
      clearTimeout(timeout);
    }
    clear();
    // Appends the text to the element, or queues it for appending
    function append(text:any) {
      // Append directly if still allowed
      if (allowedAppends > 0) {
        $element.append(text);
        // When no longer allowed, re-enable appending after a delay
        if (--allowedAppends === 0)
          timeout = setTimeout(flush, delay);
      }
      // Otherwise, queue for appending
      else
        buffer += text;
    }
    // Writes buffered text and re-enables appending
    function flush() {
      // Clear timeout in case flush was explicitly triggered
      clearTimeout(timeout);
      timeout = null;
      // Re-enable appending right away if no text was queued
      if (!buffer)
        allowedAppends = 1;
      // Otherwise, append queued text and wait to re-enable
      else {
        $element.append(escape(buffer));
        buffer = '';
        timeout = setTimeout(flush, delay);
      }
    }
    // Export the append function
    append.clear = clear;
    append.flush = flush;
    return append;
  }

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

  // Transforms a result row into an HTML element
  function renderResult(row:any, container:any = false) {
    let container_a = document.createElement("div").appendChild(document.createElement("dl")) as any;
    console.log(row) ;
    Object.entries(row).map(function (value:any, variable:any) {
      let dt = document.createElement("dt") ;
      dt.innerText = variable
      let dd = document.createElement("dd") ;
      dd.innerText = escape(value)  ;
        container_a.appendChild(dt);
        container_a.appendChild(dd);

    });
    return container_a;
  }

  // Shortens an URL to the given length
  function shortenUrl(url:any, length:any) {
    if (url.length > length)
      return '&hellip;' + url.slice(url.length - length, url.length);
    return url;
  }
/*
// Consume results as an array (easier)
const bindings = await bindingsStream.toArray();
console.log(bindings[0].get('s').value);
console.log(bindings[0].get('s').termType);

*/

class SolidConnect extends HTMLElement {
  static observedAttributes = ["color", "size"];

  _srcIDP: string;
  _connected: boolean;
  _userWebIdName: string;
  _welcomMessage: string;
  _enabledConnectSubmit: boolean = false;
  connectButton: HTMLButtonElement;
  userWebIdElement: HTMLElement;
  welcomElement: HTMLElement;
  idpInput: HTMLInputElement;
  sourcesInput: HTMLInputElement;
  suggestedIdpSrc: Array<string>;


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
    } else {
      this.connectButton.innerText = "Connect";
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
  get enabledConnectSubmit(): boolean { return this._enabledConnectSubmit; }
  set enabledConnectSubmit(value: boolean) {
    this._enabledConnectSubmit = value;
    if (value === true) {
      this.connectButton.disabled = false;
    } else {
      this.connectButton.disabled = true;
    }
  }


  initElement() {
    console.log(this) ;
    this.suggestedIdpSrc = this.getAttribute('suggest-idp-src').split(',');
    this.addUiUx() ;
    
    this.connected = false;
    this.initEventListners()
    this.handleRedirectAfterLogin();
    this.welcomMessage = 'Please connect to Solid';
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
    this.sourcesInput.setAttribute('name', 'data-sources');
    this.sourcesInput.classList.add('data-sources');
    this.appendChild(this.sourcesInput);
    var tagify = new Tagify(this.sourcesInput, {
      // A list of possible tags. This setting is optional if you want to allow
      // any possible tag to be added without suggesting any to the user.
      whitelist: []
    });
    tagify.setPlaceholder('Enter sources Urls');

    this.connectButton = document.createElement("button");
    this.connectButton.classList.add('connect-idp');
    this.connectButton.disabled = true;
    this.appendChild(this.connectButton);
    this.userWebIdElement = document.createElement("span");
    this.userWebIdElement.classList.add('user-webId-name');
    this.appendChild(this.userWebIdElement);
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
  }

  loginToSelectedIdP() {
    const SELECTED_IDP = this.srcIDP;
    sessionStorage.setItem("SELECTED_IDP", SELECTED_IDP);
  
    return login({
      oidcIssuer: SELECTED_IDP,
      redirectUrl: new URL("/", window.location.href).toString()+`dev-page/`,
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
      initClassLdfQueryUI(textareaQuery, session)
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