 
/*
 Map browser based on OpenLayers 4. 
 popup menus, context menus. 
 
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



polaric.PopupMenu = function(popupmgr, heading)
{
    this.popupmgr = popupmgr;
    this.lastItem = null;
    this.menudiv = document.createElement('div');
    this.heading = heading;
    this.sections = [];
    this.secNo = 0;
}



/**
 * Clear content of menu.
 */

polaric.PopupMenu.prototype.clear = function()
{  
   this.lastItem = null;
   this.menudiv = document.createElement('div');
   this.secNo = 0;
   this.sections = [];
}



/**
 * Add a heading to the menu. 
 */

polaric.PopupMenu.prototype.setHeading = function(hd)
{
  this.heading = hd; 
}



/*
 * Add a item to the menu (text, function, function-argument). 
 * If text is null, this is meant a section separator. 
 */

polaric.PopupMenu.prototype.add = function(txt, func, arg)
{
   if (txt == null) { 
     this.lastItem.className = 'ITEM_sep';
     this.sections[this.secNo++] = this.lastItem;
   }
   else {
     var atxt  = (txt == null ? '' : txt);
     var alink = (func == null ? '' : func);
     this.lastItem = this.createItem_(atxt, alink, arg);
     this.menudiv.appendChild(this.lastItem);
  }
}



/**
 * Add a section separator to the menu. 
 */

polaric.PopupMenu.prototype.addSeparator = function(txt, func, arg)
   { this.add(null); }


   
/**
 * Add a item to a given section in a menu 
 */

polaric.PopupMenu.prototype.insert = function(sect, txt, func, arg)
{
   if (this.secNo == 0) {
      this.add(txt,func,arg);
      return;
   }
   if (sect >= this.secNo)
      sect = this.secNo-1;
   this.sections[sect].className = '';
   
   /* Insert immediately after sectons[sect] */
   var atxt  = (txt == null ? '' : txt);
   var alink = (func == null ? '' : func);
   var newNode = this.createItem_(atxt, alink, arg);
   this.sections[sect].parentNode.insertBefore(newNode, this.sections[sect].nextSibling);
   newNode.className = 'ITEM_sep';
   this.sections[sect] = newNode;
}



/**
 * Create item. 
 * @private
 */

polaric.PopupMenu.prototype.createItem_ = function(text, actn, arg)
{
  var t = this;
    
  function _executeItem(elem, actn, arg)
  { 
    if (elem.active)
        return;
    elem.className += ' ITEM_selected';
    elem.active=true;
    setTimeout(function() { 
        t.popupmgr.removePopup(); 
        actn(arg); 
        elem.active=false; 
    }, 300); 
  }
 
  var elem = document.createElement('div');
  elem.origCls = '';
  if (isMobile)
      // FIXME
     elem.addEventListener('tap', function() 
       { _executeItem(elem, actn, arg);  e.cancelBubble=true; }, false); 
 
  elem.onmouseup   = function(e) { _executeItem(elem, actn, arg); }
  elem.onmousedown = function(e) { _executeItem(elem, actn, arg);  e.cancelBubble=true;}
  elem.onmouseover = function(e) { elem.origCls = elem.className; 
                                   elem.className += ' ITEM_hover'; }                                
  elem.onmouseout  = function(e) { elem.className = elem.origCls;}
  elem.appendChild(document.createTextNode(text));
  return elem;
}



/**
 * Activate a menu, i.e. show it on the screen.
 */

polaric.PopupMenu.prototype.activate = function(x, y)
{
    if (this.lastItem != null)
       this.lastItem.className = 'ITEM_last';
    isMenu = true;
   
    wrapper = document.createElement('div');
    
    if (this.heading != null) {
       var h = document.createElement("H1");
       var t = document.createTextNode(this.heading); 
       h.appendChild(t);  
       wrapper.appendChild(h);
    }
    wrapper.appendChild(this.menudiv);
    wrapper.style.display = 'none';
    wrapper.className = 'POPUPMENU';
    wrapper.onmousemove = function(e) { e.cancelBubble = true; }
    this.popupmgr.popup_(wrapper, x, y, false);  
    return wrapper; 
}



 /************************************************************************/
 
 
 /**
  * CONTEXT MENU CLASS.
  * @constructor.
  */
 
 polaric.ContextMenu = function(mgr)
 {
   this.callbacks = new Array(); 
   this.txt = new polaric.PopupMenu(mgr, null);
 }
 
 
 
 /** 
  * Register a callback function that dynamically adds menu-items 
  * to some context. Can be called by plugin code.
  * If context exists, the function will typically add to existing menu items. 
  * 
  * Builtin contexts are 'MAP' and 'TOOLBAR'. More context can be added. 
  */
 
 polaric.ContextMenu.prototype.addCallback = function (context, func)
 {
   if (!this.callbacks[context])
     this.callbacks[context] = new Array();
   this.callbacks[context].push(func);
 }
  
 
 /**
  * Show the menu for a context
  * i identifier
  * e event object
  * ax and ay position on screen
  */ 
 polaric.ContextMenu.prototype.show = function (i, x, y)
 {
   var t = this; 
   t.txt.clear();
   t.txt.x = x; 
   t.txt.y = y;
   
   /* Try to find the context. By default it is the id of the 
    * element we clicked on. 
    */
   var context = ident = i;
   if (ident == null) {   
     context = 'MAP';
   }
   
   /* FIXME: also check if we clicked on some features on the map. 
    * Some features may be contexts?? Tracker items??
    * 
    * We may use regular expressions on feature or element id's 
    * to find the context-name? 
    */
   
   _doCallback(context);
//   menuMouseSelect();           
   
   /* Activate menu and add the context-name as a CSS class */
   this.txt.activate(x, y).className += ' ctxt_'+context;
   
   
   /*
    * Internal function that executes plugin callbacks
    */
   function _doCallback(ctxt)
   {
     var lst = t.callbacks[ctxt]; 
     if (lst)
       for (i=0; i<lst.length; i++) {
         f = lst[i]; 
         if (f != null) 
           f(t.txt); 
       }    
   }
 } 
 
 
 
 polaric.ContextMenu.prototype.addMenu = function (element, name)
 {
    var t = this;
    element.oncontextmenu = function(e) 
        { return t.showHandler(element, e, name); }
 }
 
 
 polaric.ContextMenu.prototype.addMenuId = function(domId, name)
 {
    var element = document.getElementById(domId);
    this.addMenu(element, name);
 }
 
 
 polaric.ContextMenu.prototype.showHandler = function(element, e, ctxt)
 {
   e = (e)?e:((event)?event:null);
   this.show(ctxt, e.clientX, e.clientY);
   e.cancelBubble = true;   
   return false; 
 }
 
 
 
 
 /******************** End of Context menu class  **********************/
 
