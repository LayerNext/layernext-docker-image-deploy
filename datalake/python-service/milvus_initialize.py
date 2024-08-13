import time
import numpy as np
from pymilvus import (
    connections,
    utility,
    FieldSchema,
    CollectionSchema,
    DataType,
    Collection,
    db,
)

connections.connect(
    "default", host="standalone", port="19530", user="root", password="Milvus"
)

db_list = db.list_database()

if "LayerNext" not in db_list:
    database = db.create_database("LayerNext")

db.using_database("LayerNext")

image_collection = "Resnet50"
has = utility.has_collection(image_collection)
print(f"Does collection {image_collection} exist in Milvus: {has}")

if has == False:

    fields = [
        FieldSchema(
            name="uniqueName",
            dtype=DataType.VARCHAR,
            is_primary=True,
            auto_id=False,
            max_length=256,
        ),
        FieldSchema(name="embeddings", dtype=DataType.FLOAT_VECTOR, dim=2048),
    ]

    schema = CollectionSchema(fields, "LayerNext embeddings", enable_dynamic_field=True)

    LayerNext_embeddings_collection = Collection(
        image_collection, schema, consistency_level="Strong"
    )

    index = {
        "index_type": "IVF_FLAT",
        "metric_type": "IP",
        "params": {"nlist": 128},
    }

    LayerNext_embeddings_collection = Collection(image_collection)

    has_index = LayerNext_embeddings_collection.has_index(index_name="vec_index")

    if has_index == False or has_index == None:
        LayerNext_embeddings_collection.create_index(
            "embeddings", index, index_name="vec_index"
        )

    try:
        LayerNext_embeddings_collection.load()
    except Exception as e:
        print(e)

else:
    LayerNext_embeddings_collection = Collection(image_collection)
    index = {
        "index_type": "IVF_FLAT",
        "metric_type": "IP",
        "params": {"nlist": 128},
    }
    has_index = LayerNext_embeddings_collection.has_index(index_name="vec_index")
    if has_index == False or has_index == None:
        LayerNext_embeddings_collection.create_index(
            "embeddings", index, index_name="vec_index"
        )
    try:
        LayerNext_embeddings_collection.load()
    except Exception as e:
        print(e)


# text embeddings
text_collection = "text_similarity_babbage_001"
has = utility.has_collection(text_collection)
print(f"Does collection {text_collection} exist in Milvus: {has}")
if has == False:
    fields = [
        FieldSchema(
            name="id",
            dtype=DataType.VARCHAR,
            is_primary=True,
            auto_id=False,
            max_length=256,
        ),
        FieldSchema(name="uniqueName", dtype=DataType.VARCHAR, max_length=256),
        FieldSchema(name="metadata", dtype=DataType.JSON),
        FieldSchema(name="embeddings", dtype=DataType.FLOAT_VECTOR, dim=2048),
    ]

    schema_text = CollectionSchema(
        fields, "LayerNext Text Embeddings", enable_dynamic_field=True
    )

    LayerNext_Text_embeddings_collection = Collection(
        text_collection, schema_text, consistency_level="Strong"
    )

    index = {
        "index_type": "IVF_FLAT",
        "metric_type": "IP",
        "params": {"nlist": 128},
    }

    LayerNext_Text_embeddings_collection = Collection(text_collection)
    has_index = LayerNext_Text_embeddings_collection.has_index(index_name="vec_index")

    if has_index == False or has_index == None:
        LayerNext_Text_embeddings_collection.create_index(
            "embeddings", index, index_name="vec_index"
        )
    try:
        LayerNext_Text_embeddings_collection.load()
    except Exception as e:
        print(e)
else:
    index = {
        "index_type": "IVF_FLAT",
        "metric_type": "IP",
        "params": {"nlist": 128},
    }
    LayerNext_Text_embeddings_collection = Collection(text_collection)
    index = {
        "index_type": "IVF_FLAT",
        "metric_type": "IP",
        "params": {"nlist": 128},
    }
    has_index = LayerNext_Text_embeddings_collection.has_index(index_name="vec_index")
    if has_index == False or has_index == None:
        LayerNext_Text_embeddings_collection.create_index(
            "embeddings", index, index_name="vec_index"
        )
    try:
        LayerNext_Text_embeddings_collection.load()
    except Exception as e:
        print(e)

time.sleep(20000)
