     
   var browser = new polaric.MapBrowser('map', CONFIG);


   /* Set up app specific context menus */
   browser.ctxMenu.addCallback("MAP", function(m) {
     m.add('Show map reference', function () { browser.show_MaprefPix( [m.x, m.y] ); });
     m.add(null);
     m.add('Center point', function()   { browser.view.setCenter( browser.map.getCoordinateFromPixel([m.x, m.y])); } );
     m.add('Zoom in', function()        { browser.view.setZoom(browser.view.getZoom()+1); } );
     m.add('Zoom out',  function()      { browser.view.setZoom(browser.view.getZoom()-1); } );
   });

   browser.ctxMenu.addCallback("TOOLBAR", function(m) {
     m.add('Find position', function () { show_refSearch(); });
     m.add('Blow up all', function () { alert("Boom!"); });
     m.add('Do nothing', function () { alert("What?"); });
   });
   

/*
   gui.showPopup( { html:      "Bla bla",
                    pixPos:    [400, 400],
                    geoPos:    [19, 69],
                    image:     true, 
                    draggable: true,
                    id:        "test" } );
*/




/* Autojump stuff */
var downStrokeField;
function autojump(fieldId, nextFieldId)
{
   var myField=document.getElementById(fieldId);             
   myField.nextField=document.getElementById(nextFieldId); 
   myField.onkeydown=autojump_keyDown;
   myField.onkeyup=autojump_keyUp;


   function autojump_keyDown()
   {
      this.beforeLength=this.value.length;
      downStrokeField=this;
   }


   function autojump_keyUp()
   {
      if (
       (this == downStrokeField) && 
       (this.value.length > this.beforeLength) && 
       (this.value.length >= this.maxLength)
      )
         this.nextField.focus();
      downStrokeField=null;
   }
}

/* End of autojump stuff */




function show_refSearch()
{
    var center = browser.getCenter();
    var cref = new LatLng(center[1], center[0]);
    uref = cref.toUTMRef(); 

   var x = browser.gui.showPopup( {
      html:
     '<h1>'+'Show reference on map'+'</h1>' +
     '<form class="mapref">'+
          
     '<span title="100x100m square relative to map center" class="sleftlab">Local ref: </span>' +
     '<div><input id="locx" type="text" size="3" maxlength="3">'+
     '<input id="locy" type="text" size="3" maxlength="3">&nbsp;'+
     '<input type="button" id="butt_mgrs"'+
     '   value="'+'Find'+'">&nbsp;</div>'+
     
     '<hr><span class="sleftlab">UTM: </span>'+
     '<nobr><div><input id="utmz" type="text" size="2" maxlength="2" value="' +uref.lngZone+ '">' +
     '<input id="utmnz" type="text" size="1" maxlength="1" value="' +uref.latZone+ '">' +
     '&nbsp;&nbsp<input id="utmx" type="text" size="6" maxlength="6">'+
     '<input id="utmy" type="text" size="7" maxlength="7">&nbsp;'+
     
     '<input type="button" id="butt_utm"'+
     '   value="'+'Find'+'" style="margin-right:3.5em">&nbsp;</div></nobr>' +
     
     '<hr><span class="sleftlab">LatLong: </span>' +
     '<nobr><div><input id="ll_Nd" type="text" size="2" maxlength="2">°&nbsp;'+
     '<input id="ll_Nm" type="text" size="6" maxlength="6">\'&nbsp;N&nbsp;&nbsp;'+
     '<input id="ll_Ed" type="text" size="2" maxlength="2">°&nbsp;' +
     '<input id="ll_Em" type="text" size="6" maxlength="6">\'&nbsp;E&nbsp;' +
     '<input type="button" id="butt_ll"'+
     '   value="'+'Find'+'">&nbsp;</div></nobr>'+
     '</form>', 
     pixPos: [50,70],
     draggable: true
   });  
   
   setTimeout(function() {
      autojump('utmz', 'utmnz');
      autojump('utmnz', 'utmx');
      autojump('utmx', 'utmy');
      autojump('locx', 'locy');
      autojump('ll_Nd', 'll_Nm');
      autojump('ll_Nm', 'll_Ed');
      autojump('ll_Ed', 'll_Em'); 
 
      
      $('#butt_mgrs').click( function() {
              doRefSearchLocal( $('#locx').val(), $('#locy').val() );  
           });
      
      $('#butt_utm').click( function() {
              doRefSearchUtm( $('#utmx').val(), $('#utmy').val(), $('#utmnz').val(), $('#utmz').val() );  
           });
      
      $('#butt_ll').click( function() {
              doRefSearchDM( $('#ll_Nd').val(), $('#ll_Nm').val(), $('#ll_Ed').val(), $('#ll_Em').val() );  
           });
   }, 1000);
}


 
 function doRefSearchDM(nd, nm, ed, em) 
 {  
   var pos = polaric.parseDM(nd, nm, ed, em);
   browser.goto_Pos(pos, true );
 }
 

 
 function doRefSearchUtm(ax, ay, nz, zz)
 {
   var pos = polaric.parseUTM(ax, ay, nz, zz);
   browser.goto_Pos(pos, true);
 }
 
 
 
 function doRefSearchLocal(ax, ay)
 {   
    var pos = polaric.parseLocal(browser, ax, ay);
    browser.goto_Pos(pos, true);
 }


