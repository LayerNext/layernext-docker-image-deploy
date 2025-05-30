// Define the processString function to tokenize and remove duplicate tokens
function processString(inputString) {
    const pattern = /[\-\u2010-\u2015\u2043\u2212\u2500-\u2502\u2E3A\u2E3B\u2E40\u301C\u3030\uFE31\uFE32\uFE58\uFE63\uFF0D #@&*{}\[\]()<>?\/!%^+\|\\'"\u2018\u2019\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A.,;:!?…\s]+/;
    const tokens = inputString.split(pattern);
    const uniqueTokens = Array.from(new Set(tokens)); // Remove duplicates
    return uniqueTokens.join(' '); // Re-join tokens into a single string without duplicates
}

const batchSize = 10;
const collection = db.getCollection('MetaData');

// Function to process batches
function processBatch(skip) {
    let bulkOps = [];
    collection.find({ searchString: { $exists: true } }).skip(skip).limit(batchSize).forEach(function (doc) {
        const updatedSearchString = processString(doc.searchString);
        bulkOps.push({
            updateOne: {
                filter: { _id: doc._id },
                update: { $set: { searchString: updatedSearchString } }
            }
        });

        if (bulkOps.length === batchSize) {
            // Execute the bulk operation when the batch size is reached
            collection.bulkWrite(bulkOps);
            bulkOps = []; // Reset bulkOps array
        }
    });

    // Check if there are any remaining operations to execute
    if (bulkOps.length > 0) {
        collection.bulkWrite(bulkOps);
    }
}

// Determine the total number of documents to process
const totalDocs = collection.countDocuments({ searchString: { $exists: true } });
let processed = 0;

while (processed < totalDocs) {
    processBatch(processed);
    processed += batchSize; // Move the window to the next batch
    print(`Processed ${processed} out of ${totalDocs} documents...`);
}

print('Documents have been updated with processed search strings.');
