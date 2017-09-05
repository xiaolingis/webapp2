 
/*
 Map browser based on OpenLayers 4. 
 configuration support. 
 
 Copyright (C) 2017 Øyvind Hanssen, LA7ECA, ohanssen@acm.org
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published 
 by the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/** @namespace */
var pol = pol || {};
pol.core = pol.core || {};
pol.widget = pol.widget || {};
pol.ui = pol.ui || {};
pol.mapref = pol.mapref || {};

console.assert = console.assert || function() {};




/** 
 *  @classdesc 
 *  Configuration of map browser application.
 *  @constructor 
 *  @param {string} uid - Identifier of configuration (see also setUid).
 */

pol.core.Config = function(uid) {
   this.uid = (uid ? uid : "0");
   this.mb = null;
   this.storage = window.localStorage;
   this.sstorage = window.sessionStorage;
   this.baseLayers = [];
   this.oLayers = [];
   this.oLayersCount = 0;
   this.aMaps = new Array(); 
   this.styles = {};
   this.server = null;
   
   this.props = {
      projection: "EPSG:900913",
      center: [0,0]
   }
}
ol.inherits(pol.core.Config, ol.Object);



/**  
 * Get array of configured base layers. 
 */

pol.core.Config.prototype.getBaseLayers = function()
   { return this.baseLayers; }
   

   
/**  
 * Get array of configured overlay layers. 
 */

pol.core.Config.prototype.getOLayers = function()
   { return this.oLayers; }

   
   
/**
 * Add to the configured list of layers. 
 * @param {Layer} layer to be added.
 * @param {String|undefined} Name/decription to be used in layer switcher.
 * @returns Index of new layer. 
 */

pol.core.Config.prototype.addLayer = function(layer, name) 
{
  console.assert(layer != null, "Assertion failed");
  if (name && name != null) 
       layer.set("name", name);
  if (!layer.predicate) 
       layer.predicate = function() {return true;}
  return this.oLayers.push(layer) - 1;
}



   
pol.core.Config.prototype.removeLayer = function(layer) 
{
  console.assert(layer != null, "Assertion failed");
  for (i in this.oLayers)
    if (this.oLayers[i] === layer) {
        this.oLayers.splice(i, 1);
	    return;
    }
}



   
/**
 *  Set an id to distinguish between different users or sessions 
 *  when using local-storage to store config-values persistently.
 *  @param {string} uid - Identifier. 
 * 
 */
pol.core.Config.prototype.setUid = function(uid)
   { this.uid = uid; }

   
   
   
/**
 *  Get a setting. If stored in browser local storage (store method) return this. 
 *  If not, return the default setting (see set method). 
 *  @param {string} id - key of setting. 
 *  @returns The value of the setting.
 */
pol.core.Config.prototype.get = function(id)
{ 
    console.assert(id!=null, "Assertion failed");
    
    /* Look in session-storage first, if not found there, 
     * look in local-storage. 
     */
    var data = this.sstorage["polaric."+id]; 
    if (data == null)
       data = this.storage["polaric."+id + ":" + this.uid];
    
    var x = (data ? JSON.parse(data) : null );
    if (x==null && this.props[id] != null) 
        return this.props[id]; 
    return x;
}



/**
 *  Store value in browser session storage. To be used in application.
 *  If save=true, value will be persistent between browser sessions
 *  (saved in local-storage). 
 *  @param {string} id - Key of setting.
 *  @param {*} value - Value of setting. 
 *  @param {boolean|undefined} save - Set to true to make setting persistent.
 * 
 */
pol.core.Config.prototype.store = function(id, value, save)
{ 
    console.assert(id != null && value != null, "Assertion failed"); 
    var val = JSON.stringify(value);
    this.sstorage["polaric." + id] = val; 
    if (save)
       this.storage["polaric." + id + ":" + this.uid] = val;
}



/** 
 *  Remove value from session/local storage. 
 * @param {string} id - Key of setting. 
 */

pol.core.Config.prototype.remove = function(id)
{
    this.sstorage.removeItem("polaric."+id);
    this.storage.removeItem("polaric."+id+":"+this.uid);
}

   
   
/**
 *  Set a config value. Used as default setting. To be used in config file. 
 *  @param {string} id - Key of setting. 
 *  @param {*} value - Value of setting 
 * 
 */
pol.core.Config.prototype.set = function(id, value)
{ 
    console.assert(id != null && value != null, "Assertion failed");
    this.props[id] = value; 
}


   
 
