db.SystemData.updateOne(
  {},
  {
    $set: {
      "dataSourcesOverview.documentDataSourceOverview": {
        "data_source_name": "documents",
        "type": "document",
        "dataset": "",
        "availability": "",
        "data_source_overview": "The Data Source 'documents' consists of various categorized folders that store essential document types used in professional and personal contexts.",
        "tables": [
          {
            "name": "agenda",
            "overview": "This is a folder containing PDFs having a list or program of things to be done or considered, often for a meeting or event."
          },
          {
            "name": "contract",
            "overview": "This is a document folder which contains contract documents, contracts signed between two or more parties (e.g. house rental, bank accounts, construction, and employment contracts)."
          },
          {
            "name": "letter",
            "overview": "This is a document folder which contains letters sent or received between two parties (e.g. interview letters, thank you letters, resignation letters)."
          },
          {
            "name": "resume",
            "overview": "This is a document folder which contains resumes (CVs), typically from candidates looking for career opportunities."
          },
          {
            "name": "statement",
            "overview": "This folder contains account statements or records of transactions."
          },
          {
            "name": "invoice",
            "overview": "This folder contains documents issued by a seller to a buyer, detailing products or services provided, and requesting payment."
          },
          {
            "name": "policy",
            "overview": "This folder contains documents with various policy statements."
          },
          {
            "name": "manual",
            "overview": "This folder contains guides that instruct users on operating a machine or system."
          },
          {
            "name": "proposal",
            "overview": "This folder contains documents such as project or business proposals."
          },
          {
            "name": "receipt",
            "overview": "This folder contains documents such as receipts, which are written acknowledgments that specified money has been received."
          },
          {
            "name": "report",
            "overview": "This folder contains detailed accounts or statements describing an event, situation, or the like, usually as the result of observation or inquiry."
          },
          {
            "name": "transcript",
            "overview": "A written, printed, or typed copy of words that have been spoken."
          }
        ]
      }
    }
  }
);
