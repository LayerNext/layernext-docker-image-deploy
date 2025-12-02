# Deployment Notes

## 3.21.8

- **Version**: `v3.21.8`
- **Beta release date → Dev deployment**: `2025-12-01`
- **Release date → Prod deployment**: `2025-12-01`

## Beta Release Checklist

- [ ] Code merged to `layernext-tenant-dev`
- [ ] Docker images built and pushed to `layernextai/` docker hub repository
- [ ] AWS AMI built for development environment
- [ ] Central server updated for development environment
- [ ] backward compatibility verified (.env and db changes)
- [ ] check python SDK version 3.21.8b3

## Release Checklist

- [ ] Code merged to `layernext-tenant`
- [ ] Docker images built and pushed to `layernextai/` docker hub repository
- [ ] AWS AMI built for production environment
- [ ] beta version verified
- [ ] Central server updated for production environment
- [ ] backward compatibility verified (.env and db changes)
- [ ] check python SDK version 3.21.8b3

## Change Log

### Central Server

- After setting up completed then navigated to history page in chat app with ongoing chat id

### Account App

### Datalake App

- Business Overview update method added
- fivetran qb refresh token sync periodically

### Chat App

1. Fixed the issue of not properly answering user's clarifications for transactions.
   - Analyzer system instruction - Instruct to give priority to the given user instruction
   - Master agent instructions - Enforce it's scope not to answer questions for transactions analyzed by analyzer
2. Fixed issues with updating and creating entries in QuickBooks.
   - Accounting API tool crash fix on update flow
   - Fixed missing of line item tax in purchase updates
   - Fixed issue with creating new entries such as Customers
3. Fixed issue of including tax amount in line items by instruction enhancement in transaction analyzer tool.
4. De-prioritization of knowledge block creation LLM calls - only the user initiated questions will run with priority although IS_OPENAI_PRIORITY_ENABLED environment variable is set to true. (Added is_user_triggered flag to all LLM agent and sub agent classes).
   5 . Schedule the initial knowledge block creation process between 8 PM to 6 AM in user's timezone.
5. Re-factored knowledge block initial and run creation / update code by moving all relevant functions to KnowledgeGeneratorAgent class instead of doing it in TransactionAnalyzerAgent.
6. Metadata finder returns a message to indicate SQL data still not available until the data sync is complete

- The AI should be aware of this and switch to API for data retrieval.

8. Direct user to onboarding conversation at startup and generate the business overview based on it.

- Added mode for Business overview tool to update the business overview (updated system instructions and tool functionality)
- Business overview in MetaLake should update.

9. Implemented a token usage service to track and collect statistics for LLM calls.

## Additional Notes

- Python sdk is added 3.21.8b3

## 3.21.7

- **Version**: `v3.21.7`
- **Beta release date → Dev deployment**: `2025-11-27`
- **Release date → Prod deployment**: `2025-11-27`

## Beta Release Checklist

- [ ] Code merged to `layernext-tenant-dev`
- [ ] Docker images built and pushed to `layernextai/` docker hub repository
- [ ] AWS AMI built for development environment
- [ ] Central server updated for development environment
- [ ] backward compatibility verified (.env and db changes)

## Release Checklist

- [ ] Code merged to `layernext-tenant`
- [ ] Docker images built and pushed to `layernextai/` docker hub repository
- [ ] AWS AMI built for production environment
- [ ] beta version verified
- [ ] Central server updated for production environment
- [ ] backward compatibility verified (.env and db changes)

## Change Log

### Central Server

1. Added an email scrubber feature to automatically create conversations in the appropriate tenant system based on incoming emails.

### Account App

1. Added new fields(`isOnboardedUser and teamId`) for the getUserList internal API response.

### Datalake App

1. Knowledge enhancement to avoid agent using invoice total to capture the revenue.

### Chat App

1. Fixed the issue of master agent handling the user's answer when processing tasks - prevented it from analyzing the transaction or asking clarifications from user.
2. Enforced the transaction analyzer to do deeper analysis before coming to conclusions on already posted transactions and matching invoices / bills.
3. Fixed the issue of final answer list not loading to insight board main graph rendering when agent do a followup question.
4. Fixed the issue of missing log folder when generating insight report.
5. Enabled the agent to understand the content of the uploaded files and decide what action to take even if the user doesn't mention anything in the request.
6. Send layernext version to chat app
7. Insight board user question related data is added.
8. Added an endpoint to create conversations from emails processed by the CMS system.

