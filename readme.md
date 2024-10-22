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

    phoneTypes {
        INT phoneTypeId PK
        STRING phoneTypeName
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
        STRING rContactPType
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

## Wireframe for the project (First Draft & MVP - Subject to Change):

### Dashboard Section:
![Mockup Image](./mockups/dashboard.png)

### Request Management Section:
![Mockup Image](./mockups/requestpage.png)

### School Management Section:
![Mockup Image](./mockups/schoolsection.png)

### User Management Section:
![Mockup Image](./mockups/usersection.png)

### Calendar Section:
![Mockup Image](./mockups/calendar.png)


