var doT = require('dot');
var fs = require('fs');

var _cache = {};
var  layoutStr = '';
var  viewsDir;
var Def = function(){};
Def.prototype = {
  load: function( pathToFile ){
    var text;
    text = fs.readFileSync(viewsDir + '/' + pathToFile, 'utf8');
    return text;
  },
  sayHello: function(str){
    return 'hello {{='+str+'}}';
  }
};
// var  _def = {
//   load: function( pathToFile ){
//     var text;
//     text = fs.readFileSync(viewsDir + '/' + pathToFile, 'utf8');
//     return text;
//   },
//   sayHello: function(str){
//     console.log(str);
//     return 'hellfo'+str;
//   }
// };

function _renderFile(filename, options, cb){
  // options.cache = options.settings.cache;
  var templateFunc = _cache[filename];
  if(templateFunc){
    return cb(null,templateFunc(options));
  }
  return fs.readFile(filename, 'utf8', function(err, str){
    if(err)  return cb(err);
    var templateStr = str + layoutStr;
    var _def = new Def();
    templateFunc = doT.template(templateStr, null, _def);
    if( options.cache ) _cache[filename] = templateFunc;
    return cb(null, templateFunc(options));
  });
}

exports.__express = function(filename, options, cb){
  'use strict';
  if (!viewsDir) viewsDir = this.root;
  console.log(this);
  cb = (typeof cb === 'function') ? cb : function(){};
  if (options.layout !==undefined && !options.layout){
    return _renderFile(filename, options, cb);
  }
  var layoutFile =  viewsDir + '/' + ( options.layout || 'base/base' ) + this.ext;
  layoutStr =  _cache[options.layout || 'base/base'] || '';
  if ( layoutStr  )  return _renderFile(filename, options, cb);
  return fs.readFile(layoutFile, 'utf8', function(err, str){
    if(err)  return cb(err);
    layoutStr = _cache[layoutFile] = str;
    return _renderFile(filename, options, cb);
  });
};
