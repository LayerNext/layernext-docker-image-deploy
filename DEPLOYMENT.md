# Deployment Notes

## 3.21.7

- **Version**: `v3.21.6`
- **Beta release date → Dev deployment**: `2025-11-21`
- **Release date → Prod deployment**: `2025-11-24`

## Beta Release Checklist

## Release Checklist

[] - chat -> docker-compose.yml -> llm_fast_api_backend -> environment -> LAYERNEXT_VERSION should be updated each and every release with new version number. EX:LAYERNEXT_VERSION=3.21.7

## Change Log

### Central Server

- Added an email scrubber feature to automatically create conversations in the appropriate tenant system based on incoming emails.

### Account App

- Added new fields(`isOnboardedUser and teamId`) for the getUserList internal API response.

### Datalake App

### Chat App

- LayerNext version is added in setting tab.
- Datasource previewer default favicon change.
- Added an endpoint to create conversations from emails processed by the CMS system.

## Backward Compatibility Notes

### Chat App

- Need to verify whether the CMS_TOKEN environment variable exists; if not, it should be added.

### Account App

- Add the `isOnboardedUser` flag to the previously deployed SSO backend database (applies only to the system’s first user(value `true`)).

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
