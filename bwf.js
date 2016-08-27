// Global state at this point
var container = this;

/**
 * Class responsible to create and valuate another classes
 * @param [optional] element: a string to parse to a class
 * TODO @param options: parsing and valuating options
 */
function Bwf(elem, options) {
    var bwf = this;
    var elem = elem;

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
            var parts = elem.splitOn(/ /);

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
            var parts = val.splitOn(/ /);

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

(function() {
    var trimParts = function(lst, pattern) {
        var parts = [];

        lst.forEach(function(part) {
            parts.push(part.trim());
        });

        return parts.filter(function(p) {
            return !p.match(pattern);
        });
    };

    String.prototype.splitOn = function(pattern) {
        var t = trimParts(this.trim().split(pattern), pattern);
        var result = [];
        t.forEach(function(r) {
            if (r !== '') {
                result.push(r);
            }
        });
        return result;
    };
})();
