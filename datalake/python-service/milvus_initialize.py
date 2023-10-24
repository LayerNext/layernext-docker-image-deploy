import time
import numpy as np
from pymilvus import (
    connections,
    utility,
    FieldSchema, CollectionSchema, DataType,
    Collection,
    db
)

connections.connect("default", host="host.docker.internal", port="19530", user="root", password="Milvus")

db_list = db.list_database()

if "LayerNext" not in db_list:
    database = db.create_database("LayerNext")

db.using_database("LayerNext")

fields = [
    FieldSchema(name="uniqueName", dtype=DataType.VARCHAR, is_primary=True, auto_id=False, max_length=256),
    FieldSchema(name="embeddings", dtype=DataType.FLOAT_VECTOR, dim=2048)
]

schema = CollectionSchema(fields, "LayerNext embeddings")

LayerNext_embeddings_collection = Collection("Resnet50", schema, consistency_level="Strong")


index = {
    "index_type": "IVF_FLAT",
    "metric_type": "IP",
    "params": {"nlist": 128},
}

LayerNext_embeddings_collection = Collection("Resnet50")

has_index = LayerNext_embeddings_collection.has_index(index_name="vec_index")

if has_index == False or has_index == None:
    LayerNext_embeddings_collection.create_index("embeddings", index, index_name="vec_index")


time.sleep(20000)