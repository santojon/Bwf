/**
 * Class responsible to create and valuate another classes
 * @param [optional] element: a string to parse to a class
 * TODO @param options: parsing and valuating options
 */
function Bwf(elem, container, options) {
    var bwf = this;
    var elem = elem;
    var container = container || window;

    var result = {};

    /**
     * A template to create classes
     * @param className: the name of the class (as string)
     * @param options: the properties to insert into class
     */
    var classTemplate = function(className, options) {
        options['instanceof'] = function(klass) {
            return (klass.prototype.constructor.name === className);
        };
        var keys = options ? Object.keys(options) : '';
        var code = 'this.f = function ' + className + '(options) {\
            var c = this;\
            var k = [];\
            "' + keys + '".split(/,/).forEach(function(key) {\
                k.push(key);\
            });\
            var inList = function(val, lst) {\
        		return lst.indexOf(val) > -1;\
        	};\
            var keys = Object.keys(options);\
            keys.forEach(function(key) {\
                if (inList(key, k)) {\
                    c[key] = options[key];\
                }\
            });\
            return c;\
        };';
        var klass = eval(code);

        keys.forEach(function(key) {
            klass.prototype[key] = options[key];
        });

        return klass;
    };

    /**
     * Used to split a string in a given pattern
     * @param str: the string
     * @param pattern: the pattern to use
     */
    var splitOn = function(str, pattern) {
        var trimParts = function(lst, pattern) {
            var parts = [];

            lst.forEach(function(part) {
                parts.push(part.trim());
            });

            return parts.filter(function(p) {
                return !p.match(pattern);
            });
        };
        var t = trimParts(str.toString().trim().split(pattern), pattern);
        var result = [];
        t.forEach(function(r) {
            if (r !== '') {
                result.push(r);
            }
        });
        return result;
    };

    // the Bwf itself
    bwf.prototype = {
	    init: function() {
	        return this;
	    },
	    /**
	     * Function to validate instance of Beowulf
	     */
	    instanceof: function(klass) {
	        return (klass.prototype.constructor.name === 'Bwf');
	    },
	    /**
	     * Creates a class for the given string
	     * @param el: the Beowulf class notation, as string
	     */
        create: function(el) {
            elem = el || elem;
            var parts = splitOn(elem, / /);

            // can split?
            if ((parts !== undefined) && (parts[0] !== '')) {
                // Verify if is a class
                if (parts[0] !== parts[0].toLowerCase()) {
                    var className = parts[0].split(/:/)[0];
                    result[className] = {};
                    var klass = result[className];

                    // remove first element
                    parts.shift();

                    // Parse as Bwf JSON notation
                    klass = JSON.parse(parts.join('').trim().replace(/[a-zA-Z0-9_]+[a-zA-Z0-9\-_ ]*/g,
                        function(val) {
                            return '"' + val.trim() + '"';
                        }
                    ).trim());

                    // Set variable types
                    Object.keys(klass).forEach(
                        function(arg) {
                            switch (klass[arg]) {
                                case 'string':
                                    klass[arg] = '';
                                    break;
                                case 'number':
                                    klass[arg] = 0;
                                    break;
                                case 'boolean':
                                    klass[arg] = false;
                                    break;
                                case 'list':
                                    klass[arg] = [];
                                    break;
                                case 'object':
                                    klass[arg] = {};
                                    break;
                                case 'function':
                                    klass[arg] = function() {};
                                    break;
                                default:
                                    klass[arg] = {};
                                    break;
                            }
                        }
                    );

                    // return it
                    container[className] = classTemplate(className, klass);
                    return container[className];
                }
            }

            return result;
        },
        /**
         * Used to give values to a created class
         * @param val: the values in Beowulf notation
         */
        valuate: function(val) {
            var parts = splitOn(val, / /);

            // can split?
            if ((parts !== undefined) && (parts[0] !== '')) {
                // Verify if is a class
                if (parts[0] !== parts[0].toLowerCase()) {
                    var className = parts[0].split(/:/)[0];

                    // class exists ?
                    if (container[className]) {

                        // remove first element
                        parts.shift();
                        var p = [];

                        var pp = parts.join(' ').trim().split('');
                        pp.forEach(
                            function(k, i) {
                                if (i !== 0 && i !== pp.length - 1) {
                                    p.push(k);
                                }
                            }
                        );

                        var json = JSON.parse('{' + p.join('').trim().replace(/[a-zA-Z0-9_]+[a-zA-Z0-9\-_ ]*/g,
                            function(val) {
                                return '"' + val.trim() + '"';
                            }
                        ).trim() + '}');

                        // parse rest of the string
                        return new container[className](json);
                    }
                }
            }

            return result;
        }
    };

    return bwf.prototype.init();
}

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
        var head = document.getElementsByTagName('head')[0];
        var i, src = [], elem;
        for(i = 0; i < script.length; i++) {
            if(script[i].type == 'text/bwf') {
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
        elem = document.createElement('script');
        elem.type = 'text/javascript';
        elem.innerHTML = '//Compiled Beowulf\n\n' + new Bwf().create(src);
        head.appendChild(elem);
    }

    // compile
    compile();
})();