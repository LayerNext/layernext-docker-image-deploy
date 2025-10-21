// create mongodb dump restore user
db.createUser({
  user: _getEnv("DUMP_USER"),
  pwd: _getEnv("DUMP_USER_PWD"),
  roles: [
    { role: "backup", db: "admin" },
    { role: "restore", db: "admin" },
  ],
  mechanisms: ["SCRAM-SHA-1"],
});

// switch to db
db = db.getSiblingDB(_getEnv("DATABASE"));

// create mongodb user
db.createUser({
  user: _getEnv("DB_USER"),
  pwd: _getEnv("DB_PASS"),
  roles: [{ role: "readWrite", db: _getEnv("DATABASE") }],
  mechanisms: ["SCRAM-SHA-1"],
});

//insert default SystemData
db.getCollection("SystemData").insert({
  _id: ObjectId("62c68556ebeb17f23b74823d"),
  teamId: ObjectId(_getEnv("TEAM_ID")),
  apiConfigs: {
    maxSyncInterval: 50000.0,
  },
  totalDataSize: 0,
  objectCounts: {
    total: 0,
    rootImageCount: 0,
    rootVideoCount: 0,
    videos: {
      count: 0,
      frames: 0,
      size: 0,
      length: 0,
      imageCount: 0,
    },
    images: {
      count: 0,
      size: 0,
      imageCount: 0,
    },
    datasets: {
      count: 0,
      frames: 0,
      size: 0,
      imageCount: 0,
    },
    imageCollections: {
      count: 0,
      size: 0,
      frames: 0,
      imageCount: 0,
    },
    videoCollections: {
      count: 0,
      frames: 0,
      size: 0,
      length: 0,
      videoCount: 0,
      frameCollection: 0,
      imageCount: 0,
    },
    other: {
      count: 0,
      size: 0,
      imageCount: 0,
    },
  },
  frameCounts: {
    total: 0,
    raw: 0,
    machineAnnotated: 0,
    verified: 0,
  },
  labelCounts: {},
  cloudStorages: [],
  isDefaultQueryOptionsInserted: false,
  recentMetaDataKeys: [],
  recentTags: [],
  allTags: [],
  businessOverview: {
    description: "<h3><strong>Section 1: Business Overview</strong></h3><p></p><p><strong>1.1 Introduction to Your Business</strong></p><p></p><p><em>Provide a brief introduction about your business (Maximum: 250 words).</em></p><p></p><p><strong>1.2 Business Model</strong></p><p></p><p><em>Describe how your business generates revenue. (Maximum: 200 words)</em></p><p></p><p></p><h3><strong>Section 2: Business Objectives</strong></h3><p></p><p><strong>2.1 Short-Term Objectives</strong></p><p></p><p><em>What are the key business objectives you aim to achieve in the next 6-12 months?</em></p><p></p><p><strong>2.2 Long-Term Objectives</strong></p><p></p><p><em>What are your strategic business goals for the next 3-5 years?</em></p><p></p><p></p><h3><strong>Section 3: Key Performance Indicators (KPIs)</strong></h3><p></p><p><strong>3.1 KPI Optimization</strong></p><p></p><p><em>List the KPIs your business focuses on optimizing. (e.g., revenue growth, customer satisfaction,</em></p><p><em>operational efficiencies, customer acquisition cost, churn rate, etc.)</em></p><p></p><p><strong>3.2 Priority Metrics</strong></p><p></p><p><em>Which specific metrics do you consider the most critical for achieving your business goals?</em></p>",
    modifiedDate: new Date(),
  }
});

//insert default APIKey
db.getCollection("ApiKey").insert({
  _id: ObjectId("62e92a1ae33130c211632eeb"),
  key:
    "key_" +
    Math.random().toString(36).substr(2, 24) +
    Math.random().toString(36).substr(2, 24) +
    Math.random().toString(36).substr(2, 24),
  secret:
    Math.random().toString(36).substr(2, 24) +
    Math.random().toString(36).substr(2, 24),
  teamId: ObjectId(_getEnv("TEAM_ID")),
  apiConfigs: {
    maxSyncInterval: 50000.0,
  },
  isProcessingLocked: false,
  lastSyncTimestamp: ISODate("2000-01-01T00:00:00.000Z"),
  application: "ANNOTATION_PROJECT",
});

/**
 * insert indexes
 */

// 'InputMetaDataFeed' collection
db.InputMetaDataFeed.createIndex(
  { isActive: 1, apiKey: 1 },
  { name: "isActive_1_apiKey_1" }
);

// 'MetaData' collection

db.MetaData.createIndex({ objectKey: 1 }, { name: "objectKey_1" });
db.MetaData.createIndex({ collectionId: 1 }, { name: "collectionId_1" });
db.MetaData.createIndex({ parentList: 1 }, { name: "parentList_1" });
db.MetaData.createIndex({ objectType: 1 }, { name: "objectType_1" });
db.MetaData.createIndex({ objectStatus: 1 }, { name: "objectStatus_1" });
db.MetaData.createIndex(
  { "labelList.label": 1 },
  { name: "labelList.label_1" }
);
db.MetaData.createIndex({ frameCount: 1 }, { name: "frameCount_1" });
db.MetaData.createIndex(
  { isPendingThumbnail: 1 },
  { name: "isPendingThumbnail_1" }
);
db.MetaData.createIndex({ Tags: 1 }, { name: "Tags_1" });

