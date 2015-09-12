var path = require('path');
var composable_middleware = require( 'composable-middleware' );
var express = require('express');
var log = require('../utils/log');
var apps = require('../utils/apps');
var _ = require( 'lodash' );


module.exports = function(options){
	var mw = composable_middleware();

	var router = express.Router();

	router.all('/:appName?',function(req,res,next){
		var appName = req.params.appName || options.homeAppName;
		
		options.req = req;
		options.res = res;

		apps.load(appName,options).then(function(appRes){
			res.send(appRes);
		}).catch(function(){
			log.debug('app "'+appName+'" module or template not found. loading 404.');
			apps.load(options.notFoundAppName,options).then(function(appRes){
				res.send(appRes);
			}).catch(function(){
				log.debug('404 app not found. responding plain status');
				res.status(404).end();
			})
		});
	});

	router.get('/:appName/client.js',function(req,res,next){
		apps.loadClient(req.params.appName,options).then(function(script){
			res.end(script);
		}).catch(function(err){
			res.status(404).send(err);
		});
	});

	router.get('/:appName/styles.css',function(req,res,next){
		apps.loadStylesheet(req.params.appName,options).then(function(css){
			res.end(css);
		}).catch(function(err){
			res.status(404).send(err);
		});
	});

	mw.use(router);

	mw.use(function(req,res,next){
		log.debug('apps middleware')
		next();
	})

	return mw;
}