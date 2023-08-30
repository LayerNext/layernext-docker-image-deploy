// create mongodb dump restore user
db.createUser(
  {
    user: _getEnv('DUMP_USER'),
    pwd: _getEnv('DUMP_USER_PWD'),
    roles: [{role: "backup", db: "admin"}, {role: "restore", db: "admin"}],
    mechanisms: ["SCRAM-SHA-1"]
  }
);

// switch to db
db = db.getSiblingDB(_getEnv('DATABASE'));

// create mongodb user
db.createUser(
  {
    user: _getEnv('DB_USER'),
    pwd: _getEnv('DB_PASS'),
    roles: [{role: "readWrite", db: _getEnv('DATABASE')}],
    mechanisms: ["SCRAM-SHA-1"]
  }
);

//insert masterData
db.getCollection('MasterData').insert(
  {
    "_id": ObjectId("619dd3ff8c115a50e135b303"),
    "exportFormats": {
      "YOLO Darknet": {
        "fileType": "txt",
        "name": "Yolo",
        "category": "category1",
        "datasetDownloadData": {
          "isDownloadImages": true,
          "isDownloadFrameTextFiles": true,
          "isDownloadVersionFiles": true,
          "isWritePathFiles": true,
          "downloadStructure": {
            "imageDownlodLocation": "./data",
            "textFileDownlodLocation": "./data",
            "pathFile": {
              "downloadLocation": "."
            },
            "versionItems": [
              {
                "key": "readme",
                "downloadPath": "."
              }
            ]
          }
        }
      },
      "RAW": {
        "fileType": "json",
        "name": "raw",
        "datasetDownloadData": {
          "isDownloadImages": true,
          "isDownloadFrameTextFiles": false,
          "isDownloadVersionFiles": true,
          "isWritePathFiles": false,
          "downloadStructure": {
            "imageDownlodLocation": "./data",
            "versionItems": [
              {
                "key": "readme",
                "downloadPath": "."
              },
              {
                "key": "raw",
                "downloadPath": ".",
                "isToUnzip": true
              }
            ]
          }
        }
      },
      "Semantic Segmentation": {
        "name": "Semantic Segmentation",
        "datasetDownloadData": {
          "isDownloadImages": false,
          "isDownloadFrameTextFiles": false,
          "isDownloadVersionFiles": true,
          "isWritePathFiles": false,
          "downloadStructure": {
            "imageDownlodLocation": "./data",
            "versionItems": [
              {
                "key": "readme",
                "downloadPath": "."
              },
              {
                "key": "train",
                "downloadPath": ".",
                "isToUnzip": true
              },
              {
                "key": "test",
                "downloadPath": ".",
                "isToUnzip": true
              },
              {
                "key": "validation",
                "downloadPath": ".",
                "isToUnzip": true
              }
            ]
          }
        }
      },
      "COCO": {
        "fileType": "json",
        "name": "coco",
        "category": "category2",
        "datasetDownloadData": {
          "isDownloadImages": true,
          "isDownloadFrameTextFiles": false,
          "isDownloadVersionFiles": true,
          "isWritePathFiles": false,
          "downloadStructure": {
            "imageDownlodLocation": "./{{typePrefix}}2017",
            "versionItems": [
              {
                "key": "train",
                "downloadPath": "."
              },
              {
                "key": "test",
                "downloadPath": "."
              },
              {
                "key": "validation",
                "downloadPath": "."
              }
            ]
          }
        }
      },
      "Pascal VOC": {
        "fileType": "xml",
        "name": "pascal voc",
        "category": "category3",
        "datasetDownloadData": {
          "isDownloadImages": true,
          "isDownloadFrameTextFiles": true,
          "isDownloadVersionFiles": false,
          "isWritePathFiles": true,
          "downloadStructure": {
            "imageDownlodLocation": "./data",
            "textFileDownlodLocation": "./data",
            "pathFile": {
              "downloadLocation": "."
            }
          }
        }
      },
      "Tensorflow TFRecord": {
        "datasetDownloadData": {
          "isDownloadImages": false,
          "isDownloadFrameTextFiles": false,
          "isDownloadVersionFiles": true,
          "isWritePathFiles": false,
          "downloadStructure": {
            "versionItems": [
              {
                "key": "pbText",
                "downloadPath": "."
              },
              {
                "key": "train",
                "downloadPath": "./train"
              },
              {
                "key": "test",
                "downloadPath": "./test"
              },
              {
                "key": "validation",
                "downloadPath": "./validation"
              }
            ]
          }
        }
      }
    },
    "augmentationTypes": {
      "IMAGE_LEVEL": [
        {
          "id": "FLIP_IMAGE",
          "description": "Add horizontal or vertical flips to help your model be insensitive to subject orientation.",
          "properties": [
            {
              "id": "FLIP_HORIZONTAL",
              "values": [
                true
              ],
              "propertyType": 1,
              "propertyValues": [
                true,
                false
              ]
            },
            {
              "id": "FLIP_VERTICAL",
              "values": [
                true
              ],
              "propertyType": 1,
              "propertyValues": [
                true,
                false
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/image level thumbnail/flip_image.png"
        },
        {
          "id": "IMAGE_ROTATION",
          "description": "Add variability to rotations to help your model be more resilient to camera roll.",
          "properties": [
            {
              "id": "PERCENTAGE_SCALE",
              "values": [
                45.0
              ],
              "propertyType": 2,
              "propertyValues": [
                -360,
                360
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/image level thumbnail/image-rotation.png"
        },
        {
          "id": "IMAGE_BLUR",
          "description": "Add random Gaussian blur to help your model be more resilient to camera focus.",
          "properties": [
            {
              "id": "BLUR",
              "values": [
                25.0
              ],
              "propertyType": 2,
              "propertyValues": [
                0,
                15
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/image level thumbnail/image_blur.png"
        },
        {
          "id": "NINETY_ROTATION",
          "description": "Add 90-degree rotations to help your model be insensitive to camera orientation.",
          "properties": [
            {
              "id": "CLOCKWISE",
              "values": [
                true
              ],
              "propertyType": 1,
              "propertyValues": [
                true,
                false
              ]
            },
            {
              "id": "COUNTER_CLOCKWISE",
              "values": [
                true
              ],
              "propertyType": 1,
              "propertyValues": [
                true,
                false
              ]
            },
            {
              "id": "UPSIDE_DOWN",
              "values": [
                true
              ],
              "propertyType": 1,
              "propertyValues": [
                true,
                false
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/image level thumbnail/90_rotate.png"
        },
        {
          "id": "SHEAR",
          "description": "Add variability to perspective to help your model be more resilient to camera and subject pitch and yaw.",
          "properties": [
            {
              "id": "SHEAR_HORIZONTAL",
              "values": [
                45.0
              ],
              "propertyType": 2,
              "propertyValues": [
                -90,
                90
              ]
            },
            {
              "id": "SHEAR_VERTICAL",
              "values": [
                45.0
              ],
              "propertyType": 2,
              "propertyValues": [
                -90,
                90
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/image level thumbnail/shear_images.png"
        },
        {
          "id": "GRAYSCALE",
          "description": "Probabilistically apply grayscale to a subset of the training set.",
          "properties": [
            {
              "id": "GRAYSCALE_PERCENTAGE",
              "values": [
                100.0
              ],
              "propertyType": 2,
              "propertyValues": [
                0,
                100
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/image level thumbnail/greyscale.png"
        },
        {
          "id": "CUTOUT",
          "description": "Add cutout to help your model be more resilient to object occlusion.",
          "properties": [
            {
              "id": "CUTOUT_PERCENTAGE",
              "values": [
                100.0
              ]
            },
            {
              "id": "CUTOUT_COUNT",
              "values": [
                25.0
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/image level thumbnail/cutout.png"
        },
        {
          "id": "MOSAIC",
          "description": "Add mosaic to help your model perform  better on small objects.",
          "properties": [],
          "thumbnailUrl": "/api/dataSet/image level thumbnail/mosaic.png"
        },
        {
          "id": "HUE",
          "description": "Randomly adjust the colors in the image.",
          "properties": [
            {
              "id": "HUE_DEGREES",
              "values": [
                180.0
              ],
              "propertyType": 2,
              "propertyValues": [
                -100,
                100
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/image level thumbnail/hue.png"
        },
        {
          "id": "SATURATION",
          "description": "Randomly adjust the vibrancy of the colors in the images.",
          "properties": [
            {
              "id": "SATURATION_DEGREES",
              "values": [
                99.0
              ],
              "propertyType": 2,
              "propertyValues": [
                -100,
                100
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/image level thumbnail/saturation.png"
        },
        {
          "id": "EXPOSURE",
          "description": "Add variability to image brightness to help your model be more resilient to lighting and camera setting changes.",
          "properties": [
            {
              "id": "EXPOSURE_DEGREES",
              "values": [
                99.0
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/image level thumbnail/Exposure.png"
        },
        {
          "id": "BRIGHTNESS",
          "description": "Add variability to image brightness to help your model be more resilient to lighting and camera setting changes.",
          "properties": [
            {
              "id": "BRIGHTNESS_DEGREES",
              "values": [
                99.0
              ],
              "propertyType": 2,
              "propertyValues": [
                -100,
                100
              ]
            },
            {
              "id": "BRIGHTNESS_BRIGHTEN",
              "values": [
                true
              ]
            },
            {
              "id": "BRIGHTNESS_DARKEN",
              "values": [
                true
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/image level thumbnail/brightness.png"
        },
        {
          "id": "NOISE",
          "description": "Add noise to help your model be more resilient to camera artifacts.",
          "properties": [
            {
              "id": "NOISE_PERCENTAGE",
              "values": [
                25.0
              ],
              "propertyType": 2,
              "propertyValues": [
                0,
                100
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/image level thumbnail/noice.png"
        },
        {
          "id": "CROP",
          "description": "Add variability to positioning and size to help  your model be more resilient to subject translations and camera position.",
          "properties": [
            {
              "id": "CROP_PERCENTAGE",
              "values": [
                99.0
              ],
              "propertyType": 2,
              "propertyValues": [
                0,
                100
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/image level thumbnail/crop.png"
        }
      ],
      "BOUNDING_BOX_LEVEL": [
        {
          "id": "FLIP_BOUNDING_BOX",
          "description": "Add horizontal or vertical flips to help your model be insensitive to subject orientation.",
          "properties": [
            {
              "id": "FLIP_HORIZONTAL",
              "values": [
                true
              ]
            },
            {
              "id": "FLIP_VERTICAL",
              "values": [
                true
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/bounding box level thumbnail/flip_bounding_box.png"
        },
        {
          "id": "SHEAR_BOUNDING_BOX",
          "description": "Add variability to perspective to help your model be more resilient to camera and subject pitch and yaw.",
          "properties": [
            {
              "id": "SHEAR HORIZONTAL",
              "values": [
                45.0
              ]
            },
            {
              "id": "SHEAR VERTICAL",
              "values": [
                45.0
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/bounding box level thumbnail/shear.png"
        },
        {
          "id": "BRIGHTNESS_BOUNDING_BOX",
          "description": "Add variability to image brightness to help your model be more resilient to lighting and camera setting changes.",
          "properties": [
            {
              "id": "BRIGHTNESS_DEGREES",
              "values": [
                99.0
              ]
            },
            {
              "id": "BRIGHTNESS_BRIGHTEN",
              "values": [
                true
              ]
            },
            {
              "id": "BRIGHTNESS_DARKEN",
              "values": [
                true
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/bounding box level thumbnail/brightness_box.png"
        },
        {
          "id": "BOUNDING_BOX_ROTATION",
          "description": "Add variability to rotations to help your model be more resilient to camera roll.",
          "properties": [
            {
              "id": "PERCENTAGE_SCALE",
              "values": [
                45.0
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/bounding box level thumbnail/bounding_box_rotation.png"
        },
        {
          "id": "BOUNDING_BOX_BLUR",
          "description": "Add random Gaussian blur to help your model be more resilient to camera focus.",
          "properties": [
            {
              "id": "BLUR",
              "values": [
                25.0
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/bounding box level thumbnail/bounding_box_blur.png"
        },
        {
          "id": "NINETY_ROTATION_BOUNDING_BOX",
          "description": "Add 90-degree rotations to help your model be insensitive to camera orientation.",
          "properties": [
            {
              "id": "CLOCKWISE",
              "values": [
                true
              ]
            },
            {
              "id": "COUNTER_CLOCKWISE",
              "values": [
                true
              ]
            },
            {
              "id": "UPSIDE_DOWN",
              "values": [
                true
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/bounding box level thumbnail/90_rotate.png"
        },
        {
          "id": "CROP_BOUNDING_BOX",
          "description": "Add variability to positioning and size to help  your model be more resilient to subject translations and camera position.",
          "properties": [
            {
              "id": "CROP_PERCENTAGE",
              "values": [
                99.0
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/bounding box level thumbnail/crop_box.png"
        },
        {
          "id": "NOISE_BOUNDING_BOX",
          "description": "Add noise to help your model be more resilient to camera artifacts.",
          "properties": [
            {
              "id": "NOISE_PERCENTAGE",
              "values": [
                25.0
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/bounding box level thumbnail/noice_box.png"
        },
        {
          "id": "EXPOSURE_BOUNDING_BOX",
          "description": "Add variability to image brightness to help your model be more resilient to lighting and camera setting changes.",
          "properties": [
            {
              "id": "EXPOSURE_DEGREES",
              "values": [
                99.0
              ]
            }
          ],
          "thumbnailUrl": "/api/dataSet/bounding box level thumbnail/box_exposure.png"
        }
      ]
    },
    "datasetExports": [
      {
        "title": "TXT",
        "options": [
          {
            "checked": false,
            "name": "YOLO Darknet"
          }
        ]
      },
      {
        "title": "JSON",
        "options": [
          {
            "checked": false,
            "name": "RAW"
          }
        ]
      },
      {
        "title": "Mask",
        "options": [
          {
            "checked": false,
            "name": "Semantic Segmentation"
          }
        ]
      }
    ]
  }
)
