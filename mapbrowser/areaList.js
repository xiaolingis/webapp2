/*
 Map browser based on OpenLayers 4. 
 
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



/**
 * @classdesc
 * User defined areas (in a popup window). 
 * @constructor
 */
polaric.AreaList = function() {
   polaric.Widget.call(this);
   this.classname = "polaric.AreaList"; 
   this.myAreas = [];
   var t = this;

   this.widget = {
     view: function() {
        var i=0;
        return m("div", [       
            m("h1", "My map areas"),  
            m("table.mapAreas", t.myAreas.map(function(x) {
                return m("tr", [
                   m("td", m("img", {src:"images/edit-delete.png", onclick: handler(removeArea, i) })), 
                   m("td", m("img", {src:"images/edit.png", onclick: handler(editArea, i) })),
                   m("td", {onclick: handler(gotoExtent, i++) }, x.name) ]);
             })),
             m(textInput, {id:"editArea", value: t.currName, size: 16, maxLength:30, regex: /^[^\<\>\'\"]+$/i }),
             m("button", {onclick: add}, "Add")
        ])
      }
   };
   
   function handler(f, id) {return function() {f(id); }};  
   
   function removeArea(id) {
       t.myAreas.splice(id,1);
   }
   
   function editArea(id) {
       gotoExtent(id);
       $("#editArea").val(t.myAreas[id].name);
       $("#editArea").change();
       t.myAreas.splice(id,1);
       m.redraw();
   }
   
   function add() {
       t.myAreas.push(
         {name: $("#editArea").val(), extent: CONFIG.mb.getExtent()});
   }
   
   function gotoExtent(id) {
       var ext = t.myAreas[id].extent; 
       if (ext && ext != null) 
          CONFIG.mb.fitExtent(ext); 
   }
   
}
ol.inherits(polaric.AreaList, polaric.Widget);




widget.setRestoreFunc("polaric.AreaList", function(id, pos) {
    var x = new polaric.AreaList(); 
    x.activatePopup(id, pos, true); 
}); 
