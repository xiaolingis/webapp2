
/*
 Map browser based on OpenLayers 4. Tracking. 
 Notifications.  
 
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
 

 
 /* 
  * Notification: 
  *     - type: Code or text. Use to select icon. 
  *     - from: Sender of the notification. Username, "system", etc... 
  *     - time: Time of event
  *     - text: Text of notification. 
  * 
  * FIXME: Open another window if clicking on certain types of notifications (messages). 
  *        Scrollbar
  */




pol.tracking.Notifier = function() 
{
    this.list = [];
    this.server = CONFIG.server;
    var t = this;
    this.audio = new Audio('sound/sound2.wav');
            
    
    /* Get stored notifications */
    t.list = CONFIG.get("tracking.Notifications");
    if (t.list == null)
        t.list = [];

    /* Add nofifications icon to toolbar */
    CONFIG.mb.toolbar.addDiv(2 ,"toolbar_not", "Nofifications");
    $('#toolbar_not').append('<img src="images/bell.png"></img>');
    $('#toolbar_not').click(
        function()
            { var x = new pol.tracking.NotifyList();
                x.activatePopup("notifications", [180, 70]) }
    );
    t.updateNumber(); 
         
    /* Subscribe to notifications from server */
    t.server.pubsub.subscribe("notify:" + t.server.auth.userid, function(x) {
        t.add(x);
    });   
    
    t.server.pubsub.subscribe("notify:SYSTEM", function(x) {t.add(x);});
    
    if (t.server.auth.admin) 
        t.server.pubsub.subscribe("notify:ADMIN", function(x) {t.add(x);});
    
    
    /* Remove notifications older than ttl. Skip if ttl is 0 */
    setInterval(function() {
        for (i in t.list) {
            var x = t.list[i];
            if (x.ttl <= 0)
                continue;
            var dt = new Date(x.time);
            if (dt.getTime() / 60000 + x.ttl < Date.now()/60000)
                t.remove(i);
        }
    }, 10000);
}


/* Update number on toolbar */
pol.tracking.Notifier.prototype.updateNumber = function() {
    $('#not_number').remove();
    if (this.list.length > 0)
        $('#toolbar_not').append('<span id="not_number">'+this.list.length+'</span>');
    m.redraw();

}


/* Add notification */
pol.tracking.Notifier.prototype.add = function(not) {
    this.audio.play();
    this.list.unshift(not);
    this.updateNumber();
    CONFIG.store("tracking.Notifications", this.list, true);
    pol.tracking.NotifyList.updateScroller();
}


/* Remove notification */
pol.tracking.Notifier.prototype.remove = function(idx) {
    this.list.splice(idx,1);
    this.updateNumber(); 
    CONFIG.store("tracking.Notifications", this.list, true);
    pol.tracking.NotifyList.updateScroller();
}


function formatDTG(date) {
    var mths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
               'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var ltime = new Date(date);
    var mth = mths[ltime.getMonth()]; 
    var day = ltime.getDate();
    var hour = ltime.getHours();
    var min = ltime.getMinutes();
    return day + ' ' +mth + ' ' + hour+":"+(min<=9 ? '0': '') + min; 
}


 
/**
 * @classdesc
 * Notification list widget (in a popup window). 
 * @constructor
 */

pol.tracking.NotifyList = function()
{
    pol.core.Widget.call(this);
    this.classname = "tracking.NotifyList"; 
    this.notifier = CONFIG.notifier;  
    var t = this;

   
    this.widget = {
        view: function() {
            var i=0;
            return m("div#notifications", [
                m("h1", "My Notifications"),
                m("table", m("tbody", t.notifier.list.map(function(x) {
                    return m("tr", [
                        m("td", m("img", {"class":"icon", src:icon(x.type)})),
                        m("td", m("div", [
                            m("span", {"class":"header"}, [x.from+", "+formatDTG(x.time)]),
                            m("img", {src:"images/16px/close.png", onclick: apply(removeNot, i++) }),
                            br, x.text 
                        ] ))
                    ]);
                })))
            ]);  
        }
    };
    
    setTimeout(
        pol.tracking.NotifyList.updateScroller, 300);
    
    /* 
     * Select the icon from the type of notification. 
     * Type can be 'loc', 'check', 'chat', 'mail, 'system', 'error', 'alert' or 'info' (default) 
     */
    function icon(type) {
        if (type==='loc') return 'images/32px/loc.png';
        else if (type==='check') return 'images/32px/check2.png';
        else if (type==='chat') return 'images/32px/chat2.png';
        else if (type==='mail') return 'images/32px/mail.png';        
        else if (type==='system') return 'images/32px/system2.png';
        else if (type==='error') return 'images/32px/error.png';
        else if (type==='alert') return 'images/emergency.png';
        else return 'images/32px/info.png';
    }
    
    
    
    /* Apply a function to an argument. Returns a new function */
    function apply(f, id) {return function() { f(id); }};  

    
    /* Remove notification from list */
    function removeNot(id) {
        t.notifier.remove(id);
    }
    
}

ol.inherits(pol.tracking.NotifyList, pol.core.Widget);



pol.tracking.NotifyList.updateScroller = function() {
    var x =  document.getElementById('notifications');
    if (x==null)
        return;
    var pos = x.getBoundingClientRect();
    var ht = $('#map').height() - pos.top - 70;

    setTimeout( function() {
        if ($('#notifications table').parent().is( "#notifications .scroll" ) ) 
            $('#notifications table').unwrap();
        
        if ($('#notifications table').height() < ht)
            ht = $('#notifications table').height();
        else {
            $('#notifications table').wrap('<div class="scroll"></div>');
            $('#notifications .scroll').height(Math.round(ht)-10).width($('#notifications table').width()+40);
        }
    }, 60);
}

 

pol.widget.setRestoreFunc("tracking.NotifyList", function(id, pos) {
    var x = new pol.tracking.NotifyList(); 
    x.activatePopup(id, pos, true); 
}); 