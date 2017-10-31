
function TransformToBulk(doc, enc, next){

  var docId = doc._id;
  doc._id = undefined;
  this.push({ index: { _id: docId } });
  this.push(doc);
  next();

}

module.exports = TransformToBulk;
