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

// Primary indexes for DataBlocks collection
db.DataBlocks.createIndex({ session_id: 1 });
db.DataBlocks.createIndex({ conversation_id: 1 });
db.DataBlocks.createIndex({ session_id: 1, conversation_id: 1 });

// Status and type indexes for filtering
db.DataBlocks.createIndex({ status: 1 });
db.DataBlocks.createIndex({ session_type: 1 });
db.DataBlocks.createIndex({ final: 1 });

// Timestamp indexes for sorting and time-based queries
db.DataBlocks.createIndex({ created_at: -1 });
db.DataBlocks.createIndex({ updated_at: -1 });

// Compound indexes for common query patterns
db.DataBlocks.createIndex({ session_id: 1, status: 1 });
db.DataBlocks.createIndex({
  conversation_id: 1,
  session_id: 1,
  created_at: -1,
});
db.DataBlocks.createIndex({ session_id: 1, final: 1 });

// Index for blocks array queries (if you query by block properties)
db.DataBlocks.createIndex({ "blocks.block_id": 1 });
db.DataBlocks.createIndex({ "blocks.block_type": 1 });
db.DataBlocks.createIndex({ "blocks.status": 1 });

// Primary indexes for Sessions collection
db.Sessions.createIndex({ conversation_id: 1 });
db.Sessions.createIndex({ user_id: 1 });
db.Sessions.createIndex({ status: 1 });
db.Sessions.createIndex({ type: 1 });

// Timestamp indexes for sorting and time-based queries
db.Sessions.createIndex({ created_at: -1 });
db.Sessions.createIndex({ updated_at: -1 });

// Compound indexes for common query patterns
db.Sessions.createIndex({ conversation_id: 1, status: 1 });
db.Sessions.createIndex({ user_id: 1, status: 1 });
db.Sessions.createIndex({ conversation_id: 1, created_at: -1 });
db.Sessions.createIndex({ user_id: 1, created_at: -1 });
db.Sessions.createIndex({ conversation_id: 1, type: 1 });

// Primary key and user-based indexes
db.Conversations.createIndex({ userId: 1 });
db.Conversations.createIndex({ status: 1 });
db.Conversations.createIndex({ type: 1 });
db.Conversations.createIndex({ isInternal: 1 });
db.Conversations.createIndex({ isViewed: 1 });
db.Conversations.createIndex({ isFavourite: 1 });

// Timestamp indexes for sorting and time-based queries
db.Conversations.createIndex({ created_at: -1 });
db.Conversations.createIndex({ updated_at: -1 });

// User conversations with status filtering
db.Conversations.createIndex({ userId: 1, status: 1 });
db.Conversations.createIndex({ userId: 1, type: 1 });
db.Conversations.createIndex({ userId: 1, isInternal: 1 });
db.Conversations.createIndex({ userId: 1, isViewed: 1 });
db.Conversations.createIndex({ userId: 1, isFavourite: 1 });

// User conversations with time sorting
db.Conversations.createIndex({ userId: 1, createdAt: -1 });
db.Conversations.createIndex({ userId: 1, updatedAt: -1 });

// Status-based queries with time sorting
db.Conversations.createIndex({ status: 1, createdAt: -1 });
db.Conversations.createIndex({ status: 1, updatedAt: -1 });

// Type-based queries with time sorting
db.Conversations.createIndex({ type: 1, createdAt: -1 });
db.Conversations.createIndex({ type: 1, updatedAt: -1 });

// Internal conversations filtering
db.Conversations.createIndex({ isInternal: 1, createdAt: -1 });
db.Conversations.createIndex({ isInternal: 1, updatedAt: -1 });

// Favourite conversations
db.Conversations.createIndex({ userId: 1, isFavourite: 1, createdAt: -1 });
db.Conversations.createIndex({ userId: 1, isFavourite: 1, updatedAt: -1 });

// Text search on conversation name
db.Conversations.createIndex({ name: "text" });
db.Conversations.createIndex({ userName: "text" });

db.DataBlocks.createIndex({ user_visibility: 1 });

var adminName = `${_getEnv("ADMIN_FIRST_NAME")} ${_getEnv("ADMIN_LAST_NAME")}`;

