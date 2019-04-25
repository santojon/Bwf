/**
 * Class responsible to create and valuate another classes
 * @param [optional] element: a string to parse to a class
 * @param [optional] container: the container object to put classes in (default is window)
 * TODO @param [optional] options: parsing and valuating options
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
        var keys = options ?
            Object.keys(options).filter(function(k) {
                return k !== '__types';
            }) : '';

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
            c[\'instanceof\'] = function(klass) {\
    	        return (klass.prototype.constructor.name === this.constructor.name);\
    	    };\
            return c;\
        };';
        var klass = eval(code);

        // class dynamic data
        keys.forEach(function(key) {
            klass.prototype[key] = options[key];
        });

        // Class static data
        klass.keys = keys;
        klass.__types = options.__types;
        klass.toString = function() {
            return 'function ' + className + '() { [native code] }';
        };

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

    /**
     * Setup specific types used in Bwf
     */
    var setupInnerTypes = function() {
        if (!container['Password']) {
            container['Password'] = class Password {
                constructor(obj) {
                    this.value = btoa(obj.value);
                }

                getPass() {
                    return atob(this.value);
                }

                instanceof() {
                    return (Password.prototype.constructor.name === this.constructor.name);
                }

                static toString() {
                    return 'function Password() { [native code] }';
                }
            };
        }
        Password.__types = { value: String };
    }

    // the Bwf itself
    bwf.prototype = {
	    init: function() {
            setupInnerTypes();
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
            var parts = splitOn(elem, /:/);

            // can split?
            if ((parts !== undefined) && (parts[0] !== '')) {
                // Verify if is a class
                if (parts[0] !== parts[0].toLowerCase()) {
                    var className = parts[0];
                    result[className] = new Object();
                    var klass = result[className];

                    // remove first element
                    parts.shift();

                    // Parse as Bwf JSON notation
                    klass = JSON.parse(parts.join(':').trim().replace(/[a-zA-Z0-9_]+[a-zA-Z0-9\-_ ]*/g,
                        function(val) {
                            return '"' + val.trim() + '"';
                        }
                    ).trim());
                    klass.__types = new Object();

                    var kk = JSON.parse(parts.join(':').trim().replace(/[a-zA-Z0-9_]+[a-zA-Z0-9\-_ ]*/g,
                        function(val) {
                            return '"' + val.trim() + '"';
                        }
                    ).trim());

                    var deep = function(kk, klass) {
                        // Set variable types
                        Object.keys(kk).forEach(function(arg) {
                            if (klass[arg] instanceof Array) {
                                switch (klass[arg][0].toString().toLowerCase()) {
                                    case 'string':
                                        klass[arg] = [new String()];
                                        klass.__types[arg] = [String];
                                        break;
                                    case 'number':
                                        klass[arg] = [new Number()];
                                        klass.__types[arg] = [Number];
                                        break;
                                    case 'boolean':
                                        klass[arg] = [new Boolean()];
                                        klass.__types[arg] = [Boolean];
                                        break;
                                    case 'list':
                                        klass[arg] = [new Array()];
                                        klass.__types[arg] = [Array];
                                        break;
                                    case 'object':
                                        klass[arg] = [new Object()];
                                        klass.__types[arg] = [Object];
                                        break;
                                    case 'function':
                                        klass[arg] = [new Function()];
                                        klass.__types[arg] = [Function];
                                        break;
                                    default:
                                        // Have to match PERFECTLY and CASE SENSITIVE
                                        if (container[klass[arg]]) {
                                            klass[arg] = [new container[klass[arg][0]]({})];
                                            klass.__types[arg] = [container[klass[arg][0].constructor.name]];
                                        } else {
                                            klass[arg] = [new Object()];
                                            klass.__types[arg] = [Object];
                                        }
                                        break;
                                }
                            } else if (klass[arg] instanceof Object) {
                                // Set __types for deep subclass
                                klass[arg].__types = new Object();

                                // run deep mapping
                                deep(kk[arg], klass[arg]);

                                // get deep mappings back to superclass
                                klass.__types[arg] = klass[arg].__types;
                                delete klass[arg].__types;
                            } else {
                                switch (klass[arg].toString().toLowerCase()) {
                                    case 'string':
                                        klass[arg] = new String();
                                        klass.__types[arg] = String;
                                        break;
                                    case 'number':
                                        klass[arg] = new Number();
                                        klass.__types[arg] = Number;
                                        break;
                                    case 'boolean':
                                        klass[arg] = new Boolean();
                                        klass.__types[arg] = Boolean;
                                        break;
                                    case 'list':
                                        klass[arg] = new Array();
                                        klass.__types[arg] = Array;
                                        break;
                                    case 'object':
                                        klass[arg] = new Object();
                                        klass.__types[arg] = Object;
                                        break;
                                    case 'function':
                                        klass[arg] = new Function();
                                        klass.__types[arg] = Function;
                                        break;
                                    default:
                                        // Have to match PERFECTLY and CASE SENSITIVE
                                        if (container[klass[arg]]) {
                                            klass[arg] = new container[klass[arg]]({});
                                            klass.__types[arg] = container[klass[arg].constructor.name];
                                        } else {
                                            klass[arg] = new Object();
                                            klass.__types[arg] = Object;
                                        }
                                        break;
                                }
                            }
                        });
                    }

                    // Deeply map class
                    deep(kk, klass);

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

    Bwf.toString = function() {
        return 'function Bwf() { [native code] }';
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
        
        // add classes to scope
        src.forEach(function(s) {
            new Bwf().create(s);
        });
    }

    // compile
    compile();
})();