db.MetaData.createIndex({ dataCrawlId: 1 }, { name: "dataCrawlId_1" });

db.MetaData.createIndex({ datasetGroupId: 1 }, { name: "datasetGroupId_1" });
db.MetaData.createIndex({ name: 1, _id: 1 }, { name: "name_1 _id_1" }); //Change
db.MetaData.createIndex(
  { createdAt: 1, _id: 1 },
  { name: "createdAt_1 _id_1" }
); //Change
db.MetaData.createIndex({ urlExpiredAt: 1 }, { name: "urlExpiredAt_1" });
db.MetaData.createIndex({ taskIdList: 1 }, { name: "taskIdList_1" });
db.MetaData.createIndex(
  { vCollectionIdList: 1 },
  { name: "vCollectionIdList_1" }
);
db.MetaData.createIndex(
  { "verificationStatusCount.raw": 1 },
  { name: "verificationStatusCount.raw_1" }
);
db.MetaData.createIndex(
  { "verificationStatusCount.machineAnnotated": 1 },
  { name: "verificationStatusCount.machineAnnotated_1" }
);
db.MetaData.createIndex(
  { "verificationStatusCount.verified": 1 },
  { name: "verificationStatusCount.verified_1" }
);

db.MetaData.createIndex(
  { isLeaf: 1, statPending: 1, objectStatus: 1, statPendingAt: 1 },
  { name: "isLeaf_1" }
);
db.MetaData.createIndex(
  { annotationStatPending: 1 },
  { name: "annotationStatPending_1" }
);
db.MetaData.createIndex(
  { datasetStatPending: 1, frameAnalyticsCalcAt: 1 },
  { name: "datasetStatPending_1" }
);

db.MetaData.createIndex(
  { isMediaProcessingPending: 1 },
  { name: "isMediaProcessingPending_1" }
);
db.MetaData.createIndex(
  { isVerificationStatusPending: 1 },
  { name: "isVerificationStatusPending_1" }
);
db.MetaData.createIndex(
  { "annotationProjectList.name": 1 },
  { name: "annotationProjectList.name_1" }
);
db.MetaData.createIndex(
  { "annotationProjectList.id": 1 },
  { name: "annotationProjectList.id_1" }
);
db.MetaData.createIndex(
  { "datasetVersionList.datasetVersionId": 1 },
  { name: "datasetVersionList.datasetVersionId_1" }
);
db.MetaData.createIndex(
  { "datasetVersionList.datasetMetaId": 1 },
  { name: "datasetVersionList.datasetMetaId_1" }
);
db.MetaData.createIndex(
  { "datasetVersionList.isNew": 1 },
  { name: "datasetVersionList.isNew_1" }
);

db.MetaData.createIndex(
  { "operationList.operationId": 1 },
  { name: "operationList.operationId_1" }
);
db.MetaData.createIndex(
  { isAugmentedImage: 1 },
  { name: "isAugmentedImage_1" }
);
db.MetaData.createIndex(
  { "augmentationType.id": 1 },
  { name: "augmentationType.id_1" }
);
db.MetaData.createIndex(
  { "augmentationType.property.id": 1 },
  { name: "augmentationType.property.id_1" }
);
db.MetaData.createIndex({ "analytics.operationId": 1 });
db.MetaData.createIndex({ "analytics.precision": 1 });
db.MetaData.createIndex({ "analytics.recall": 1 });
db.MetaData.createIndex({ "analytics.f1Score": 1 });
db.MetaData.createIndex({ "resolution.height": 1 });
db.MetaData.createIndex({ "resolution.width": 1 });
db.MetaData.createIndex({ showInTrash: 1 });
db.MetaData.createIndex({ bucketName: 1 });

db.MetaData.createIndex({ storagePath: 1 });

db.MetaData.createIndex(
  { teamId: 1, objectType: 1 },
  { name: "teamId_1_objectType_1" }
);
// db.MetaData.createIndex(
//   { objectType: 1, isError: 1, teamId: 1 },
//   { name: "objectType_1_isError_1_teamId_1" }
// );

db.MetaData.createIndex(
  { teamId: 1, collectionId: 1, objectStatus: 1 },
  { name: "teamId_1_collectionId_1_objectStatus_1" }
);
db.MetaData.createIndex(
  { "datasetVersionList.datasetVersionId": 1, objectType: 1 },
  { name: "datasetVersionList.datasetVersionId_1_objectType_1" }
);
db.MetaData.createIndex(
  { "datasetVersionList.datasetVersionId": 1, collectionId: 1 },
  { name: "datasetVersionList.datasetVersionId_1_collectionId_1" }
);
db.MetaData.createIndex(
  {
    "datasetVersionList.datasetVersionId": 1,
    "datasetVersionList.datasetSplitType": 1,
    objectType: 1,
  },
  {
    name: "datasetVersionList.datasetVersionId_1_datasetVersionList.datasetSplitType_1_objectType_1",
  }
);
db.MetaData.createIndex(
  { "datasetVersionList.datasetMetaId": 1, objectType: 1 },
  { name: "datasetVersionList.datasetMetaId_1_objectType_1" }
);

