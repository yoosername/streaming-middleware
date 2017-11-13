/**
 * Function which returns array of parsed function args
 * @private
 * @param {Function} fn - Function to test for arguments
 * @return {Array}
 */
function GetFunctionArguments(fn){

  var args = [];
  if(fn){

    // Match everything inside the function argument parens.
    var match = fn.toString().match(/function\s.*?\(([^)]*)\)/);

    if( match && match.length && match.length > 1 ){

      // Get the string of arguments
      args = match[1];

      // Split the comma delimited string into an array.
      args = args.split(',').map(function(arg) {

        // Get rid of inline comments and trim whitespace.
        return arg.replace(/\/\*.*\*\//, '').trim();

      }).filter(function(arg) {

        // only return defined values.
        return arg;

      });

    }
  }
  return args;

}

module.exports = GetFunctionArguments
