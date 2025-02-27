var engine = null;
var RdfString = require('rdf-string');
var LoggerPretty = require('@comunica/logger-pretty').LoggerPretty;
var bindingsStreamToGraphQl = require('@comunica/actor-query-result-serialize-tree').bindingsStreamToGraphQl;
var ProxyHandlerStatic = require('@comunica/actor-http-proxy').ProxyHandlerStatic;
var WorkerToWindowHandler = require('@rubensworks/solid-client-authn-browser').WorkerToWindowHandler;
//var WorkerToWindowHandler = require('@inrupt/solid-client-authn-browser').WorkerToWindowHandler;
var QueryEngineBase = require('@comunica/actor-init-query').QueryEngineBase;
//var QueryEngine = require('../../../query-sparql-link-traversal-solid').QueryEngine;
//var QueryEngine = require('../../../engine/lib/index-browser.js').QueryEngine;

import { QueryEngine } from 'spoty-query-engine';

// The active fragments client and the current results
var resultsIterator;

// Set up logging
var logger = new LoggerPretty({ level: 'info' });
logger.log = function (level, color, message, data) {
  postMessage({ type: 'log', log: message + '\n' });
};

console.log(self);

// Handler for authenticating fetch requests within main window
const workerToWindowHandler = new WorkerToWindowHandler(self);

function initEngine(config) {
  console.log('custom engine Worker v2') ;
  // Create an engine lazily
  if (!engine) {
    
    //engine = new QueryEngineBase(require('../../config/config-default.json'));
    //engine = new QueryEngineBase(require('spoty-query-engine'));
    engine = new QueryEngine();
    //engine = new QueryEngine();
  }
    

  // Set up a proxy handler
  /*if (config.context.httpProxy)
    config.context.httpProxyHandler = new ProxyHandlerStatic(config.context.httpProxy);*/

  // Set up authenticated fetch
  if (config.context.workerSolidAuth)
    config.context.fetch = workerToWindowHandler.buildAuthenticatedFetch();

  // Transform query format to expected structure
  if (config.context.queryFormat)
    config.context.queryFormat = { language: config.context.queryFormat };
}

// Handlers of incoming messages
var handlers = {
  // Execute the given query with the given options
  query: function (config) {
    initEngine(config);
    console.log(engine) ;
    // Create a client to fetch the fragments through HTTP
    //config.context.log = logger;
    console.log('config service worker') ;
    console.log(config);
    engine.query(config.query, config.context)
      .then(async function (result) {
        // Post query metadata
        postMessage({ type: 'queryInfo', queryType: result.resultType });

        var bindings = result.resultType === 'bindings';
        var resultsToTree = config.resultsToTree;
        switch (result.resultType) {
        case 'quads':
          resultsIterator = await result.execute();
          break;
        case 'bindings':
          resultsIterator = await result.execute();
          break;
        case 'boolean':
          result.execute().then(function (exists) {
            postMessage({ type: 'result', result: exists });
            postMessage({ type: 'end' });
          //}).catch(postError);
        }).catch(console.log(result));
          break;
        case 'void':
          result.execute().then(function () {
            postMessage({ type: 'result', result: 'Done' });
            postMessage({ type: 'end' });
          //}).catch(postError);
          }).catch(console.log(result));
          break;
        }

        if (resultsIterator) {
          if (resultsToTree) {
            bindingsStreamToGraphQl(resultsIterator, result.context, { materializeRdfJsTerms: true })
              .then(function (results) {
                (Array.isArray(results) ? results : [results]).forEach(function (result) {
                  postMessage({ type: 'result', result: { result: '\n' + JSON.stringify(result, null, '  ') } });
                });
                postMessage({ type: 'end' });
              })
              .catch(console.log(results));
              //.catch(postError);
          }
          else {
            resultsIterator.on('data', function (result) {
              console.log(result.toString());
              if (bindings)
                result = Object.fromEntries([...result].map(([key, value]) => [key.value, { value: value.value}]));
                //result = Object.fromEntries([...result].map(([key, value]) => [RdfString.termToString(key), RdfString.termToString(value)]));
              else
                result = RdfString.quadToStringQuad(result);
              postMessage({ type: 'result', result: result});
            });
            resultsIterator.on('end', function () {
              postMessage({ type: 'end' });
              console.log('end of query' ) ;
            });
            resultsIterator.on('error', postError);
            //resultsIterator.on('error', console.log(resultsIterator));
          }
        }
      //}).catch(postError);
      }).catch(console.log);
  },

  // Stop the execution of the current query
  stop: function () {
    if (resultsIterator) {
      resultsIterator.destroy();
      resultsIterator = null;
    }
  },

  // Obtain the foaf:name of a WebID
  getWebIdName: function ({ webId, context }) {
    const config = {
      query: `
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?name WHERE {
  <${webId}> foaf:name ?name.
}`,
      context: {
        ...context,
        'sources': [webId],
        // TODO: this can be removed once this issue is fixed: https://github.com/comunica/comunica/issues/950
        //'@comunica/actor-rdf-resolve-hypermedia-links-traverse:traverse': false,
      },
    };
    initEngine(config);
    config.context.log = logger;
    console.log(engine) ;
    engine.queryBindings(config.query, config.context)
      .then(function (result) {
        result.toArray({ limit: 1 })
          .then(bindings => {
            if (bindings.length > 0)
              postMessage({ type: 'webIdName', name: bindings[0].get('name').value });

            // Clear HTTP cache to make sure we re-fetch all next URL
            // TODO: this can be removed once this issue is fixed: https://github.com/comunica/comunica/issues/950
            engine.invalidateHttpCache();
          //}).catch(postError);
          }).catch(console.log);
      //}).catch(postError);
      }).catch(console.log);
  },
};

function postError(error) {
  console.log(error) ;
  error = { message: error.message || error.toString() };
  postMessage({ type: 'error', error: error });
}

// Send incoming message to the appropriate handler
self.onmessage = function (m) {
  if (workerToWindowHandler.onmessage(m))
    return;
  handlers[m.data.type](m.data);
};