db.MetaData.createIndex(
  { updatedAt: -1, _id: -1 },
  { name: "updatedAt_-1__id_-1" }
);
db.MetaData.createIndex(
  { trashedAt: -1, _id: -1 },
  { name: "trashedAt_-1__id_-1" }
);

db.MetaData.createIndex(
  { sourceVideoId: 1, videoFrameIndex: 1, _id: 1 },
  { name: "sourceVideoId_1_videoFrameIndex_1__id_1" }
);
db.MetaData.createIndex(
  { collectionId: 1, sourceVideoId: 1, videoFrameIndex: 1, _id: -1 },
  { name: "collectionId_1_sourceVideoId_1_videoFrameIndex_1__id_-1" }
);
db.MetaData.createIndex(
  { Tags: 1, updatedAt: -1, _id: -1 },
  { name: "Tags_1_updatedAt_-1__id_-1" }
);

db.MetaData.createIndex({ "customMeta.$**": 1 }, { name: "customMeta.$**_1" });
db.MetaData.createIndex({ fileSize: 1, _id: 1 }, { name: "fileSize_1_id_1" }); //Added

//unique indexes
db.getCollection("MetaData").createIndex(
  { name: 1, objectType: 1 },
  {
    unique: true,
    partialFilterExpression: {
      objectType: 5,
    },
  }
);
db.getCollection("MetaData").createIndex(
  { name: 1, objectType: 1 },
  {
    unique: true,
    partialFilterExpression: {
      objectType: 7,
    },
  }
);

// 'MetaDataUpdate' collection
db.MetaDataUpdate.createIndex({ objectKey: 1 }, { name: "objectKey_1" });
db.MetaDataUpdate.createIndex(
  { objectKey: 1, operationId: 1, operationMode: 1, operationType: 1 },
  { name: "objectKey_1_operationId_1_operationMode_1_operationType_1" }
);
db.MetaDataUpdate.createIndex(
  { objectKey: 1, operationId: 1 },
  { unique: true, name: "objectKey_1_operationId_1" }
);

// 'Job' collection
db.Job.createIndex({ jobName: 1 });
db.Job.createIndex({ jobType: 1 });
db.Job.createIndex({ updatedAt: -1 });
db.Job.createIndex({ status: 1 });
db.Job.createIndex({ createdAt: 1 });


db.getCollection('EmbeddingVector').createIndex(
  {
    objectKey: 1.0,
    modelName: 1.0,
  },
  {
    unique: true,
    name: 'objectKey_1_modelName_1',
  },
);

db.getCollection('SimilarImage').createIndex(
  {
    objectKey: 1,
  },
  {
    name: 'objectKey_1',
  },
);
db.getCollection('SimilarImage').createIndex(
  {
    referenceObjectKey: 1,
    objectKey: 1,
    modelName: 1,
    scoreThreshold: 1,
    score: -1,
  },
  {
    name: 'search',
  },
);

db.getCollection('QueryGraphData').createIndex(
  {
    graphId: 1.0,
    objectKey: 1.0,
  },
  {
    name: 'graphId_1_objectKey_1',
  },
);
db.getCollection('QueryGraphData').createIndex(
  {
    coordinates: '2d',
  },
  {
    name: 'coordinates_2d',
  },
);

db.getCollection('MetaData').createIndex(
  { objectKey: 1 },
  {
    unique: true,
    partialFilterExpression: { objectKey: { $exists: true } },
  },
);


//Create metadata index for name in lowercase
db.MetaData.createIndex({ nameInLowerCase: 1, _id: 1 }, { name: 'nameInLowerCase_1 _id_1' });


////////////////////////////////////////////////////////////////////////
//////////////      Insert default Embedding Model      ////////////////
////////////////////////////////////////////////////////////////////////

db.getCollection('EmbeddingModel').insert({
  "embeddingModelName": "Resnet50",
  "embeddingDimension": [2048],
  "createdAt": new Date(),
  "createdBy": "System",
  "updatedAt": new Date()
})
db.MetaData.createIndex({ 'embeddingModels.modelName': 1 });

db.MetaData.createIndex(
  { "searchString": "text" },
  { name: "TextIndex" }
)

db.TextChunkEmbedding.createIndex(
  { "uniqueName": 1 },
  { name: "uniqueName" }
)

db.TextChunkEmbedding.createIndex(
  { "id": 1 },
  { name: "id_field", unique: true }
)

var adminName = `${_getEnv("ADMIN_FIRST_NAME")} ${_getEnv("ADMIN_LAST_NAME")}`;

////////////////////////////////////////////////////////////////////////
///////////////////      Insert ModelProvider      /////////////////////
////////////////////////////////////////////////////////////////////////

db.getCollection('ModelProvider').insert({
  provider: "openai",
  apiKey: _getEnv("TENANT_OPENAI_API_KEY"),
  createdAt: new Date(),
  createdBy: adminName,
  updatedAt: new Date(),
  updatedBy: adminName,
  userId: ObjectId("6374c47ecb468b7a7a68a117"),
  teamId: ObjectId(_getEnv("TEAM_ID")),
});

////////////////////////////////////////////////////////////////////////
/////////      InsertQuickBooks DataSourceAuthorization     ////////////
////////////////////////////////////////////////////////////////////////

