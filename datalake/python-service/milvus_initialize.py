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

    LayerNextEmbeddings = Collection("LayerNextEmbeddings", schema, consistency_level="Strong")

    LayerNextEmbeddings.insert(
    [
        {
        "uniqueName": "test",
        "embeddings": np.random.rand(2048).astype(np.float32)
        }
    ]
    )

    index = {
        "index_type": "IVF_FLAT",
        "metric_type": "IP",
        "params": {"nlist": 128},
    }

    LayerNextEmbeddings = Collection("LayerNextEmbeddings")

    LayerNextEmbeddings.create_index("embeddings", index, index_name="vec_index")


    time.sleep(20000)