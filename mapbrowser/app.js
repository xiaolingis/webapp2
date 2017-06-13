/*
 Map browser based on OpenLayers 4. 
 Misc. generic application stuff. 
 
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
 * Reference search in a popup window. 
 */
polaric.refSearch = function()
{
    var widget = {
     view: function() {
        return m("div", [       
            m("h1", "Show reference on map"),
            m("form.mapref", [  
               m("span.sleftlab", {title: "MGRS 100x100m square"}, "MGRS ref: "), 
               m(mgrsInput),
               m("input#butt_mgrs", {type: "button", value: "Find"}), hr,
              
               m("span.sleftlab", "UTM ref: "),
               m(utmInput), 
               m("input#butt_utm", {type: "button", value: "Find", style: "margin-right:3.5em"}), hr,
	       
	           m("span.sleftlab", "LatLong: "),
	           m(latLngInput),
	           m("input#butt_ll", {type: "button", value: "Find"})
            ])
        ])
      }
   };


   var x = browser.gui.showPopup( {
     vnode: widget,
     pixPos: [50,70],
     draggable: true,
     dragStop: dragStop,
     id: "refSearch"
   });  
   
   browser.map.on('moveend', function() { m.redraw();});

   
   setTimeout(function() 
   {
      $('#butt_mgrs').click( function() {
              var pos = polaric.parseMGRS(browser, $('#mgrsprefix').val(), $('#locx').val(), $('#locy').val());
              browser.goto_Pos(pos, true);
           });
      
      $('#butt_utm').click( function() {
              var pos = polaric.parseUTM( $('#utmx').val(), $('#utmy').val(), $('#utmnz').val(), $('#utmz').val());
              browser.goto_Pos(pos, true);
           });
      
      $('#butt_ll').click( function() {
              var lat_sign = ( $("ll_NS").html=="N" ? "" : "-");
              var lng_sign = ( $("ll_EW").html=="E" ? "" : "-");
              var pos = polaric.parseDM(
                  lat_sign+$('#ll_Nd').val(), $('#ll_Nm').val(), 
                  lng_sign+$('#ll_Ed').val(), $('#ll_Em').val());
              browser.goto_Pos(pos, true );
           });
   }, 1000);
   
   
   
   function dragStop( event, ui ) {
      console.log("DRAG STOP: x="+ui.position.left+", y="+ui.position.top);
   }

}

