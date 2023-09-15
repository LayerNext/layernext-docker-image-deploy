import time
from pymilvus import (
    connections,
    utility,
    FieldSchema, CollectionSchema, DataType,
    Collection,
    db
)

connections.connect("default", host="host.docker.internal", port="19530", user="root", password="Milvus")

database = db.create_database("layerNext")

db.using_database("layerNext")

fields = [
    FieldSchema(name="uniqueName", dtype=DataType.VARCHAR, is_primary=True, auto_id=False, max_length=256),
    FieldSchema(name="embeddings", dtype=DataType.FLOAT_VECTOR, dim=2048)
]

schema = CollectionSchema(fields, "layernext embeddings")

LayerNextEmbeddings = Collection("LayerNextEmbeddings", schema, consistency_level="Strong")

index = {
    "index_type": "IVF_FLAT",
    "metric_type": "IP",
    "params": {"nlist": 128},
}

LayerNextEmbeddings = Collection("LayerNextEmbeddings")



time.sleep(20000)