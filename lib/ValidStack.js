var GetFunctionArguments = require('./GetFunctionArguments.js');

function ValidStack(stack){

  if(!stack || stack == "undefined" || !(stack instanceof Array) || !stack.length || stack.length <= 0){

    throw new Error("Stack validation failed: stack must exist and be a non empty array");

  }

  stack.forEach(function(fn){

    if(typeof(fn) != "function"){
      throw new Error("Stack validation failed: transform functions must have signature (chunk,enc,next)");
    }

    try{

      var args = GetFunctionArguments(fn);
      if( args.length < 3 || args.length > 3 ){
        throw new Error("Stack validation failed: transform functions must have signature (chunk,enc,next)");
      }

    }catch(e){
      throw new Error("Stack validation failed: transform functions must have signature (chunk,enc,next)");
    }

  })

  return true;

}

module.exports = ValidStack;
