### ERD for the project:

```mermaid
erDiagram
%% Lookup Tables
    languages {
        INT languageId PK
        STRING languageName
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    counties {
        INT countyId PK
        STRING countyName
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    cities {
        INT cityId PK
        STRING cityName
        INT countyId FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    schoolDistricts {
        INT districtId PK
        STRING districtName
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    requestStatuses {
        INT requestStatusId PK
        STRING requestStatusName
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    sessionStatuses {
        INT sessionStatusId PK
        STRING sessionStatusName
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    presentationCategories {
        INT categoryId PK
        STRING categoryName
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

%% Main Tables
    schools {
        INT sId PK
        STRING sName
        STRING sStreetAddress
        INT sDistrictId FK
        INT sCityId FK
        BOOLEAN sGSS
        BOOLEAN sTitle1
        INT sLanguageId FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    requests {
        INT rId PK
        INT rsId FK
        STRING rContactName
        STRING rContactEmail
        STRING rContactPhone
        ENUM phone_type(rContactPType)
        STRING rContactBestTimes
        INT rStatusId FK
        STRING rCommunication
        STRING rNotes
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    presentations {
        INT pId PK
        STRING pName
        INT pCategoryId FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    funding {
        INT fId PK
        STRING fName
        STRING fCode
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    users {
        INT userId PK
        STRING userName
        STRING userEmail
        STRING userPhone
        BOOLEAN isActive
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    trainingSessions {
        INT tsId PK
        INT rId FK
        INT pId FK
        INT fId FK
        INT userId FK
        STRING tsGrades
        TIMESTAMP tsScheduledDateTime
        TIMESTAMP tsPreferredDateTimeStart
        TIMESTAMP tsPreferredDateTimeEnd
        INT tsStudents
        INT tsClassrooms
        INT tsAdults
        INT tsStatusId FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

%% Relationships
    cities ||--o{ counties : has
    schools ||--o{ cities : located_in
    schools ||--o{ schoolDistricts : belongs_to
    schools ||--o{ languages : offers
    requests ||--o{ schools : pertains_to
    requests ||--o{ requestStatuses : has
    presentations ||--o{ presentationCategories : belongs_to
    trainingSessions ||--o{ requests : involves
    trainingSessions ||--o{ presentations : includes
    trainingSessions ||--o{ funding : funded_by
    trainingSessions ||--o{ users : conducted_by
    trainingSessions ||--o{ sessionStatuses : has
```
## Order of Insertion

1. **Lookup Tables** (no foreign key dependencies):
    - `languages`
    - `counties`
    - `schoolDistricts`
    - `phoneTypes`
    - `requestStatuses`
    - `sessionStatuses`
    - `presentationCategories`
    - `funding`
    - `users`

2. **Main Tables** (insert in order of foreign key dependencies):
    - `cities` (depends on `counties`)
    - `schools` (depends on `cities`, `schoolDistricts`, `languages`)
    - `requests` (depends on `schools`)
    - `presentations` (depends on `presentationCategories`)
    - `trainingSessions` (depends on `requests`, `presentations`, `funding`, `users`)

---

## Order of Deletion

When deleting records, start from the dependent tables and move up to the parent tables:

1. **Delete from Main Tables** (start with the most dependent):
    - `trainingSessions` (depends on `requests`, `presentations`, `funding`, `users`)
    - `requests` (depends on `schools`)
    - `schools` (depends on `cities`, `schoolDistricts`, `languages`)
    - `cities` (depends on `counties`)

2. **Delete from Lookup Tables** (no dependencies):
    - `languages`
    - `counties`
    - `schoolDistricts`
    - `phoneTypes`
    - `requestStatuses`
    - `sessionStatuses`
    - `presentationCategories`
    - `funding`
    - `users`



<hr> 

Todo:
- [ ] Make sure to reset the sequences for the tables that have auto-incrementing primary keys once the actual data is populated.
- [x] Have global styles for the add, edit, view so that the forms look consistent & code is less repetitive.
- [ ] Implement the sorting and filtering for the tables.
- [ ] Implement the search functionality for the tables.
- [ ] Implement the pagination for the tables.
- [ ] Implement multi checkbox selection.
- [ ] Implement the session and cookie management.
- [ ] Have a nice looking Dashboard.
- [ ] Get feedback from the users and make necessary changes.
- [x] Fix the active/inactive boolean checkboxes/dropdowns in user route.
- [ ] Make sure the cities are not duplicate.
- [ ] Make sure the school is checked against the school name, and ~~stret address~~--district-- city for duplicate entry.
- [ ] Add grades information field (string) in the requests as well.
- [ ] Make the grades information field type to be a string in the presentation table.
- [ ] Ask the Ecocycle if there would be a case when more than one users are assigned to a training sessions.
- [ ] For school add/edit form, have the user select the districts first and then populate the schools/counties based on those selected droop down.  
- [ ] Add registrar to every request.
- [ ] THe UI elements should be in the order specified in the Requirements