db.getCollection('DataSourceAuthorization').insert({
  teamId: ObjectId(_getEnv("TEAM_ID")),
  sourceType: "QuickBooks",
  companyId: _getEnv("QB_REALM_ID"),
  authStatus: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
  authTokens: {
    accessToken: _getEnv("QB_AT"),
    refreshToken: _getEnv("QB_RT"),
  }
})

////////////////////////////////////////////////////////////////////////
/////////////////////      Knowledge Blocks    /////////////////////////
////////////////////////////////////////////////////////////////////////

var knowledgeBlocks = [
  {
    "_id": ObjectId("68f196fc87aab2d3b36507c3"),
    "type": "process",
    "createdAt": new Date(),
    "isEnabled": true,
    "data": {
      "purpose": "Complete workflow for creating expenses in QuickBooks based on purchase receipts uploaded by the user.",
      "workflow_steps": [
        {
          "step": "1. Receipt Information Extraction",
          "description": "For each uploaded receipt, call the `Document_Data_Retriever` tool to extract information into two CSV files: one for header details and one for line items. Capture all fields exactly as specified below with correct column names.",
          "CSV files": [
            {
              "file_name": "{receipt_name}_header.csv",
              "columns": [
                "a) **payment_method_details**: Identify whether the expense was paid by CreditCard, Cash, or Check. If CreditCard, extract all available metadata such as bank or institution name, masked card number, etc.",
                "b) **transaction_date**: Transaction date in YYYY-MM-DD format.",
                "c) **timestamp**: Transaction time in HH:MM:SS (24-hour) format, if available. Leave blank if not present.",
                "d) **sub_total**: Subtotal amount (before tax).",
                "e) **total_amount**: Final amount charged (including taxes).",
                "f) **vendor_name**: Full vendor name – the merchant providing the goods/services, not the billed-to entity. (Home company ZOOMi Technologies Inc., 84 Leon Bell Dr, Winnipeg, must never be interpreted as a vendor.)",
                "g) **vendor_address**: Vendor address or location information, if available.",
                "h) **tax_details**: Tax breakdown as shown on the receipt.",
                "i) **currency**: Currency code if specified on the receipt. If absent, infer from vendor location (e.g., USA → USD). Leave blank if insufficient information.",
                "j) **invoice_number**: Invoice number if available, otherwise leave blank.",
                "k) **attachment_file_name**: File name of the uploaded receipt."
              ]
            },
            {
              "file_name": "{receipt_name}_lines.csv",
              "columns": [
                "a) **line_number**: Incremental number starting from 1",
                "b) **description**: The most complete description available. Do not truncate model names, item codes, or product details.",
                "c) **line_amount**: Line item subtotal (before tax).",
                "d) **tax_details**: Line item tax information if available."
              ]
            }
          ],
          "Notes": [
            "All CSV files must use the exact column names specified above.",
            "Ensure extraction captures both line items and tax details so that the sum of line item amounts plus taxes equals the total receipt amount. This serves as a consistency check for completeness and accuracy.",
            "Ensure all line items in the '{receipt_name}_lines.csv' represents valid sub transactions done under the vendor.",
            "In case that vendor was extracted as the home company name (ZOOMi Technologies Inc), the 'Document_Data_Retriever' must be re-invoked with clear instruction not to return the home company as the vendor."
          ]
        },
        {
          "step": "2. Accounting Decision Making",
          "description": [
            "Use the `Transaction_Analyzer` tool to enrich extracted data by determining vendor names, payment accounts, expense categories, and tax codes for each purchase.",
            "Set `data_source_name` to 'receipt' and pass all CSVs generated in Step 1 as input (for each receipt).",
            "The tool will return a consolidated header-level CSV (`purchases.csv`) and a line-item-level CSV (`purchase_lines.csv`) with additional columns containing the analysis results.",
            "In `purchase.csv`, the column `is_analysis_complete` indicates whether the transaction is ready to be posted to QuickBooks."
          ]
        },
        {
          "step": "3. QuickBooks Updating",
          "description": [
            "Call the `Accounting_API_Tool` with `api_task='add_expenses'` and `data_source_name='receipt'` to create QuickBooks expenses using the enriched CSVs (`purchases.csv` and `purchase_lines.csv`).",
            "Accounting_API_Tool will take care of handling the vendor existnace. It will add the vendor if not present in QuickBooks.",
            "Only transactions where `is_analysis_complete` is True will be updated in QuickBooks."
          ]
        },
        {
          "step": "4. Verification and Corrections",
          "description": [
            "Cross-check the information extracted from receipts against the QuickBooks confirmation returned from Step 3 to detect mismatches.",
            {
              "verification checklist in QuickBooks expense records:": [
                "a) Transaction dates match receipts.",
                "b) Total amounts align (accounting for QuickBooks home currency conversion where applicable).",
                "c) Vendors are correctly assigned.",
                "d) Expense accounts/categories are accurately mapped on all line items.",
                "e) Sum of line items matches the total receipt amount.",
                "f) Tax codes are correctly applied per line item.",
                "g) Global tax calculation is set correctly.",
                "h) Private Note field contains 'source=receipt' for all created expenses.",
                "i) Attachment of the receipt is successful."
              ]
            },
            "If corrections are needed, recall the `Transaction_Analyzer` with `tx_re_process_dict` (key-value pairs of transaction keys and correction instructions) to reprocess those transactions starting from Step 2."
          ]
        },
        {
          "step": "5. User Interaction",
          "description": [
            "If any transactions are flagged with `is_analysis_complete = False` in Step 2, prompt the user for missing inputs.",
            "Once user inputs are provided, restart processing from Step 2 for only the specified transaction keys using `tx_re_process_dict`."
          ]
        }
      ],
      "donts": [],
      "additional_notes": [
        "Always give unique table names when calling Document_Data_Retriever.",
        "Run Document_Data_Retriever only once per document. Extract both header and line details in a single pass.",
        "The CSV file that submits to the 'Accounting_API_Tool' must always be purchase.csv and purchase_lines.csv."
      ],
      "block_id": "quickbooks_expense_creation",
      "linked_knowledge_block_references": [],
      "pattern_keys": [
        "quickbooks_expense_creation",
        "quickbooks_purchase_creation"
      ]
    },
    "searchString": "Complete workflow for creating expenses in QuickBooks based on purchase receipts uploaded by the user.step 1. Receipt Information Extraction description For each uploaded receipt, call the `Document_Data_Retriever` tool to extract information into two CSV files: one for header details and one for line items. Capture all fields exactly as specified below with correct column names. CSV files file_name {receipt_name}_header.csv columns a) **payment_method_details**: Identify whether the expense was paid by CreditCard, Cash, or Check. If CreditCard, extract all available metadata such as bank or institution name, masked card number, etc. b) **transaction_date**: Transaction date in YYYY-MM-DD format. c) **timestamp**: Transaction time in HH:MM:SS (24-hour) format, if available. Leave blank if not present. d) **sub_total**: Subtotal amount (before tax). e) **total_amount**: Final amount charged (including taxes). f) **vendor_name**: Full vendor name – the merchant providing the goods/services, not the billed-to entity. (Home company ZOOMi Technologies Inc., 84 Leon Bell Dr, Winnipeg, must never be interpreted as a vendor.) g) **vendor_address**: Vendor address or location information, if available. h) **tax_details**: Tax breakdown as shown on the receipt. i) **currency**: Currency code if specified on the receipt. If absent, infer from vendor location (e.g., USA → USD). Leave blank if insufficient information. j) **invoice_number**: Invoice number if available, otherwise leave blank. k) **attachment_file_name**: File name of the uploaded receipt. file_name {receipt_name}_lines.csv columns a) **line_number**: Incremental number starting from 1 b) **description**: The most complete description available. Do not truncate model names, item codes, or product details. c) **line_amount**: Line item subtotal (before tax). d) **tax_details**: Line item tax information if available. Notes All CSV files must use the exact column names specified above. Ensure extraction captures both line items and tax details so that the sum of line item amounts plus taxes equals the total receipt amount. This serves as a consistency check for completeness and accuracy. Ensure all line items in the '{receipt_name}_lines.csv' represents valid sub transactions done under the vendor. In case that vendor was extracted as the home company name (ZOOMi Technologies Inc), the 'Document_Data_Retriever' must be re-invoked with clear instruction not to return the home company as the vendor. step 2. Accounting Decision Making description Use the `Transaction_Analyzer` tool to enrich extracted data by determining vendor names, payment accounts, expense categories, and tax codes for each purchase. Set `data_source_name` to 'receipt' and pass all CSVs generated in Step 1 as input (for each receipt). The tool will return a consolidated header-level CSV (`purchases.csv`) and a line-item-level CSV (`purchase_lines.csv`) with additional columns containing the analysis results. In `purchase.csv`, the column `is_analysis_complete` indicates whether the transaction is ready to be posted to QuickBooks. step 3. QuickBooks Updating description Call the `Accounting_API_Tool` with `api_task='add_expenses'` and `data_source_name='receipt'` to create QuickBooks expenses using the enriched CSVs (`purchases.csv` and `purchase_lines.csv`). Accounting_API_Tool will take care of handling the vendor existnace. It will add the vendor if not present in QuickBooks. Only transactions where `is_analysis_complete` is True will be updated in QuickBooks. step 4. Verification and Corrections description Cross-check the information extracted from receipts against the QuickBooks confirmation returned from Step 3 to detect mismatches. verification checklist in QuickBooks expense records: a) Transaction dates match receipts. b) Total amounts align (accounting for QuickBooks home currency conversion where applicable). c) Vendors are correctly assigned. d) Expense accounts/categories are accurately mapped on all line items. e) Sum of line items matches the total receipt amount. f) Tax codes are correctly applied per line item. g) Global tax calculation is set correctly. h) Private Note field contains 'source=receipt' for all created expenses. i) Attachment of the receipt is successful. If corrections are needed, recall the `Transaction_Analyzer` with `tx_re_process_dict` (key-value pairs of transaction keys and correction instructions) to reprocess those transactions starting from Step 2. step 5. User Interaction description If any transactions are flagged with `is_analysis_complete = False` in Step 2, prompt the user for missing inputs. Once user inputs are provided, restart processing from Step 2 for only the specified transaction keys using `tx_re_process_dict`.Always give unique table names when calling Document_Data_Retriever. Run Document_Data_Retriever only once per document. Extract both header and line details in a single pass. The CSV file that submits to the 'Accounting_API_Tool' must always be purchase.csv and purchase_lines.csv.quickbooks_expense_creationquickbooks_expense_creation quickbooks_purchase_creation"
  },
  {
    "_id": ObjectId("68f196fc87aab258d36507c4"),
    "type": "process",
    "createdAt": new Date(),
    "isEnabled": true,
    "data": {
      "purpose": "Complete workflow for creating bills in QuickBooks based on vendor bills uploaded by the user.",
      "workflow_steps": [
        {
          "step": "1. Bill Information Extraction",
          "description": "For each uploaded bill, call the `Document_Data_Retriever` tool to extract information into two CSV files: one for header details and one for line items. Capture all fields exactly as specified below with correct column names.",
          "CSV files": [
            {
              "file_name": "{bill_name}_header.csv",
              "columns": [
                "a) **vendor_name**: Full vendor name – the merchant who is selling the goods/services, not the billed-to party. Note that home company is ZOOMi Technologies Inc, 84 Leon Bell Dr, Winnipeg, and it should never be intepreted as a vendor.",
                "b) **vendor_address**: Vendor address or location information if available.",
                "c) **transaction_date**: Invoice date in YYYY-MM-DD format.",
                "d) **due_date**: Payment due date in YYYY-MM-DD format if specified in the bill.",
                "e) **payment_term**: In how many days, the payment is due (0 if the payment is due on the same date of the invoice).",
                "f) **sub_total**: Subtotal amount (before tax).",
                "g) **total_amount**: Final amount charged (including taxes).",
                "h) **tax_details**: Tax breakdown as shown on the bill.",
                "i) **currency**: Currency code if specified on the bill. If absent, infer from vendor location (e.g., USA -> USD). Leave blank if insufficient information.",
                "j) **invoice_number**: Invoice number in the bill if available, otherwise empty",
                "k) **attachment_file_name**: File name of the uploaded bill."
              ]
            },
            {
              "file_name": "{bill_name}_lines.csv",
              "columns": [
                "a) **line_number**: Incremental number starting from 1",
                "b) **description**: Extract the most complete description available. Do not truncate model names, item codes, or product details.",
                "c) **line_amount**: Line item subtotal (before tax).",
                "d) **tax_details**: Line item tax information if available."
              ]
            }
          ],
          "Notes": [
            "All CSV files must use the exact column names specified above.",
            "Ensure extraction captures both line items and tax details so that the sum of line item amounts plus taxes equals the total bill amount. This serves as a consistency check for completeness and accuracy.",
            "Ensure all line items in the '{bill_name}_lines.csv' represents valid sub transactions done under the vendor.",
            "In case that vendor was extracted as the home company name (ZOOMi Technologies Inc), the 'Document_Data_Retriever' must be re-invoked with clear instruction not to return the home company as the vendor."
          ]
        },
        {
          "step": "2. Accounting Decision Making",
          "description": [
            "Use the `Transaction_Analyzer` tool to enrich extracted data by determining vendor names, AP accounts, payment terms, expense categories, and tax codes for each bill.",
            "Set `data_source_name` to 'bill' and pass all CSVs generated in Step 1 as input (for each bill).",
            "The tool will return a consolidated header-level CSV (`bills.csv`) and a line-item-level CSV (`bill_lines.csv`) with additional columns containing the analysis results.",
            "In `bills.csv`, the column `is_analysis_complete` indicates whether the transaction is ready to be posted to QuickBooks."
          ]
        },
        {
          "step": "3. QuickBooks Updating",
          "description": [
            "Call the `Accounting_API_Tool` with `api_task='add_bills'` and `data_source_name='bill'` to create QuickBooks bills using the enriched CSVs (`bills.csv` and `bill_lines.csv`).",
            "Accounting_API_Tool will take care of handling the vendor existnace. It will add the vendor if not present in QuickBooks.",
            "Only transactions where `is_analysis_complete` is True will be updated in QuickBooks."
          ]
        },
        {
          "step": "4. Verification and Corrections",
          "description": [
            "Recall the information extracted from the bill and cross check it with the confirmation of QuickBooks updated received from step 3 to detect any mismatches.",
            {
              "verification checklist in QuickBooks bill records:": [
                "a) AP accounts are correct.",
                "b) Transaction and due dates match bills.",
                "c) Total amounts align, accounting for cases where QuickBooks converts to home currency.",
                "d) Vendors are correctly assigned.",
                "e) Expense accounts/categories are correctly mapped in all line items.",
                "f) Sum of line items matches total bill amount.",
                "g) Tax codes are correctly applied per line item.",
                "h) Global tax calculation is set correctly.",
                "i) Private note field must contain 'source=bill' for all created bills."
              ]
            },
            "If corrections are needed, recall the `Transaction_Analyzer` with `tx_re_process_dict` (key-value pairs of transaction keys and correction instructions) to reprocess those transactions starting from Step 2."
          ]
        },
        {
          "step": "5. User Interaction",
          "description": [
            "If any transactions are flagged with `is_analysis_complete = False` in Step 2, prompt the user for missing inputs.",
            "Once user inputs are provided, restart processing from Step 2 for only the specified transaction keys using `tx_re_process_dict`."
          ]
        }
      ],
      "donts": [],
      "additional_notes": [
        "Always give unique table names when calling Document_Data_Retriever.",
        "Run Document_Data_Retriever only once per document. Extract both header and line details in a single pass.",
        "The CSV file that submits to the 'Accounting_API_Tool' must always be bills.csv and bill_lines.csv."
      ],
      "block_id": "quickbooks_bill_creation",
      "linked_knowledge_block_references": [],
      "pattern_keys": [
        "quickbooks_bill_creation",
        "quickbooks_vendor_invoice"
      ]
    },
    "searchString": "Complete workflow for creating bills in QuickBooks based on vendor bills uploaded by the user.step 1. Bill Information Extraction description For each uploaded bill, call the `Document_Data_Retriever` tool to extract information into two CSV files: one for header details and one for line items. Capture all fields exactly as specified below with correct column names. CSV files file_name {bill_name}_header.csv columns a) **vendor_name**: Full vendor name – the merchant who is selling the goods/services, not the billed-to party. Note that home company is ZOOMi Technologies Inc, 84 Leon Bell Dr, Winnipeg, and it should never be intepreted as a vendor. b) **vendor_address**: Vendor address or location information if available. c) **transaction_date**: Invoice date in YYYY-MM-DD format. d) **due_date**: Payment due date in YYYY-MM-DD format if specified in the bill. e) **payment_term**: In how many days, the payment is due (0 if the payment is due on the same date of the invoice). f) **sub_total**: Subtotal amount (before tax). g) **total_amount**: Final amount charged (including taxes). h) **tax_details**: Tax breakdown as shown on the bill. i) **currency**: Currency code if specified on the bill. If absent, infer from vendor location (e.g., USA -> USD). Leave blank if insufficient information. j) **invoice_number**: Invoice number in the bill if available, otherwise empty k) **attachment_file_name**: File name of the uploaded bill. file_name {bill_name}_lines.csv columns a) **line_number**: Incremental number starting from 1 b) **description**: Extract the most complete description available. Do not truncate model names, item codes, or product details. c) **line_amount**: Line item subtotal (before tax). d) **tax_details**: Line item tax information if available. Notes All CSV files must use the exact column names specified above. Ensure extraction captures both line items and tax details so that the sum of line item amounts plus taxes equals the total bill amount. This serves as a consistency check for completeness and accuracy. Ensure all line items in the '{bill_name}_lines.csv' represents valid sub transactions done under the vendor. In case that vendor was extracted as the home company name (ZOOMi Technologies Inc), the 'Document_Data_Retriever' must be re-invoked with clear instruction not to return the home company as the vendor. step 2. Accounting Decision Making description Use the `Transaction_Analyzer` tool to enrich extracted data by determining vendor names, AP accounts, payment terms, expense categories, and tax codes for each bill. Set `data_source_name` to 'bill' and pass all CSVs generated in Step 1 as input (for each bill). The tool will return a consolidated header-level CSV (`bills.csv`) and a line-item-level CSV (`bill_lines.csv`) with additional columns containing the analysis results. In `bills.csv`, the column `is_analysis_complete` indicates whether the transaction is ready to be posted to QuickBooks. step 3. QuickBooks Updating description Call the `Accounting_API_Tool` with `api_task='add_bills'` and `data_source_name='bill'` to create QuickBooks bills using the enriched CSVs (`bills.csv` and `bill_lines.csv`). Accounting_API_Tool will take care of handling the vendor existnace. It will add the vendor if not present in QuickBooks. Only transactions where `is_analysis_complete` is True will be updated in QuickBooks. step 4. Verification and Corrections description Recall the information extracted from the bill and cross check it with the confirmation of QuickBooks updated received from step 3 to detect any mismatches. verification checklist in QuickBooks bill records: a) AP accounts are correct. b) Transaction and due dates match bills. c) Total amounts align, accounting for cases where QuickBooks converts to home currency. d) Vendors are correctly assigned. e) Expense accounts/categories are correctly mapped in all line items. f) Sum of line items matches total bill amount. g) Tax codes are correctly applied per line item. h) Global tax calculation is set correctly. i) Private note field must contain 'source=bill' for all created bills. If corrections are needed, recall the `Transaction_Analyzer` with `tx_re_process_dict` (key-value pairs of transaction keys and correction instructions) to reprocess those transactions starting from Step 2. step 5. User Interaction description If any transactions are flagged with `is_analysis_complete = False` in Step 2, prompt the user for missing inputs. Once user inputs are provided, restart processing from Step 2 for only the specified transaction keys using `tx_re_process_dict`.Always give unique table names when calling Document_Data_Retriever. Run Document_Data_Retriever only once per document. Extract both header and line details in a single pass. The CSV file that submits to the 'Accounting_API_Tool' must always be bills.csv and bill_lines.csv.quickbooks_bill_creationquickbooks_bill_creation quickbooks_vendor_invoice"
  },
  {
    "_id": ObjectId("68f2fd87905cab613c68e0de"),
    "type": "process",
    "createdAt": new Date(),
    "isEnabled": true,
    "data": {
      "purpose": "Complete workflow for matching bank statements with QuickBooks.",
      "workflow_steps": [
        {
          "step": "1: Extract all transactions from the uploaded statement",
          "procedure": "Use the `Document_Data_Retriever` tool to extract information into two structured CSV files. When instructing the tool, you MUST explicitly list all required fields with their guidelines exactly as described below. Do not omit or assume fields — the extractor must be told precisely what to capture.",
          "extraction_outputs": [
            {
              "file_name": "{statement_file_name}_summary.csv",
              "description": "A single-row CSV containing the header information of the bank statement (typically on the first page).",
              "columns": [
                "institution_name – Bank or financial institution name",
                "account_info – Account details (e.g., bank account, credit card number, or account type)",
                "start_date – Statement start date in YYYY-MM-DD format",
                "end_date – Statement end date in YYYY-MM-DD format",
                "starting_balance – Opening balance of the period (if available)",
                "ending_balance – Closing balance of the period (if available)"
              ]
            },
            {
              "file_name": "{statement_file_name}_transactions.csv",
              "description": "A multi-row CSV with one record for each withdrawal (debit in case of bank statements) transaction in the statement (may span multiple pages).",
              "columns": [
                "transaction_date – Transaction date (YYYY-MM-DD format)",
                "description – Transaction description/details as shown in the statement",
                "total_amount – Transaction amount (Make it a positive number whether its withdrawal or deposit)",
                "direction - Must be either 'withdrawal' or 'deposit'.",
                "balance - Current balance of the account if available."
              ]
            }
          ],
          "notes": [
            "Document_Data_Retriever must check both pages to determine the beginning and ending balance of the statement.",
            "Instruct the 'Document_Data_Retriever' to extract the information for statement summary and transaction list separately to ensure better accuracy.",
            "Instruct the 'Document_Data_Retriever' to verify the accuracy of extracted transactions by tallying the sum of transaction amounts (considering the debit/credit) equals the difference between the starting and ending balances after the extraction. In case of any discrepancy, re-extract the transactions and check whether the tallying is correct or a clue is found to resolve the discrepancy.",
            "All CSV files must use the exact column names specified above."
          ]
        },
        {
          "step": "2: Match statement transactions with QuickBooks records",
          "procedure": "Call the `Accounting_API_Tool` with `api_task = 'match_statement'` and `data_file_names = ['{statement_file_name}_transactions.csv']`. The tool will attempt to match each statement transaction with existing QuickBooks transactions recorded between 5 days before the statement start date and the statement end date. The tool will return a CSV named `statement_qb_matches.csv`, which includes the original statement transactions plus the following new columns: `match_status` (Matched / Unmatched), `qb_transaction_id`, `qb_txn_date`, `qb_payee`, `qb_amount`, and `qb_line_descriptions`."
        },
        {
          "step": "3: Further analyze unmatched transactions",
          "procedure": "First prepare {statement_file_name}_unmatched_transactions.csv containing all unmatched using the output files from the step 2. Then call 'Transaction_Analyzer' with data_source_name 'statement' and data_file_names = ['{statement_file_name}_summary.csv','{statement_file_name}_unmatched_transactions.csv'].",
          "notes": [
            "Always the the statement summary file name should end with '_summary.csv' and transaction file name should end with '_transactions.csv'"
          ]
        },
        {
          "step": "4: Generate and present the final analysis report",
          "procedure": "Combine the results from Step 2 and 3 to the user as a complete tabular report. Show these information in tabular form: Transaction matching report (from step2), List of purchases and bill payments to create/update including user inputs required (from step3)."
        }
      ],
      "linked_knowledge_block_references": [],
      "donts": [],
      "additional_notes": [],
      "block_id": "quickbooks_bank_match",
      "pattern_keys": [
        "quickbooks_bank_statement_matching"
      ]
    },
    "searchString": "Complete workflow for matching bank statements with QuickBooks"
  }
]

