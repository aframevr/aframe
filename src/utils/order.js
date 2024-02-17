var debug = require('./debug');
var warn = debug('utils:order:warn');

/**
 * Derives an ordering from the elements with before and after constraints.
 *
 * @param {object} elements - The elements to order
 * @param {array} array - Optional array to use as output
 */
function solveOrder (elements, array) {
    var graph = {};
    var i;
    var key;
    var result = array || [];
    result.length = 0;

    // Construct graph nodes for each element
    for (key in elements) {
        var element = elements[key];
        if (element === undefined) { continue; }
        var before = element.before ? element.before.slice(0) : [];
        var after = element.after ? element.after.slice(0) : [];
        graph[key] = { before: before, after: after, visited: false, done: false };
    }

    // Normalize to after constraints, warn about missing nodes
    for (key in graph) {
        for (i = 0; i < graph[key].before.length; i++) {
            var beforeName = graph[key].before[i];
            if (!(beforeName in graph)) {
                warn('Invalid ordering constraint, no node named `' + beforeName + '` referenced by `' + key + '`');
                continue;
            }

            graph[beforeName].after.push(key);
        }
    }

    // Perform topological depth-first search
    // https://en.wikipedia.org/wiki/Topological_sorting#Depth-first_search
    function visit (name) {
        if (!(name in graph) || graph[name].done) {
            return;
        }

        if (graph[name].visited) {
            warn('Cycle detected, ignoring one or more before/after constraints. ' +
                'The resulting order might be incorrect');
            return;
        }

        graph[name].visited = true;

        for (var i = 0; i < graph[name].after.length; i++) {
            var afterName = graph[name].after[i];
            if (!(afterName in graph)) {
                warn('Invalid before/after constraint, no node named `' +
                        afterName + '` referenced in `' + name + '`');
            }
            visit(afterName);
        }

        graph[name].done = true;
        result.push(name);
    }

    for (key in graph) {
        if (graph[key].done) {
            continue;
        }
        visit(key);
    }
    return result;
}
module.exports.solveOrder = solveOrder;
