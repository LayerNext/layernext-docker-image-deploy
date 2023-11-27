//remove if default Embedding Model exists
db.getCollection('EmbeddingModel').remove({embeddingModelName: 'Resnet50'});

//insert default Embedding Model
db.getCollection('EmbeddingModel').insert({
  embeddingModelName: 'Resnet50',
  embeddingDimension: [2048],
  createdAt: new Date(),
  createdBy: 'System',
  updatedAt: new Date(),
});
