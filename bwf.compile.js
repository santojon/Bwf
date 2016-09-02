// Load all automatically
(function() {
    /**
     * Load file from an url and returns a string with its content
     * @param url: the url to fetch data.
     */
    load = function(url) {
        var xhr;
        if(window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if(window.ActiveXObject) {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        } else {
            return false;
        }
        xhr.open('GET', url, false);
        if(xhr.overrideMimeType) {
            xhr.overrideMimeType('text/plain');
        }
        xhr.send(null);
        if(xhr.status == 200) {
            return xhr.responseText;
        }
        return false;
    }

    /**
     * Compiles the text/bwf scripts and add to page
     */
    compile = function() {
        var script = document.getElementsByTagName('script');
        var i, src = [], elem;
        for(i = 0; i < script.length; i++) {
            if(script[i].type == 'text/beowulf') {
                if(script[i].src) {
                    src.push(load(script[i].src));
                } else {
                    src.push(script[i].innerHTML);
                }
            }
        }
        if(src.length == 0) {
            return;
        }
        
        // add class to scope
        new Bwf().create(src[0]);
    }

    // compile
    compile();
})();