db.KnowledgeBlock.insertMany(knowledgeBlocks);


////////////////////////////////////////////////////////////////////////
/////////////////////      Knowledge Trees    /////////////////////////
////////////////////////////////////////////////////////////////////////
var knowledgeTrees = [
  {
    "_id": ObjectId("68f196fc87aab296676507c5"),
    "type": "process",
    "parent": "Expenses",
    "nodes": [
      {
        "pattern": "Expenses creation and attachment workflow",
        "pattern_key": "quickbooks_expense_creation"
      }
    ],
    "createdAt": new Date()
  },
  {
    "_id": ObjectId("68f196fc87aab21ef46507c6"),
    "type": "process",
    "parent": "Bills",
    "nodes": [
      {
        "pattern": "Bill creation and attachment workflow",
        "pattern_key": "quickbooks_bill_creation"
      }
    ],
    "createdAt": new Date()
  },
  {
    "_id": ObjectId("68f196fc87aab202726507c7"),
    "type": "process",
    "parent": "Bank Reconciliation",
    "nodes": [
      {
        "pattern": "Bank statement matching with QuickBooks",
        "pattern_key": "quickbooks_bank_statement_matching"
      },
      {
        "pattern": "Bank statement reconcile workflow",
        "pattern_key": "quickbooks_bank_rec"
      }
    ],
    "createdAt": new Date()
  }
];

db.KnowledgeTree.insertMany(knowledgeTrees);


