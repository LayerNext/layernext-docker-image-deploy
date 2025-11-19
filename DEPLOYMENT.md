# Deployment Notes

# 3.21.5

- **Version**: `v3.21.5`
- **Beta release date → Dev deployment**: `2025-11-19`
- **Release date → Prod deployment**: `YYYY-MM-DD`

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
- [ ] Central server updated for production environment
- [ ] backward compatibility verified (.env and db changes)

## Change Log

### Central Server

- Added a new feature to check whether a DNS record already exists for a tenant name, and if it does, generate a new random tenant name by adding a numeric suffix. - Oshan
- Fixed an issue where sync failures were not being properly detected through the webhook. - Oshan

### Account App

-

### Datalake App

- Added automatic connection status updates to the data_sources table during the initial QB-Fivetran sync. - Oshan
- Included a new connectionStatus field in the getDataDictionarySectionList output - Oshan
- Initial sync success notification message to all users via email and push notification. - udakara

### Chat App

- Modified sorting order of task list.(Now sort in this order [IN_PROGRESS, TO_DO, COMPLETED]) and new created task will be on top . - Oshan
- notify all user after quick book connectivity fails via email and push notifications. - udakara
- Initial sync success notification message to all users via email and push notification. - udakara

## Backward Compatibility Notes

- Need to update the existing system’s AutomationTask collection by swapping the status values 10 and 20 (To-Do - In-Progress).Scripts is in 3.21.5 script directory in chat. - Oshan
- Need to run DB script to ensure existing users not get the quickbook data initial sync email and notification - udakara

## Additional Notes

-