## Backward Compatibility Notes

1. Need DB script to get insight board user question showing. ( layernext-docker-image-deploy --> scripts --> 3.21.7 ---> session_user_input_to_insight_board.js)
2. Make sure has this env variable in layernext-docker-image-deploy --> chat -> docker-compose.yml -> llm_fast_api_backend -> environment -> LAYERNEXT_VERSION with latest release version.
3. Need to verify whether the CMS_TOKEN environment variable exists; if not, it should be added.
4. Add the `isOnboardedUser` flag to the previously deployed SSO backend database (applies only to the system’s first user(value `true`)).

## Additional Notes

-

## 3.21.6

- **Version**: `v3.21.6`
- **Beta release date → Dev deployment**: `2025-11-21`
- **Release date → Prod deployment**: `2025-11-24`

## Beta Release Checklist

## Release Checklist

## Change Log

### Central Server

### Account App

### Datalake App

### Chat App

- Fixed screenshot attachment file accessing issue due to non-printable characters in file name: Renamed file names before processing to avoid the problem.
- Enabled the transaction analyzer to use generic function to create or update an entry in accounting system.
- Fixed the issue of missing amount in journal entries by using enhanced output from datalake for 'Account_Transactions' records.
- Instruction change to improve the handling payroll expenses by transaction analyzer: Added more scenarios to expense processing prompt.
- Disabled the master agent from posting to QuickBooks by removing the instructions for updating functionalities (eg: add_expenses, add_bills, update_expenses, etc).
- Minor instruction change to confusion by master agent when processing user question in a task: Make it aware that the transaction is not posted it needs to help analyzer to complete it with user feedback/input.
- Fixed result confirmation of transfer transactions to avoid trying to post again.
- Simplified analyzer output processing to get the transaction posting status correctly.
- Fixed the disconnection of context between the master agent and transaction analyzer when re-invoking from user feedback (Done update to master agent system instruction).
- Updated the transaction query function (in Accounting API tool) to fix missing of other party account information in case of transfers and journal entries (Fixed empty result when filtering by other party account id).
- The uploaded attachments for conversation can be preview by clicking data sources in separate browser
- handle automation task status update

## Backward Compatibility Notes

## Additional Notes

-

# 3.21.5

- **Version**: `v3.21.5`
- **Beta release date → Dev deployment**: `2025-11-19`
- **Release date → Prod deployment**: `2025-11-20`

## Beta Release Checklist

- [ ] Code merged to `layernext-tenant-dev`
- [ ] Docker images built and pushed to `layernextai/` docker hub repository
- [ ] AWS AMI built for development environment
- [ ] Central server updated for development environment
- [ ] backward compatibility verified (.env and db changes)

## Release Checklist

- [ ] Code merged to `layernext-tenant`
- [ ] Docker images built and pushed to `layernextai/` docker hub repository
- [ ] AWS AMI built for production environment
- [ ] beta version verified
- [ ] Central server updated for production environment
- [ ] backward compatibility verified (.env and db changes)

## Change Log

### Central Server

- Added a new feature to check whether a DNS record already exists for a tenant name, and if it does, generate a new random tenant name by adding a numeric suffix.
- Fixed an issue where sync failures were not being properly detected through the webhook.

### Account App

- SSO Front end profile section bug fixing

### Datalake App

- Added automatic connection status updates to the data_sources table during the initial QB-Fivetran sync.
- Included a new connectionStatus field in the getDataDictionarySectionList output
- Initial sync success notification message to all users via email and push notification.

### Chat App

- Modified sorting order of task list.(Now sort in this order [IN_PROGRESS, TO_DO, COMPLETED]) and new created task will be on top .
- notify all user after quick book connectivity fails via email and push notifications.
- Initial sync success notification message to all users via email and push notification.

## Backward Compatibility Notes

- Need to update the existing system’s AutomationTask collection by swapping the status values 10 and 20 (To-Do - In-Progress).Scripts is in 3.21.5 script directory in chat.
- Need to run DB script to ensure existing users not get the quickbook data initial sync email and notification

## Additional Notes

-
