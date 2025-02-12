import "./assets/stylesheets/index.scss";
import "@yaireo/tagify/dist/tagify.css";

import { QueryEngine } from 'spoty-query-engine';

if (typeof global.process === 'undefined')
  global.process = require('process');

import {
    login,
    handleIncomingRedirect,
    getDefaultSession,
    fetch,
    Session
  } from "@inrupt/solid-client-authn-browser";

const myEngine = new QueryEngine();
console.log(myEngine) ;
async function timer(ms:any) { return new Promise(res => setTimeout(res, ms)); }
(<any>window).podQueryEngine = async function (sparql:string, session:any, podUrl:any) {
 
  console.log('Query launched with :'+ sparql);
  console.log(session);
  
  const loggingFetch = async (input:any, init:any) => {
    console.log(`Requesting ${input} with ${JSON.stringify(init, null, 2)}`);
    const response = await session.fetch(input, init);
    console.log(`Got response ${JSON.stringify(response)}`);
    return response;
  }

  console.log(podUrl) ;
	const bindingsStream = await myEngine.query(sparql, {
	  sources: 
      podUrl, 
      //'https://w3id.org/SpOTy/languages',
        //'https://w3id.org/SpOTy/ontology',
         //'https://solid.champin.net/pa/public/spoty/ontology',
        //'https://solid.champin.net/pa/public/spoty/languages'
        //{ type: 'file', value: 'https://solid.champin.net/pa/spoty/ontology' },
        //{ type: 'file', value: 'https://solid.champin.net/pa/spoty/languages' },
      
      fetch: loggingFetch,
      lenient: true,
      '@comunica/actor-rdf-resolve-hypermedia-links-traverse:traverse': true,
      //'@comunica/actor-rdf-resolve-hypermedia-links-traverse:traverse': true,
      '@comunica/actor-http-inrupt-solid-client-authn:session': session,
	});
  const { data } = await myEngine.resultToString(bindingsStream, 'application/sparql-results+json');
    console.log(await data) ;
  
  var onQueryProcess = true;
  var results:any = [] ;
  let results_string = '' ;


  data.on('data', (binding:any) => {
    console.log(binding.toString()) ;
	    //console.log(JSON.parse(binding.toString())) ; // Quick way to print bindings for testing
      results_string = results_string + binding.toString();

	});

	data.on('end', () => {
	    // The data-listener will not be called anymore once we get here.
      results = JSON.parse(results_string);
      console.log(results);
	    console.log("Query execution has ended !");
      onQueryProcess = false;
	});

	data.on('error', (error:any) => {
	    console.error(error);
	});
  

  

  for(var start = 1; onQueryProcess; start++) {
    console.log('waiting results...');
    if (onQueryProcess ) {
    await timer(3000);

    }
  }

  return results ;
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

  get allSources(): Array<string> { return [this._source].concat(this._additionalSources ); }


  initElement() {
    console.log(this) ;
    this.suggestedIdpSrc = this.getAttribute('suggest-idp-src').split(',');
    this.suggestedSources = this.getAttribute('suggest-sources').split(',');
    this.additionalSources = this.getAttribute('additional-sources').split(',').filter(r => r !== '');
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
    
    this.sourcesInput = document.createElement("input");
    this.sourcesInput.setAttribute('type', 'text');
    this.sourcesInput.disabled = true;
    this.sourcesInput.setAttribute('placeholder', 'Enter Source Url');
    this.sourcesInput.setAttribute('name', 'data-sources');
    this.sourcesInput.setAttribute('list', 'datalistSources');
    this.sourcesInput.classList.add('data-sources');
    this.appendChild(this.sourcesInput);

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