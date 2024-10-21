### ERD for the project:

```mermaid
erDiagram
    languages {
        SERIAL languageId PK
        VARCHAR(20) languageName
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    counties {
        SERIAL countyId PK
        VARCHAR(50) countyName
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    cities {
        SERIAL cityId PK
        VARCHAR(50) cityName
        INT countyId FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    schoolDistricts {
        SERIAL districtId PK
        VARCHAR(50) districtName
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    phoneTypes {
        SERIAL phoneTypeId PK
        VARCHAR(10) phoneTypeName
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    requestStatuses {
        SERIAL requestStatusId PK
        VARCHAR(20) requestStatusName
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    sessionStatuses {
        SERIAL sessionStatusId PK
        VARCHAR(20) sessionStatusName
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    presentationCategories {
        SERIAL categoryId PK
        VARCHAR(20) categoryName
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    schools {
        SERIAL sId PK
        VARCHAR(50) sName
        VARCHAR(50) sStreetAddress
        INT sDistrictId FK
        INT sCityId FK
        BOOLEAN sGSS
        BOOLEAN sTitle1
        INT sLanguageId FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    requests {
        SERIAL rId PK
        INT rsId FK
        VARCHAR(35) rContactName
        VARCHAR(30) rContactEmail
        VARCHAR(10) rContactPhone
        phone_type rContactPType
        VARCHAR(50) rContactBestTimes
        INT rStatusId FK
        VARCHAR(25) rCommunication
        VARCHAR(255) rNotes
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    presentations {
        SERIAL pId PK
        VARCHAR(50) pName
        INT pCategoryId FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    funding {
        SERIAL fId PK
        VARCHAR(35) fName
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    trainingSessions {
        SERIAL tsId PK
        INT rId FK
        INT pId FK
        INT fId FK
        VARCHAR(25) tsGrades
        TIMESTAMP tsScheduledDateTime
        TIMESTAMP tsPreferredDateTimeStart
        TIMESTAMP tsPreferredDateTimeEnd
        INT tsStudents
        INT tsClassrooms
        INT tsAdults
        VARCHAR(50) tsEducators
        INT tsStatusId FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

%% Relationships
    counties ||--o{ cities : has
    cities ||--o{ schools : has
    schoolDistricts ||--o{ schools : has
    languages ||--o{ schools : supports
    schools ||--o{ requests : receives
    presentations ||--o{ trainingSessions : involves
    funding ||--o{ trainingSessions : provides
    requestStatuses ||--o{ requests : defines
    sessionStatuses ||--o{ trainingSessions : defines
    presentationCategories ||--o{ presentations : categorizes

```

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
