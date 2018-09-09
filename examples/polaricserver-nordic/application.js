   /* 
    * This is an example of how an application can be constructed using polaric components.  
    * Se also mapconfig.js for configuration of the application. 
    */


   /* 
    * Instantiate the map browser and try to restore widgets from a previous session. 
    */  
   var browser = new pol.core.MapBrowser('map', CONFIG);
   setTimeout(pol.widget.restore, 1500);
   
   
    /*
     * Add a tracking-layer using a polaric server backend.
     */  
    var srv = new pol.tracking.PolaricServer();
    var mu, flt; 
    setTimeout(function() {
        mu = new pol.tracking.Tracking(srv);
        flt = new pol.tracking.Filters(mu);
        CONFIG.server = srv;
        CONFIG.tracks = mu;
        
        if (srv.auth.userid != "") {
            var not = new pol.tracking.Notifier();
            CONFIG.notifier = not; 
        }
    }, 1000); 
   
    

   /* 
    * Set up application-specific context menus. We may define named contexts. The toolbar 
    * define its own context, 'TOOLBAR'. See below how we define 'MAP' and 'POINT'. 
    * 
    * A callback function is associated with a named context and is called when we need to 
    * activate the menu. Use it to add menu items. Adding null means adding a separator. 
    */ 
   
      
    /*********************************************************
     * Map menu
     *********************************************************/
   
    browser.ctxMenu.addCallback("MAP", function(m, ctxt) {
        m.add('Show map reference', function () 
            { browser.show_MaprefPix( [m.x, m.y] ); });  
        if (srv.auth.sar) 
	        m.add('Add object', function() { editObject(m.x, m.y); });
     
         m.add(null);
         m.add('Center point', function()   
            { browser.view.setCenter( browser.map.getCoordinateFromPixel([m.x, m.y])); } );
         m.add('Zoom in', function()        
            { browser.view.setZoom(browser.view.getZoom()+1); } );
         m.add('Zoom out',  function()      
            { browser.view.setZoom(browser.view.getZoom()-1); } );
    });

   
    /*********************************************************
     * Toolbar menu
     *********************************************************/
   
    browser.ctxMenu.addCallback("TOOLBAR", function(m, ctxt) {
        
        m.add("History...", function()
            { var x = new pol.tracking.db.History();
                x.activatePopup("history", [50, 70]) });
        m.add("My trackers", function()
            { var x = new pol.tracking.db.MyTrackers();
                x.activatePopup("mytrackers", [50, 70]) }); 
        m.add("Notification", function()
            { var x = new pol.tracking.NotifyList();
                x.activatePopup("notifications", [50, 70]) });
        m.add("Bulletin board", function()
            { var x = new pol.tracking.BullBoard();
                x.activatePopup("bullboard", [50,70]) });
        m.add('Search items', function () 
            { var x = new pol.tracking.Search(); 
                x.activatePopup("trackerSearch", [50,70]) }); 
     
        m.add('Find position', function () 
            { var x = new pol.core.refSearch(); x.activatePopup("refSearch", [50,70]) });
        m.add('Area List', function () 
            { browser.toolbar.arealist.activatePopup("AreaList", [50,70]) });
        m.add('Layer List', function () 
            { var x = new pol.layers.List(); x.activatePopup("LayerList", [50,70]) });
        
        m.add(null);
        
        if (srv.auth.sar) {                 
            m.add('Add object', function() { editObject(null, null); });
            m.add('Remove object', function() { deleteObject(null); });
        }
        m.add(null);
     
        if (srv.loggedIn)
            m.add('Log out', function() {
            srv.logout(); 
        });
        else
            m.add('Log in', function () {
            srv.login();
        });
        if (srv.auth.admin) {
            m.add("Admin/configuration..", webConfig);
            m.add("Set/change password..", setPasswd);
        }
    });
   
   
      
    /*********************************************************
     * Point menu
     *********************************************************/
   
    browser.ctxMenu.addCallback("POINT", function(m, ctxt) {
        m.add('Show info', function() 
          { srv.infoPopup(ctxt.point, [m.x, m.y]); });
        if (srv.auth.sar) { 
            m.add('Global settings', function() { globalSettings(ctxt.ident);});
            m.add('Manage tags..', function() { setTags(ctxt.ident);});
        }
      
        if (mu.labelHidden(ctxt.ident))
            m.add('Show label', function() { mu.hideLabel(ctxt.ident, false); });
        else
            m.add('Hide label', function() { mu.hideLabel(ctxt.ident, true); });
          
        m.add('Last movements', function () { historyPopup(ctxt.ident, [m.x, m.y]); });
    });
   
   
      
    /*********************************************************
     * Sign menu
     *********************************************************/
    
    browser.ctxMenu.addCallback("SIGN", function(m, ctxt) {
        m.add('Show info', function() {srv.infoPopup(ctxt.point, [m.x, m.y]); });
        m.add('Do funny things', function () { alert("What?"); });
    });
     
    
    


    /* 
     * Helper functions used by menus. 
     */
    
    function historyPopup(id, pix) {
        console.assert(id!=null && id != "" && pix != null, "Assertion failed"); 
        browser.gui.removePopup();
        browser.gui.remotePopup(
            srv, "/history", 
            {ajax: true, simple:true, id: id}, 
            {id: "historypopup", geoPos: browser.pix2LonLat(pix)});
    }
    function histList_hout() {}
    function histList_hover() {}
     
     
    function globalSettings(ident)
        { srv.popup('PointEdit', 'station_sec?id=' + ident + '&edit=true', 780, 600); }

    function setPasswd()
        { srv.popup('Password', 'passwd', 430, 250); }
  
    function webConfig()
        { srv.popup('Config', 'config_menu'+'?inapp=true', 900, 700); }
 
    function setTags(ident)
        { srv.popup('editTags', 'addtag?objid='+ident, 560, 300); }
   
    function editObject(x, y) {
        var coord = browser.pix2LonLat([x, y]);
        srv.popup('editObject', 'addobject' +
            (x==null ? "" : '?x=' + coord[0] + '&y='+ coord[1] ), 560, 300);
    }

    function deleteObject(ident) {
        srv.popup('delObject', 'deleteobject' + 
            (ident==null ? "" : '?objid='+ident), 350, 180);
    }
   
    function findItem(x) 
        { mu.goto_Point(x); }