db.getCollection("APIConfigs").insert({
  provider: "openai",
  apiKey: _getEnv("OPENAI_API_KEY"),
  apiUrl: "",
  teamId: ObjectId(_getEnv("TEAM_ID")),
  updatedBy: adminName,
  createdBy: adminName,
  createdAt: new Date(),
  updatedAt: new Date(),
});

var systemData = {
  teamId: ObjectId(_getEnv("TEAM_ID")),
  lastDataDictionarySyncedAt: null,
  isInitialKBCreated: false,
  qbSyncStatus: "syncing",
};

// ---------------------------------------------------------------------------
// Enterprise tenant
//
// An enterprise tenant is bought rather than signed up for. It has no Stripe
// subscription to derive an entitlement from, and no QuickBooks connection to
// finish onboarding with, so both are stated here instead of discovered.
//
// BILLING_PLAN is the switch. Empty -- which is every ordinary install -- and
// nothing below runs: no billing record is written and onboarding starts from
// the beginning, exactly as it does today.
// ---------------------------------------------------------------------------
var billingPlan = (_getEnv("BILLING_PLAN") || "").trim();

if (billingPlan) {
  // OnboardingStateV2.ONBOARDING_COMPLETED, and the companion flag. Both are
  // what UserOnboardingServiceV2.on_onboarding_complete() writes, and both are
  // read: the flag by the v1 endpoint, the status by the v2 service, whose
  // start_discover_bookkeeping_status returns early on seeing it. So this is a
  // real bypass of the QuickBooks discovery flow rather than a hidden one.
  systemData.onboardingStatus = 1900;
  systemData.isUserOnboardingComplete = true;

  var billingCurrency = (_getEnv("BILLING_CURRENCY") || "USD").trim().toUpperCase();
  var companyTimezone = (_getEnv("COMPANY_TIMEZONE") || "America/Winnipeg").trim();

  var now = new Date();
  var nowISO = now.toISOString();

  // The usage window is the tenant's local calendar month -- enterprise has no
  // Stripe renewal webhook to close a period.
  //
  // Seeded here as the current UTC month, not the tenant's local one. Resolving
  // an IANA zone needs Intl, and the mongo image's shell cannot be relied on to
  // have it -- a timeZone option it ignores would give a wrong answer that
  // looks right. UTC is the honest approximation, and it is corrected on the
  // first read: _refresh_enterprise_period_if_needed compares the cached window
  // against the tenant's local calendar month and resets it when they differ.
  // companyTimezone below is what it uses to do that.
  var periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  var periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  var periodStartISO = periodStart.toISOString();

  db.getCollection("BillingEntitlementCache").insert({
    tenantId: ObjectId(_getEnv("TEAM_ID")),
    billingStatus: "active",
    billingCurrency: billingCurrency,
    currentBillingPlan: billingPlan,
    accountEnabled: true,
    deactivationReason: null,
    companyTimezone: companyTimezone,
    subscription: {
      subscriptionStartAt: nowISO,
      currentPeriodStart: periodStartISO,
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      scheduledDowngrade: {
        isScheduled: false,
        targetPlanId: null,
      },
    },
    usage: {
      // UNLIMITED_SENTINEL. Every limit check in the chat backend handles it;
      // a 0 here would read as a plan with no allowance at all.
      includedTransactionLimit: -1,
      includedInsightLimit: -1,
      transactionsUsedInPeriod: 0,
      insightsUsedInPeriod: 0,
      transactionsOverageCount: 0,
      insightsOverageCount: 0,
      categoryUsage: {},
      usageCountFromDate: periodStartISO,
    },
    lastEventId: "provision:enterprise:" + _getEnv("TEAM_ID") + ":" + now.getTime(),
    stateVersion: 1,
    fetchedAt: nowISO,
    staleAfter: new Date(now.getTime() + 5 * 60 * 1000).toISOString(),
    expiresAt: null,
    createdAt: nowISO,
    updatedAt: nowISO,
  });

  print(
    "Enterprise tenant: " + billingPlan + " entitlement (" + billingCurrency +
    ", " + companyTimezone + "), onboarding marked complete."
  );
}

db.getCollection("SystemData").insert(systemData);
