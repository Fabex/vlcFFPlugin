var VlcFFPlugin = {
    tempFile : false,
    createDate : false,
    timOut : '',
    tplId : 0,
    hostname : '',

    onMenuItemCommand : function() {
        VlcFFPlugin.addVlcDecoration();
        VlcFFPlugin.addTorrentDecoration();
    },

    onLoad : function(e) {
        // initialization code
        this.initialized = true;
        var doc = e.originalTarget;
        // On ne traite que les pages d'un certain domaine
        if (doc.location.href.search('adst') > -1) {
            VlcFFPlugin.onMenuItemCommand();
        }
    },

    openVlc : function(videoFile) {
        var file = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsILocalFile);

        file.initWithPath('/usr/bin/vlc');

        var process = Components.classes["@mozilla.org/process/util;1"]
                .createInstance(Components.interfaces.nsIProcess);
        process.init(file);

        var args = [ '-f', videoFile ];
        process.run(false, args, args.length);
    },

    openRTorrent : function(cmd) {
        var file = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsILocalFile);

        file.initWithPath('/usr/bin/rtorrent');

        var process = Components.classes["@mozilla.org/process/util;1"]
                .createInstance(Components.interfaces.nsIProcess);
        process.init(file);

//        var cmd = '-O system.method.set_key=event.download.finished,move_complete,"execute=mv,-u,$d.get_base_path=,'+dir+';d.set_directory='+dir+'"';
        
        var args = cmd;//[cmd, magnet ];
        process.run(false, args, args.length);
        alert(cmd);
    },

    addVlcDecoration : function() {
		var htmlDoc = gBrowser.selectedBrowser.contentDocument;
		var tds = htmlDoc.getElementsByClassName('action');
        for ( var i = 0; i < tds.length; i++) {
            var td = tds[i];
            var child = td.childNodes[1];
            var info = child.getAttribute('id');
            
            var vlcButton = htmlDoc.createElement("img");
            vlcButton.setAttribute('id', info);
            vlcButton.setAttribute('src', 'http://adst/vlc.jpeg');
            vlcButton.addEventListener('click', function() {
                var id = this.getAttribute('id');
                VlcFFPlugin.getVideoFileName(id);
            }, false);
            td.appendChild(vlcButton);
        }
    },
    
    addTorrentDecoration : function() {
    	var htmlDoc = gBrowser.selectedBrowser.contentDocument;
		var as = htmlDoc.getElementsByClassName('torrent');
        for ( var i = 0; i < as.length; i++) {
            var a = as[i];            
            a.addEventListener('click', function() {
                var id = this.getAttribute('id');
                VlcFFPlugin.dlTorrent(id);
            }, false);
        }
    },
    
    dlTorrent : function(id) {
    	var url = "http://adst/dlTorrent.php?id=" + id;
        var request = new XMLHttpRequest();

        request.onload = function(aEvent) {

            Components.utils.import("resource://gre/modules/NetUtil.jsm");
            Components.utils.import("resource://gre/modules/FileUtils.jsm");

            var myObject = eval('(' + aEvent.target.responseText + ')');
//            var dir = myObject['dir'];
//            var magnet = myObject['magnet'];
            VlcFFPlugin.openRTorrent(myObject);
        };

        request.onerror = function(aEvent) {
            window.alert("Error Status: " + aEvent.target.status);
        };

        request.open("GET", url, true);
        request.send(null);
    },

    getVideoFileName : function(id) {
        var url = "http://adst/getVideoFileName.php?id=" + id;
        var request = new XMLHttpRequest();

        request.onload = function(aEvent) {

            Components.utils.import("resource://gre/modules/NetUtil.jsm");
            Components.utils.import("resource://gre/modules/FileUtils.jsm");

            var fileName = aEvent.target.responseText;

            VlcFFPlugin.openVlc(fileName);
        };

        request.onerror = function(aEvent) {
            window.alert("Error Status: " + aEvent.target.status);
        };

        request.open("GET", url, true);
        request.send(null);
    }
}

window.addEventListener("load", function(e) {
    var appcontent = document.getElementById("appcontent"); // browser
    appcontent.addEventListener("load", VlcFFPlugin.onLoad, true);
}, false);
