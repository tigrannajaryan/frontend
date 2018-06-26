# BetterBeauty API v.1

- [**Authorization**](#authorization)
  - [Getting auth token with email/password credentials](#getting-auth-token-with-emailpassword-credentials)
  - [Getting auth token with Facebook credentials](#getting-auth-token-with-facebook-credentials)
  - [Using auth token for authorization](#using-auth-token-for-authorization)
  - [Refreshing auth token](#refreshing-auth-token)
- [**Registration**](#registration)
  - [Register user with Facebook credentials](#register-user-with-facebook-credentials)
  - [Register user with email and password credentials](#register-user-with-email-and-password-credentials)
- [**Stylist/Salon API**](#stylistsalon-api)
    - [**Profile**](#profile)
      - [Retrieve profile information](#retrieve-profile-information)
      - [Create new profile](#create-new-profile)
      - [Update existing profile with all required fields](#create-new-profile)
      - [Partially update existing profile](#user-content-partially-update-existing-profile)
      - [Add profile image file](#user-content-add-profile-image-file)
    - [**Service templates and template sets**](#user-content-service-templates-and-template-sets)
      - [Get list of service template sets](#user-content-get-list-of-service-template-sets)
      - [Get full info for template set's services](#user-content-get-full-info-for-template-sets-services)
    - [**Stylist's services**](#user-content-stylists-services)
      - [Get list of services](#user-content-get-list-of-services)
      - [Bulk add/update services](#user-content-bulk-addupdate-services)
      - [Permanently delete a service](#user-content-permanently-delete-a-service)
      - [Service pricing](#service-pricing)
    - [**Availability**](#user-content-availability)
      - [Retrieve availability](#user-content-retrieve-availability)
      - [Set availability for one or multiple days](#user-content-set-availability-for-one-or-multiple-days)
    - [**Discounts**](#user-content-discounts)
      - [Retrieve discounts](#user-content-retrieve-discounts)
      - [Set discounts](#user-content-set-discounts)
    - [**Invitations**](#user-content-invitations)
      - [Send invitation(s) to the client(s)](#user-content-send-invitations-to-the-clients)
    - [**Appointments**](#user-content-appointments)
      - [List existing appointments](#user-content-list-existing-appointments)
      - [Retrieve single appointment](#user-content-retrieve-single-appointment)
      - [Preview appointment](#user-content-preview-appointment)
      - [Add appointment](#user-content-add-appointment)
      - [Out-of-system client](#user-content-out-of-system-client)
      - [In-the-system client](#user-content-in-the-system-client)
      - [Change appointment status](#user-content-change-appointment-status)
      - [Client search](#client-search)
    - **Screens**
      - [Today](#user-content-today-screen)
      - [Settings](#user-content-settings-screen)
    - **Uploads**
      - [Files](#user-content-files-upload)
      - [Images](#user-content-image-upload)

# Authorization
## Getting auth token with email/password credentials
In order to make requests to the API, client needs a JWT token. There are 2 ways to obtain
the token - authorize with existing user's credentials, or register new user.

**POST /api/v1/auth/get-token**:

`curl -X POST -d "email=email@example.com&password=clients_password" http://apiserver/api/v1/auth/get-token`

**Responce 200 OK**:

```
{
    "token": "jwt_token",
    "expires_in": 86400,
    "role": "stylist",
    "profile": {
        "id": 1,
        "first_name": "Jane",
        "last_name": "McBob",
        "phone": "(650) 350-1234",
        "profile_photo_url": null,
        "salon_name": "Jane salon",
        "salon_address": "1234 Front Street"
    },
    "profile_status": {
        "has_personal_data": true,
        "has_picture_set": false,
        "has_services_set": false,
        "has_business_hours_set": false,
        "has_weekday_discounts_set": false,
        "has_other_discounts_set": false,
        "has_invited_clients": false
    }
}
```

Note: if user doesn't have stylist profile - `profile` and `profile_status`
fields will be `null`

## Getting auth token with Facebook credentials

See [Register user with Facebook credentials](#register-user-with-facebook-credentials)

## Using auth token for authorization

Every subsequent request to the API should have `Authorization` header set with the following string:

`Token jwt_token`

Example call:

`curl -H "Authorization: Token jwt_token" http://apiserver/api/v1/stylist/profile`

## Refreshing auth token

If the token has not yet expired, it can be refreshed to a new one:

**POST /api/v1/auth/refresh-token**

`curl -X POST -H "Content-Type: application/json" -d '{"token": "old_but_not_expired_jwt_token"}' http://apiserver/api/v1/auth/refresh-token`

**Responce 200 OK**

```
{
    "token": "refreshed_jwt_token",
    "expires_in": 86400,
    "role": "stylist",
    "profile": null,
    "profile_status": null
}
```

Note: make sure to set proper content type (to `application/json`)

# Registration

Before creating client or stylist, new user must be registered. There will be multiple
ways of creation of user entity using social networks; section below is about registering
a user with email credentials. Social network methods are to be added.

## Register user with Facebook credentials
This endpoint creates a user based on Facebook auth token and returns JWT token back to client.
If user already exists - endpoint just refreshes the JWT token.

**POST /api/v1/auth/get-token-fb**

```
curl -X POST http://apiserver/api/v1/auth/get-token-fb \
  -F 'fbAccessToken=long_facebook_token' \
  -F 'fbUserID=numeric_facebook_user_id' \
  -F 'role=stylist'
```

**Response 200 OK**

```
{
    "token": "jwt_token",
    "expires_in": 86400,
    "role": "stylist",
    "profile": {
        "id": 17,
        "first_name": "Charlie",
        "last_name": "Martinazzison",
        "phone": "",
        "profile_photo_url": "http://profile_photo_url",
        "salon_name": null,
        "salon_address": null
    },
    "profile_status": {
        "has_personal_data": true,
        "has_picture_set": false,
        "has_services_set": false,
        "has_business_hours_set": false,
        "has_weekday_discounts_set": false,
        "has_other_discounts_set": false,
        "has_invited_clients": false
    }
}
```

## Register user with email and password credentials

This endpoint creates a user, authenticates and returns JWT token back to client.

The endpoint **does not** create a stylist or salon; you should use **profile** API
(see below) to actually fill in stylist's profile information once after user is created with this API.

**POST /api/v1/auth/register**

```
curl -X POST http://apiserver//api/v1/auth/register \
  -F 'email=stylist2@example.com \
  -F 'password=my_new_password' \
  -F 'role=stylist'
```

**Response 200 OK**

```
{
    "token": "jwt_token",
    "expires_in": 86400,
    "role": "stylist",
    "profile": null,
    "profile_status": null
}
```

**Error 400 Bad Request**
```
{
    "email": [
        "This email is already taken"
    ]
}
```


# Stylist/Salon API

## Profile

### Retrieve profile information
**GET /api/v1/stylist/profile**

`curl -H "Authorization: Token jwt_token" http://apiserver/api/v1/stylist/profile`

**Response 200 OK**

```
{
    "id": 1,
    "first_name": "Freya",
    "last_name": "McBob",
    "phone": "(650) 350-1234",
    "profile_photo_url": "http://example.com/profile_photo.jpg",
    "salon_name": "Jane's Beauty",
    "salon_address": "3945 El Camino Real"
}
```

### Create new profile
**POST/PUT /api/v1/stylist/profile**

```
curl -X POST \
  http://apiserver/api/v1/stylist/profile \
  -H 'Authorization: Token jwt_token' \
  -F first_name=Jane \
  -F last_name=McBob \
  -F 'phone=(650) 350-1234' \
  -F 'salon_name=Jane salon' \
  -F 'salon_address=1234 Front Street'
```

Note: all fields listed above are required.

**Response 201 OK**

```
{
    "id": 1,
    "first_name": "Jane",
    "last_name": "McBob",
    "phone": "(650) 350-1234",
    "profile_photo_url": null,
    "salon_name": "Jane salon",
    "salon_address": "1234 Front Street"
}
```

**Response 400 Bad Request**
```
{
     "phone":[
        "The phone number is registered to another stylist. Please contact us if you have any questions"
     ]
}
```

### Update existing profile with all required fields
**POST/PUT /api/v1/stylist/profile**

```
curl -X POST \
  http://apiserver/api/v1/stylist/profile \
  -H 'Authorization: Token jwt_token' \
  -F first_name=Jane \
  -F last_name=McBob \
  -F 'phone=(650) 350-1234' \
  -F 'salon_name=Jane salon' \
  -F 'salon_address=1234 Front Street'
```

Note: all fields listed above are required.

**Response 200 OK**

```
{
    "id": 1,
    "first_name": "Jane",
    "last_name": "McBob",
    "phone": "(650) 350-1234",
    "profile_photo_url": null,
    "salon_name": "Jane salon",
    "salon_address": "1234 Front Street"
}
```

**Response 400 Bad Request**
```
{
     "phone":[
        "The phone number is registered to another stylist. Please contact us if you have any questions"
     ]
}
```

### Partially update existing profile
**PATCH /api/v1/stylist/profile**

```
curl -X PATCH \
  http://apiserver/api/v1/stylist/profile \
  -H 'Authorization: Token jwt_token' \
  -F first_name=Jane \
  -F 'salon_address=1234 Front Street'
```

Note: you can patch individual fields with PATCH.

**Response 200 OK**

```
{
    "id": 1,
    "first_name": "Jane",
    "last_name": "McBob",
    "phone": "(650) 350-1234",
    "profile_photo_url": null,
    "salon_name": "Jane salon",
    "salon_address": "1234 Front Street"
}
```

### Add profile image file
In order to add an image file to stylist's profile, you should upload the file first
and obtain the upload's UUID. See section [Image upload](#image-upload) on how to upload
a file.

After UUID of an image is received, you can POST or PATCH this UUID to `profile_photo_id` field:

**PATCH /api/v1/stylist/profile**

```
curl -X PATCH \
  http://apiserver/api/v1/stylist/profile \
  -H 'Authorization: Token jwt_token' \
  -F 'profile_photo_id=83a7d4e8-0462-4f9d-bb04-c51c47047318'
```

**Response 200 OK**
```
{
    "id": 1,
    "first_name": "Jane",
    "last_name": "McBob",
    "phone": "(650) 350-1234",
    "profile_photo_url": "http://example.com/your_image.jpg",
    "salon_name": "Jane salon",
    "salon_address": "1234 Front Street"
}
```

or use during the POST:

**POST/PUT /api/v1/stylist/profile**

```
curl -X POST \
  http://apiserver/api/v1/stylist/profile \
  -H 'Authorization: Token jwt_token' \
  -F first_name=Jane \
  -F last_name=McBob \
  -F 'phone=(650) 350-1234' \
  -F 'salon_name=Jane salon' \
  -F 'salon_address=1234 Front Street' \
  -F 'profile_photo_id=83a7d4e8-0462-4f9d-bb04-c51c47047318'
```

Note: all fields listed above are required.

**Response 200 OK**

```
{
    "id": 1,
    "first_name": "Jane",
    "last_name": "McBob",
    "phone": "(650) 350-1234",
    "profile_photo_url": "http://example.com/your_image.jpg",
    "salon_name": "Jane salon",
    "salon_address": "1234 Front Street"
}
```


## Service templates and template sets

Service template object is a blueprint for stylist's service. Service template
is characterized by duration and base price. Stylists can create their own services
based on selected service templates, supplying their own price and duration.

Stylist can also add their own custom services, not based on existing templates.

Service templates are logically organized into template sets (so 'template set' - is
basically just a named list of templates).

### Get list of service template sets

This API call returns list of service template sets, and for each set
includes list of first 50 service templates with only basic information (name only).

**GET /api/v1/stylist/service-template-sets**
```
curl http://apiserver/api/v1/stylist/service-template-sets \
  -H 'Authorization: Token jwt_token'
```

**Response 200 OK**
```
{
    "service_templates": [
        {
            "uuid": "f2f0d141-47a8-4393-9c8e-c79126502c41",
            "name": "set 1",
            "description": "",
            "image_url": "http://example.com/image_set_1.png"
        },
        {
            "uuid": "44f049c3-1a3a-46c7-ade1-1c1cf1bd6c7e",
            "name": "set 2",
            "description": "",
            "image_url": "http://example.com/image_set_2.png"
        }
    ]
}
```

### Get full info for template set's services
**GET /api/v1/stylist/service-template-sets/{template_set_uuid}**

```
curl http://apiserver/api/v1/stylist/service-template-sets/{template_set_uuid} \
  -H 'Authorization: Token jwt_token'
```

**Response 200 OK**
```
 {
    "template_set": {
        "id": 1,
        "name": "set 1",
        "description": "",
        "image_url": "http://example.com/image_set_1.png",
        "categories": [
            {
                "name": "Special Occassions",
                "uuid": "01899abd-89d9-4776-a74c-7e7d155b58af",
                "services": [
                    {
                        "name": "Bridal/special events",
                        "description": "",
                        "base_price": 500,
                        "duration_minutes": 240
                    },
                    {
                        "name": "Ponytails",
                        "description": "",
                        "base_price": 65,
                        "duration_minutes": 60
                    }
                ]
            },
            {
                "name": "Color",
                "uuid": "25a87cf1-ec92-4723-8e97-c5dbe9de4f48",
                "services": [
                    {
                        "name": "Color correction",
                        "description": "",
                        "base_price": 200,
                        "duration_minutes": 120
                    },
                    {
                        "name": "Full highlights",
                        "description": "",
                        "base_price": 140,
                        "duration_minutes": 90
                    }
                ]
            }
        ]
    }
}
```


## Stylist's services

### Get list of services
**GET /aip/v1/stylist/services**

```
curl http://apiserver/api/v1/stylist/services \
  -H 'Authorization: Token jwt_token'
```


**Response 200 OK**
```
{
   "service_time_gap_minutes":40,
   "categories":[
      {
         "name":"Braids and Locs",
         "uuid":"15610c0a-a819-4731-b503-1e5e3f4fdbee",
         "services":[

         ]
      },
      {
         "name":"Color",
         "uuid":"3a9e6529-d380-4f73-8759-731e53e2058d",
         "services":[
            {
               "name":"Gloss",
               "description":"",
               "base_price":45.0,
               "duration_minutes":30,
               "is_enabled":true,
               "photo_samples":[

               ],
               "category_uuid":"3a9e6529-d380-4f73-8759-731e53e2058d",
               "category_name":"Color",
               "uuid":"62b802b0-8dbb-45f0-915a-78a97c044df7"
            }
         ]
      },
      {
         "name":"Conditioners",
         "uuid":"8dd74735-72a1-4590-bc0f-70464dcc8f61",
         "services":[
            {
               "name":"Conditioning treatment",
               "description":"",
               "base_price":30.0,
               "duration_minutes":20,
               "is_enabled":true,
               "photo_samples":[

               ],
               "category_uuid":"8dd74735-72a1-4590-bc0f-70464dcc8f61",
               "category_name":"Conditioners",
               "uuid":"6e3148fe-b6c9-46f8-b79b-7568f24a17b8"
            }
         ]
      },
      {
         "name":"Cuts",
         "uuid":"724d837f-ed4e-4f0c-9f4e-b2381785f52b",
         "services":[

         ]
      },
      {
         "name":"Extensions",
         "uuid":"73b9b7f8-9719-422b-9d76-92c67bc15995",
         "services":[

         ]
      },
      {
         "name":"Special Occassions",
         "uuid":"9adadbcb-4994-4ceb-baf6-48f1f286dfed",
         "services":[

         ]
      },
      {
         "name":"Treatments",
         "uuid":"9989737d-93de-47a0-aeb4-3616b696e48f",
         "services":[

         ]
      },
      {
         "name":"Wash and Style",
         "uuid":"b0605fd7-3afe-451e-89c7-994407674f7a",
         "services":[

         ]
      }
   ]
}
```


### Bulk add/update services

Note on semantics: this endpoint is **very NOT RESTFul**, because it allows to mix
updates to existing objects and creation of new objects in one batch. Semantically,
PUT cannot be used here, because indempotence is not guaranteed (nor even pretended
to be observed). Hence, this endpoint only supports **POST** method.

Endpoint accepts array (list) of objects to be replaced or added. If `id` field is
supplied - object will be updated with new values. If `id` field is missing or is `null`,
new object will be created.

**POST /api/v1/stylist/services**
**Content-Type=application/json**

```
curl -X POST http://apiserver/api/v1/stylist/services \
  -H 'Authorization: Token jwt_token' \
  -H 'Content-Type: application/json' \
  -d '{
   "services":[
      {
         "name":"Gloss",
         "description":"",
         "base_price":45,
         "duration_minutes":30,
         "is_enabled":true,
         "photo_samples":[

         ],
         "category_uuid":"3a9e6529-d380-4f73-8759-731e53e2058d",
         "category_name":"Color",
         "uuid":"62b802b0-8dbb-45f0-915a-78a97c044df7"
      },
      {
         "name":"Conditioning treatment",
         "description":"",
         "base_price":30,
         "duration_minutes":20,
         "is_enabled":true,
         "photo_samples":[

         ],
         "category_uuid":"8dd74735-72a1-4590-bc0f-70464dcc8f61",
         "category_name":"Conditioners",
         "uuid":"6e3148fe-b6c9-46f8-b79b-7568f24a17b8"
      }
   ],
   "service_time_gap_minutes":40
}'
```


**Response 200 OK**
```
{
   "service_time_gap_minutes":40,
   "categories":[
      {
         "name":"Braids and Locs",
         "uuid":"15610c0a-a819-4731-b503-1e5e3f4fdbee",
         "services":[

         ]
      },
      {
         "name":"Color",
         "uuid":"3a9e6529-d380-4f73-8759-731e53e2058d",
         "services":[
            {
               "name":"Gloss",
               "description":"",
               "base_price":45.0,
               "duration_minutes":30,
               "is_enabled":true,
               "photo_samples":[

               ],
               "category_uuid":"3a9e6529-d380-4f73-8759-731e53e2058d",
               "category_name":"Color",
               "uuid":"62b802b0-8dbb-45f0-915a-78a97c044df7"
            }
         ]
      },
      {
         "name":"Conditioners",
         "uuid":"8dd74735-72a1-4590-bc0f-70464dcc8f61",
         "services":[
            {
               "name":"Conditioning treatment",
               "description":"",
               "base_price":30.0,
               "duration_minutes":20,
               "is_enabled":true,
               "photo_samples":[

               ],
               "category_uuid":"8dd74735-72a1-4590-bc0f-70464dcc8f61",
               "category_name":"Conditioners",
               "uuid":"6e3148fe-b6c9-46f8-b79b-7568f24a17b8"
            }
         ]
      },
      {
         "name":"Cuts",
         "uuid":"724d837f-ed4e-4f0c-9f4e-b2381785f52b",
         "services":[

         ]
      },
      {
         "name":"Extensions",
         "uuid":"73b9b7f8-9719-422b-9d76-92c67bc15995",
         "services":[

         ]
      },
      {
         "name":"Special Occassions",
         "uuid":"9adadbcb-4994-4ceb-baf6-48f1f286dfed",
         "services":[

         ]
      },
      {
         "name":"Treatments",
         "uuid":"9989737d-93de-47a0-aeb4-3616b696e48f",
         "services":[

         ]
      },
      {
         "name":"Wash and Style",
         "uuid":"b0605fd7-3afe-451e-89c7-994407674f7a",
         "services":[

         ]
      }
   ]
}
```

### Permanently delete a service
Note: this will actually delete it from list, rather than just disable.
Actual `salon.StylistService` object will be kept in the DB, but `deleted_at` field will be non-null

**DELETE /api/v1/stylist/services/{uuid}**
(ex. if we have `b0605fd7-3afe-451e-89c7-994407674f7a` for service uuid, will
delete the last one from previous example)


**Response 204 No content**
```

```

## Availability
### Retrieve availability
**GET /api/v1/stylist/availability/weekdays**

**Response 200 OK**
```
{
    "weekdays": [
        {
            "weekday_iso": 1,
            "label": "Monday",
            "work_start_at": "15:00:00",
            "work_end_at": "18:00:00",
            "is_available": true
        },
        {
            "weekday_iso": 2,
            "label": "Tuesday",
            "work_start_at": null,
            "work_end_at": null,
            "is_available": false
        },
        {
            "weekday_iso": 3,
            "label": "Wednesday",
            "work_start_at": null,
            "work_end_at": null,
            "is_available": false
        },
        {
            "weekday_iso": 4,
            "label": "Thursday",
            "work_start_at": null,
            "work_end_at": null,
            "is_available": false
        },
        {
            "weekday_iso": 5,
            "label": "Friday",
            "work_start_at": null,
            "work_end_at": null,
            "is_available": false
        },
        {
            "weekday_iso": 6,
            "label": "Saturday",
            "work_start_at": null,
            "work_end_at": null,
            "is_available": false
        },
        {
            "weekday_iso": 7,
            "label": "Sunday",
            "work_start_at": null,
            "work_end_at": null,
            "is_available": false
        }
    ]
}
```

Note: time is passed in salon's local timezone

### Set availability for one or multiple days
**POST/PATCH /api/v1/stylist/availability/weekdays**

**Content-Type=application/json**

**Body**
```
[
    {
        "weekday_iso": 2,
        "is_available": true,
        "work_start_at": "08:30:00",
        "work_end_at": "15:00:00"
    },
    {
        "weekday_iso": 4,
        "is_available": false
    }
]
```

**Response 200 OK**
```
{
    "weekdays": [
        {
            "weekday_iso": 1,
            "label": "Monday",
            "work_start_at": null,
            "work_end_at": null,
            "is_available": false
        },
        {
            "weekday_iso": 2,
            "label": "Tuesday",
            "work_start_at": "08:30:00",
            "work_end_at": "15:00:00",
            "is_available": true
        },
        {
            "weekday_iso": 3,
            "label": "Wednesday",
            "work_start_at": null,
            "work_end_at": null,
            "is_available": false
        },
        {
            "weekday_iso": 4,
            "label": "Thursday",
            "work_start_at": "08:30:00",
            "work_end_at": "15:00:00",
            "is_available": true
        },
        {
            "weekday_iso": 5,
            "label": "Friday",
            "work_start_at": null,
            "work_end_at": null,
            "is_available": false
        },
        {
            "weekday_iso": 6,
            "label": "Saturday",
            "work_start_at": null,
            "work_end_at": null,
            "is_available": false
        },
        {
            "weekday_iso": 7,
            "label": "Sunday",
            "work_start_at": null,
            "work_end_at": null,
            "is_available": false
        }
    ]
}
```

## Discounts
### Retrieve discounts
**GET /api/v1/stylist/discounts**

```
curl -H 'Authorization: Token jwt_token' http://apiserver/api/v1/stylist/discounts
```

**Response 200 OK**
```
{
    "weekdays": [
        {
            "weekday": 1,
            "weekday_verbose": "Monday",
            "discount_percent": 0
        },
        {
            "weekday": 2,
            "weekday_verbose": "Tuesday",
            "discount_percent": 0
        },
        {
            "weekday": 3,
            "weekday_verbose": "Wednesday",
            "discount_percent": 0
        },
        {
            "weekday": 4,
            "weekday_verbose": "Thursday",
            "discount_percent": 0
        },
        {
            "weekday": 5,
            "weekday_verbose": "Friday",
            "discount_percent": 0
        },
        {
            "weekday": 6,
            "weekday_verbose": "Saturday",
            "discount_percent": 0
        },
        {
            "weekday": 7,
            "weekday_verbose": "Sunday",
            "discount_percent": 0
        }
    ],
    "first_booking": 0,
    "rebook_within_1_week": 0,
    "rebook_within_2_weeks": 0
}
```

### Set discounts
**POST /api/v1/stylist/discounts**

```
curl -X POST \
  http://apiserver/api/v1/stylist/discounts \
  -H 'Authorization: Token jwt_token' \
  -H 'Content-Type: application/json' \
  -d '{
    "weekdays": [
        {
            "weekday": 4,
            "discount_percent": 20
        },
        {
            "weekday": 1,
            "discount_percent": 20
        }
    ],
    "first_booking": 10,
    "rebook_within_1_week": 20,
    "rebook_within_2_weeks": 30
}'
```

**Response 200 OK**

```
{
    "weekdays": [
        {
            "weekday": 1,
            "weekday_verbose": "Monday",
            "discount_percent": 20
        },
        {
            "weekday": 2,
            "weekday_verbose": "Tuesday",
            "discount_percent": 0
        },
        {
            "weekday": 3,
            "weekday_verbose": "Wednesday",
            "discount_percent": 0
        },
        {
            "weekday": 4,
            "weekday_verbose": "Thursday",
            "discount_percent": 20
        },
        {
            "weekday": 5,
            "weekday_verbose": "Friday",
            "discount_percent": 0
        },
        {
            "weekday": 6,
            "weekday_verbose": "Saturday",
            "discount_percent": 0
        },
        {
            "weekday": 7,
            "weekday_verbose": "Sunday",
            "discount_percent": 0
        }
    ],
    "first_booking": 10,
    "rebook_within_1_week": 20,
    "rebook_within_2_weeks": 30
}

```


## Service pricing

Returns prices for given service for given client in the timeframe of the
next 14 days.

**POST /api/v1/services/pricing**

- **service_uuid** (required) - UUID of a service to get pricing for (must
be one of authorized stylist's services)
- **client_uuid** (optional) - UUID of a client. If supplied and not null -
will apply corresponding discounts the client is eligible for.

```
curl -X POST \
  http://apiserver/api/v1/stylist/services/pricing \
  -H 'Authorization: Token jwt_token' \
  -H 'Content-Type: application/json' \
  -d '{
        "service_uuid": "e15cc4e9-e7a9-4905-a94d-5d44f1b860e9",
        "client_uuid": "f74b1c66-943c-4bc4-bf14-6fefa21ab5a5"
}'
```

**Response 200 OK**
```
{
    "service_uuid": "e15cc4e9-e7a9-4905-a94d-5d44f1b860e9",
    "service_name": "",
    "prices": [
        {
            "date": "2018-06-18",
            "price": 5,
            "is_fully_booked": true,
            "is_working_day":true
        },
        {
            "date": "2018-06-20",
            "price": 5,
            "is_fully_booked": true,
            "is_working_day":false
        },
        {
            "date": "2018-06-21",
            "price": 5,
            "is_fully_booked": false,
            "is_working_day":true
        },
        {
            "date": "2018-06-22",
            "price": 5,
            "is_fully_booked": false,
            "is_working_day":true
        },
        {
            "date": "2018-06-25",
            "price": 6.25,
            "is_fully_booked": false,
            "is_working_day":true
        },
        {
            "date": "2018-06-27",
            "price": 5,
            "is_fully_booked": false,
            "is_working_day":true
        },
        {
            "date": "2018-06-28",
            "price": 5,
            "is_fully_booked": false,
            "is_working_day":true
        }
    ]
}
```


## Invitations

This is a POST-only API endpoint, which accepts list of phones.

### Send invitation(s) to the client(s)
**POST /api/v1/stylist/invitations**

```
curl -X POST \
  http://apiserver/api/v1/stylist/invitations \
  -H 'Authorization: Token jwt_token' \
  -H 'Content-Type: application/json' \
  -d '[
	{
		"phone": "12345"

	},
	{
		"phone": "45678"

	}
]'
```

**Response 201 Created**
```
[
	{
		"phone": "12345"

	},
	{
		"phone": "45678"

	}
]
```


## Appointments
### List existing appointments
**GET /api/v1/stylist/appointments**?date_from=yyyy-mm-dd&date_to=yyyy-mm-dd&&include_cancelled=true|false&&limit=N]*

Optional parameters:
- **date_from** (yyy-mm-dd) - inclusive. If not specified will output appointments since the beginning of era
- **date_to** (yyy-mm-dd) - inclusive. If not specified will output appointments till the end of era
- **include_cancelled** - False by default, if true, will also return cancelled appointments
- **limit** - limit the query, default is 100

```
curl -X GET -H 'Authorization: Token jwt_token' \
    http://apiserver//api/v1/stylist/appointments?include_cancelled=true
```

**Response 200 OK**
```
[
    {
        "uuid": "f9c736e1-2d0d-4daf-b30f-3225dd51a313",
        "client_first_name": "Fred",
        "client_last_name": "McBob",
        "total_client_price_before_tax": 90,
        "total_card_fee": 2.7,
        "total_tax": 7.98,
        "datetime_start_at": "2018-05-15T18:00:00-04:00",
        "duration_minutes": 30,
        "status": "new",
        "services": [
            {
                "uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840",
                "service_name": "Updos",
                "client_price": 90,
                "regular_price": 90,
                "is_original": true
            }
        ]
    },
    {
        "uuid": "59636867-a7ba-4736-ac89-51aefeddec4e",
        "client_first_name": "John",
        "client_last_name": "Connor",
        "total_client_price_before_tax": 90,
        "total_card_fee": 2.7,
        "total_tax": 7.98,
        "datetime_start_at": "2018-05-16T18:00:00-04:00",
        "duration_minutes": 60,
        "status": "cancelled_by_stylist",
        "services": [
            {
                "uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840",
                "service_name": "Updos",
                "client_price": 90,
                "regular_price": 90,
                "is_original": true
            }
        ]
    }
]
```

### Retrieve single appointment
**GET /api/v1/appointments/{appointment_uuid}**

```
curl -X GET \
  http://apiserver/api/v1/stylist/appointments/8cdc4851-62a6-4f91-9ff1-dba9d346f0a1 \
  -H 'Authorization: Token jwt_token'
```

**Response 200 OK**
```
{
    "uuid": "21ac69e7-70e9-4dbe-b550-f989c3a76e93",
    "client_first_name": Fred,
    "client_last_name": McBob,
    "datetime_start_at": "2018-05-31T23:00:00-04:00",
    "duration_minutes": 165,
    "status": "new",
    "total_tax": 26.18,
    "total_card_fee": 8.83,
    "total_client_price_before_tax": 295,
    "services": [
        {
            "uuid": "48a468a3-6dc3-4236-b91f-1c6a92b911b4",
            "service_name": "Balayage",
            "service_uuid": "f23748c1-9201-4408-8114-72caeac291da",
            "client_price": 250,
            "regular_price": 250,
            "is_original": true
        },
        {
            "uuid": "55f5af77-5604-4285-8ce9-4751cf490142",
            "service_name": "Blow out",
            "service_uuid": "c037f7be-2d29-4c52-94c1-c3e328ec202b",
            "client_price": 45,
            "regular_price": 45,
            "is_original": false
        }
    ]
}
```


### Preview appointment

This API does not actually create any parameter, but allows
to preview resulting price and conflicting appointments (if any).

**POST /api/v1/stylist/appointments/preview**

- **service_uuid** (required) - uuid of a service to create appointment for
- **client_price** (optional) - custom price for the service that stylist wants to 
have only for this appointment
- **datetime_start_at** (required) - datetime when appointment is to start
- **has_tax_included** (required) - whether or not grand total should contain tax
- **has_card_fee_included** (required) - should card fee be applied on top
- **client_uuid** (optional) - if supplied, client price may be different
- **appointment_uuid** (optional) - if preview needs to be enforced with data of an
existing appointment. If supplied, API will use data from the services that already
exist in this appointment.

from the base price

```
curl -X POST \
  http://apiserver/api/v1/stylist/appointments/preview \
  -H 'Authorization: Token jwt_token' \
  -H 'Content-Type: application/json' \
  -d '{
	"datetime_start_at": "2018-05-31 23:10",
	"services": [
            {
                "service_uuid": "f23748c1-9201-4408-8114-72caeac291da",
                "client_price": 25.00,
            },
            {"service_uuid": "c037f7be-2d29-4c52-94c1-c3e328ec202b"}
	],
	"has_tax_included": False,
	"has_card_fee_included": False,
	"appointment_uuid": "bc8b2137-ec92-4e28-8993-7bff6dd5fc56"
}'
```

**Response 200 OK**

```
{
    "duration_minutes": 165,
    "conflicts_with": [
        {
            "uuid": "21ac69e7-70e9-4dbe-b550-f989c3a76e93",
            "client_first_name": "Fred",
            "client_last_name": "McBob",
            "datetime_start_at": "2018-05-31T23:00:00-04:00",
            "datetime_end_at": "2018-06-01T01:45:00-04:00",
            "duration_minutes": 165,
            "services": [
                {
                    "uuid": "48a468a3-6dc3-4236-b91f-1c6a92b911b4",
                    "service_name": "Balayage",
                    "service_uuid": "f23748c1-9201-4408-8114-72caeac291da",
                    "client_price": 25,
                    "regular_price": 250,
                    "is_original": true
                },
                {
                    "uuid": "55f5af77-5604-4285-8ce9-4751cf490142",
                    "service_name": "Blow out",
                    "service_uuid": "c037f7be-2d29-4c52-94c1-c3e328ec202b",
                    "client_price": 45,
                    "regular_price": 45,
                    "is_original": false
                }
            ]
        }
    ],
    "total_client_price_before_tax": 295,
    "total_tax": 26.18,
    "total_card_fee": 8.83,
    "grand_total": 315,
    "has_tax_included": False,
    "has_card_fee_included": False,
    "services": [
        {
            "uuid": "48a468a3-6dc3-4236-b91f-1c6a92b911b4",
            "service_name": "Balayage",
            "service_uuid": "f23748c1-9201-4408-8114-72caeac291da",
            "client_price": 250,
            "regular_price": 250,
            "is_original": true
        },
        {
            "uuid": None,
            "service_name": "Blow out",
            "service_uuid": "c037f7be-2d29-4c52-94c1-c3e328ec202b",
            "client_price": 45,
            "regular_price": 45,
            "is_original": false
        }
}
```


### Add appointment

There can be 2 possible situations:

- client is in the system. In this case frontend should pass
client's uuid; it will be verified, and if it's valid - an appointment
will be created for this client. `client_first_name` and `client_last_name`
params, even if supplied, will be discarded and replaced with actual
client's name.

- client is not in the system yet, so uuid is unknown. In this case
frontend must omit the `client_uuid` param and instead supply
`client_first_name` and `client_last_name`

This API does not allow directly setting `status` field of an appointment;
for freshly created appointment status will be set to `new`.

To set status of an appointment, use the separate
[Change appointment status](#change-appointment-status) API.

**POST /api/v1/stylist/appointments[?force_start=true]**

- **force_start** param, if set to `true`, disables time range checks

#### Out-of-system client

```
curl -X POST \
  http://apiserver/api/v1/stylist/appointments \
  -H 'Authorization: Token jwt_tokent' \
  -H 'Content-Type: application/json' \
  -d '{
        "client_first_name": "John",
        "client_last_name": "Connor",
        "client_phone": "1234567"
        "services": [
            {
                "service_uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840",
            }
        ],
        "datetime_start_at": "2018-05-20T18:00:00-04:00"
       }'
```

#### In-the-system client

```
curl -X POST \
  http://betterbeauty.local:8000/api/v1/stylist/appointments \
  -H 'Authorization: Token jwt_token' \
  -H 'Content-Type: application/json' \
  -d '{

        "client_uuid": "5637ce6c-7efd-4a0f-a9e4-86d6324d3a5d",
        "services": [
            {
                "service_uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840",
            }
        ],
        "datetime_start_at": "2018-05-20T14:00:00-04:00"
       }'
```


**Response 201 Created**
```
{
    "uuid": "a406c7cc-17c2-493a-90e0-9091f740be37",
    "client_first_name": "Fred",
    "client_last_name": "McBob",
    "client_phone": "1234567",
    "client_uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840",
    "total_client_price_before_tax": 295,
    "total_tax": 26.18,
    "total_card_fee": 8.83,
    "grand_total": 315,
    "has_tax_included": False,
    "has_card_fee_included": False,
    "datetime_start_at": "2018-05-20T18:00:00-04:00",
    "duration_minutes": 60,
    "status": "new",
    "services": [
        {
            "uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840",
            "service_name": "Updos",
            "client_price": 90,
            "regular_price": 90,
            "is_original": true
        }
    ]
}
```

**Response 400 Bad Request**
```
{
    "datetime_start_at": [
        "Cannot add appointment for a past date and time"
    ]
}
```

**Response 400 Bad Request**
```
{
    "datetime_start_at": [
        "Cannot add appointment outside working hours"
    ]
}
```
**Response 400 Bad Request**
```
{
    "datetime_start_at": [
        "Cannot add appointment intersecting with another"
    ]
}
```
**Response 400 Bad Request**
```
{
    "service_uuid": [
        "No such service"
    ]
}
```
**Response 400 Bad Request**
```
{
    "client_uuid": [
        "No such client"
    ]
}
```
**Response 400 Bad Request**
```
{
     "client_phone":[
        "The phone number belongs to existing client"
     ]
}
```

### Change appointment status
**POST/PATCH /api/v1/appointments/{appointment_uuid}**

- **status** (required): status eligible for use by a stylist; must be
one of: `new`, `no_show`, `cancelled_by_stylist`,
- **services** (optional): only required if status is `checked_out` - final list of
services that are ultimately saved to the appointment. Services will be saved to the
appointment, preserving `is_original` flag and original price for services which were
added on appointment creation.
- **has_tax_included** (optional): only required if status is `checked_out` - whether
or not grand total should contain tax
- **has_card_fee_included** (optional): only required if status is `checked_out` - should
card fee be applied on top

```
curl -X POST http://apiserver/api/v1/stylist/appointments/8cdc4851-62a6-4f91-9ff1-dba9d346f0a1 \
  -H 'Authorization: Token jwt_token' \
  -H 'Content-Type: application/json' \
  -d '{"status": "cancelled_by_stylist"}'
```


```
curl -X POST \
  http://apiserver/api/v1/stylist/appointments/21ac69e7-70e9-4dbe-b550-f989c3a76e93 \
  -H 'Authorization: Token jwt_token' \
  -H 'Content-Type: application/json' \
  -d '{
	"status": "checked_out",
	"services": [
        {
          "service_uuid": "f23748c1-9201-4408-8114-72caeac291da"
        },
        {
          "service_uuid": "c037f7be-2d29-4c52-94c1-c3e328ec202b",
          "client_price": 10.00,
        }
    ],
    "has_tax_included": false,
    "has_card_fee_included" false
}'
```



**Response 200 OK**

```
{
    "uuid": "21ac69e7-70e9-4dbe-b550-f989c3a76e93",
    "client_first_name": "Jane",
    "client_last_name": "McBob",
    "datetime_start_at": "2018-05-31T23:00:00-04:00",
    "duration_minutes": 165,
    "status": "checked_out",
    "total_tax": 26.18,
    "total_card_fee": 8.83,
    "total_client_price_before_tax": 295,
    "grand_total": 315,
    "has_tax_included": False,
    "has_card_fee_included": False,
    "services": [
        {
            "uuid": "50701ff2-4774-4457-8078-5b956a16bd61",
            "service_name": "Blow out",
            "service_uuid": "c037f7be-2d29-4c52-94c1-c3e328ec202b",
            "client_price": 10,
            "regular_price": 45,
            "is_original": false
        },
        {
            "uuid": "1400418c-0690-49d9-b603-85132c7816e4",
            "service_name": "Balayage",
            "service_uuid": "f23748c1-9201-4408-8114-72caeac291da",
            "client_price": 250,
            "regular_price": 250,
            "is_original": true
        }
    ]
}
```

**Response 400 Bad Request**

```
{
    "status": [
        "Setting this status is not allowed"
    ]
}
```

## Today screen
**GET /api/v1/stylist/today**

`curl -H "Authorization: Token jwt_token" http://apiserver/api/v1/stylist/today`


**Response 200 OK**
```
{
    "today_appointments": [
        {
            "uuid": "f9c736e1-2d0d-4daf-b30f-3225dd51a313",
            "client_first_name": "Fred",
            "client_last_name": "McBob",
            "client_phone": "",
            "datetime_start_at": "2018-05-31T23:00:00-04:00",
            "duration_minutes": 165,
            "status": "new",
            "total_tax": 26.18,
            "total_card_fee": 8.83,
            "total_client_price_before_tax": 295,
            "services": [
                {
                    "uuid": "48a468a3-6dc3-4236-b91f-1c6a92b911b4",
                    "service_name": "Balayage",
                    "service_uuid": "f23748c1-9201-4408-8114-72caeac291da",
                    "client_price": 250,
                    "regular_price": 250,
                    "is_original": true
                },
                {
                    "uuid": "55f5af77-5604-4285-8ce9-4751cf490142",
                    "service_name": "Blow out",
                    "service_uuid": "c037f7be-2d29-4c52-94c1-c3e328ec202b",
                    "client_price": 45,
                    "regular_price": 45,
                    "is_original": true
                }
            ]
        }
    ],
    "today_visits_count": 1,
    "week_visits_count": 7,
    "past_visits_count": 2
}
```

## Settings screen

This is a read-only API designed specifically to fetch information
in one gulp for the Stylist app's Settings screen.

**GET /api/v1/stylist/settings**

**Response 200 OK**

```
{
    "profile": {
        "id": 2,
        "first_name": "Jane",
        "last_name": "McBob",
        "phone": "95566889",
        "profile_photo_url": null,
        "salon_name": "Southern Wind",
        "salon_address": "1158 George Ave, Milbrae"
    },
    "services_count": 1,
    "services": [
        {
            "name": "Updos",
            "description": "",
            "base_price": 90,
            "duration_minutes": 20,
            "is_enabled": true,
            "photo_samples": [],
            "category_uuid": "a8e74fbd-3385-492e-9fb4-44d632b5991a",
            "category_name": "Special Occassions",
            "uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840"
        }
    ],
    "worktime": [
        {
            "weekday_iso": 1,
            "work_start_at": "08:00:00",
            "work_end_at": "17:00:00",
            "is_available": true,
            "booked_time_minutes": 20,
            "booked_appointments_count": 1
        },
        {
            "weekday_iso": 2,
            "work_start_at": "08:00:00",
            "work_end_at": "17:00:00",
            "is_available": true,
            "booked_time_minutes": 20,
            "booked_appointments_count": 1
        },
        {
            "weekday_iso": 3,
            "work_start_at": "08:00:00",
            "work_end_at": "17:00:00",
            "is_available": true,
            "booked_time_minutes": 0,
            "booked_appointments_count": 0
        },
        {
            "weekday_iso": 4,
            "work_start_at": "08:00:00",
            "work_end_at": "17:00:00",
            "is_available": true,
            "booked_time_minutes": 0,
            "booked_appointments_count": 0
        },
        {
            "weekday_iso": 5,
            "work_start_at": "08:00:00",
            "work_end_at": "17:00:00",
            "is_available": true,
            "booked_time_minutes": 0,
            "booked_appointments_count": 0
        },
        {
            "weekday_iso": 6,
            "work_start_at": null,
            "work_end_at": null,
            "is_available": false,
            "booked_time_minutes": 0,
            "booked_appointments_count": 0
        },
        {
            "weekday_iso": 7,
            "work_start_at": null,
            "work_end_at": null,
            "is_available": false,
            "booked_time_minutes": 0,
            "booked_appointments_count": 0
        }
    ],
    "total_week_booked_minutes": 40,
    "total_week_appointments_count: 2
}
```

## Client search

This endpoint accepts URLEncoded (if necessary) `query` param,
and will search this string in first, last names and phone of the clients
with whom authorized stylist has appointments (i.e. "their" clients).

Note: in the future we should extend this also to those clients who have
accepted invitations from the stylist (even though they may not yet had
any appointments scheduled)

**GET /api/v1/stylist/search-clients?query=query_string**

```
curl -X GET \
  'http://apiserver/api/v1/stylist/search-clients?query=Fred' \
  -H 'Authorization: Token jwt_token'
```

**Response 200OK**

```
{
    "clients": [
        {
            "uuid": "f74b1c66-943c-4bc4-bf14-6fefa21ab5a5",
            "first_name": "Fred",
            "last_name": "McBob",
            "phone": "112233"
        }
    ]
}
```



# Files upload
## Image upload

It may require to upload an image file for future use. Common use case is when
a client uploads an image multiple times (looking for better picture) before actually
assigning it to a parent object.

Uploading an image to this endpoint will return a UUID string which may further be used
to assign uploaded image to an entity (e.g. stylist profile, or a service).

The endpoint accepts only image files less than 5MB in size.

Note: image uploads will have limited lifetime, so after some time after uploading UUID
will no longer be valid.

**POST /api/v1/common/image/upload**

```
curl -X POST \
  http://apiserver/api/v1/common/image/upload \
  -H 'Authorization: Token jwt_token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'content-type: multipart/form-data' \
  -F file=@path_to_your_file
```

**Response 201 Created**
```
{
    "uuid": "83a7d4e8-0462-4f9d-bb04-c51c47047318"
}
```

**Response 400 Bad Request**
```
{
    "file": [
        "Upload a valid image. The file you uploaded was either not an image or a corrupted image."
    ]
}
```

**Response 400 Bad Request**
```
{
    "file": [
        "File is too big, max. size 5242880 bytes"
    ]
}
```
