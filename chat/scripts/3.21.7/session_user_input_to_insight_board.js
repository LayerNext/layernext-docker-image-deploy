/**
 * MongoDB Shell Script: Backfill sessionUserInput to InsightDashboard
 * 
 * This script backfills the sessionUserInput field in InsightDashboard collection
 * by retrieving user_input from the Sessions collection based on sessionId.
 * 
 * Usage: mongo chatDB scripts/3.21.7/session_user_input_to_insight_board.js
 * 
 */

print("Starting InsightDashboard sessionUserInput Backfill");
print("=".repeat(60));

// Configuration
var timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);


print("Timestamp: " + timestamp);
print("=".repeat(60));

// Statistics tracking
var stats = {
    total_dashboards: 0,
    dashboards_without_sessionUserInput: 0,
    dashboards_updated: 0,
    sessions_not_found: 0,
    sessions_without_user_input: 0,
    errors: 0
};

// Step 1: Find InsightDashboard documents that need updating
print("Step 1: Finding InsightDashboard documents without sessionUserInput...");

// Find dashboards where sessionUserInput is missing, null, empty, or empty string
var dashboardsToUpdate = db.InsightDashboard.find({
    $or: [
        { sessionUserInput: { $exists: false } },
        { sessionUserInput: null },
        { sessionUserInput: "" },
    ],
    sessionId: { $exists: true, $ne: null }
}).toArray();

stats.total_dashboards = db.InsightDashboard.countDocuments({});
stats.dashboards_without_sessionUserInput = dashboardsToUpdate.length;

print("Total InsightDashboard documents: " + stats.total_dashboards);
print("Dashboards without sessionUserInput: " + stats.dashboards_without_sessionUserInput);

if (stats.dashboards_without_sessionUserInput === 0) {
    print("All InsightDashboard documents already have sessionUserInput");
    print("=".repeat(60));
    quit();
}

// Step 2: Process each dashboard
print("");
print("Step 2: Processing dashboards and updating sessionUserInput...");

var processed = 0;
var batchSize = 100;

for (var i = 0; i < dashboardsToUpdate.length; i++) {
    var dashboard = dashboardsToUpdate[i];
    var dashboardId = dashboard._id;
    var sessionId = dashboard.sessionId;
    
    try {
        // Handle sessionId as both ObjectId and string
        var sessionIdQuery;
        if (sessionId instanceof ObjectId) {
            sessionIdQuery = { _id: sessionId };
        } else if (typeof sessionId === "string") {
            try {
                sessionIdQuery = { _id: ObjectId(sessionId) };
            } catch (e) {
                sessionIdQuery = { _id: sessionId };
            }
        } else {
            stats.errors++;
            print("Dashboard " + dashboardId + " has invalid sessionId type: " + typeof sessionId);
            continue;
        }
        
        // Find the session in Sessions collection
        var session = db.Sessions.findOne(sessionIdQuery);
        
        if (!session) {
            stats.sessions_not_found++;
            print("Session not found for dashboard " + dashboardId + " (sessionId: " + sessionId + ")");
            continue;
        }
        
        // Get user_input from session
        var userInput = session.user_input || "";
        
        if (!userInput || userInput.trim() === "") {
            stats.sessions_without_user_input++;
            print("Session " + sessionId + " has no user_input for dashboard " + dashboardId);
            continue;
        }
        
        // Update the dashboard with sessionUserInput
        var updateResult = db.InsightDashboard.updateOne(
            { _id: dashboardId },
            { $set: { sessionUserInput: userInput } }
        );
        
        if (updateResult.modifiedCount > 0) {
            stats.dashboards_updated++;
            processed++;
            
            // Print progress every batchSize items
            if (processed % batchSize === 0) {
                print("Processed " + processed + " / " + dashboardsToUpdate.length + " dashboards...");
            }
        } else {
            print("Failed to update dashboard " + dashboardId + " (no modifications)");
        }
        
    } catch (error) {
        stats.errors++;
        print("Error processing dashboard " + dashboardId + ": " + error.message);
    }
}

// Step 3: Validation
print("");
print("Step 3: Validating results...");

var remainingWithoutSessionUserInput = db.InsightDashboard.countDocuments({
    $or: [
        { sessionUserInput: { $exists: false } },
        { sessionUserInput: null },
        { sessionUserInput: "" }
    ],
    sessionId: { $exists: true, $ne: null }
});

var dashboardsWithSessionUserInput = db.InsightDashboard.countDocuments({
    sessionUserInput: { $exists: true, $ne: null, $ne: "" }
});

// Print summary
print("");
print("=".repeat(60));
print("BACKFILL SUMMARY");
print("=".repeat(60));
print("Total InsightDashboard documents: " + stats.total_dashboards);
print("Dashboards without sessionUserInput (before): " + stats.dashboards_without_sessionUserInput);
print("Dashboards updated: " + stats.dashboards_updated);
print("Dashboards with sessionUserInput (after): " + dashboardsWithSessionUserInput);
print("Remaining without sessionUserInput: " + remainingWithoutSessionUserInput);
print("");
print("Issues encountered:");
print("  - Sessions not found: " + stats.sessions_not_found);
print("  - Sessions without user_input: " + stats.sessions_without_user_input);
print("  - Errors: " + stats.errors);
print("=".repeat(60));

if (remainingWithoutSessionUserInput === 0) {
    print("All eligible InsightDashboard documents now have sessionUserInput!");
} else {
    print("Some dashboards still don't have sessionUserInput:");
    print("   - These may have missing/invalid sessionId");
    print("   - Or their sessions don't have user_input");
    print("   - Check the warnings above for details");
}

print("=".repeat(60));
print("Backfill completed");
print("=".repeat(60));