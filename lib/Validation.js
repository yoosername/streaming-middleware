const {Transform} = require("stream");
const GetFunctionArguments = require('./GetFunctionArguments.js');
const VALIDATION_ERROR = "Stack must be none null and contain only functions that inherit stream.Transform or have 3 args";

/**
 * Validate a Transform function
 * @private
 * @constructor
 * @param {Function} fn - Function to test
 * @return {Boolean}
 * @throws {Error}
 */
function ValidTransform(fn){
  "use strict";

  // Is is an instance of Transform stream  - if so no more checks
  if(fn instanceof Transform){
    return true;
  }

  // otherwise it should at least be Function
  if(typeof(fn) !== "function"){
    throw new Error(VALIDATION_ERROR);
  }

  try{

    var args = GetFunctionArguments(fn);
    if( args.length < 3 || args.length > 3 ){
      // and the function should have 3 args.
      throw new Error(VALIDATION_ERROR);
    }

  }catch(e){

    // or be parasble as having 3 args.
    throw new Error(VALIDATION_ERROR);

  }

  // Looks like were good
  return true;

}

function ValidStack(stack){
  "use strict";

  // Check it as least an array of 1 or more
  if(!stack || stack === "undefined" || !(stack instanceof Array) || !stack.length || stack.length <= 0){

    throw new Error(VALIDATION_ERROR);

  }

  // Then check each fn in the array
  stack.forEach(function(fn){

    ValidTransform(fn);

  });

  // Looks like were good
  return true;

}

module.exports.ValidStack = ValidStack;
module.exports.ValidTransform = ValidTransform;