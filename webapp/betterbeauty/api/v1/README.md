# BetterBeauty API v.1

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
            "image_url": "http://example.com/image_set_1.png",
            "services": [
                {
                    "name": "Custom wigs"
                },
                {
                    "name": "Full sew-in with lace/closure"
                },
                {
                    "name": "Full sew-in"
                }
            ]
        },
        {
            "uuid": "44f049c3-1a3a-46c7-ade1-1c1cf1bd6c7e",
            "name": "set 2",
            "description": "",
            "image_url": "http://example.com/image_set_2.png",
            "services": [
                {
                    "name": "Balayage"
                },
                {
                    "name": "Full highlights"
                }
            ]
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
                        "id": 31,
                        "name": "Bridal/special events",
                        "description": "",
                        "base_price": 500,
                        "duration_minutes": 240
                    },
                    {
                        "id": 32,
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
                        "id": 17,
                        "name": "Color correction",
                        "description": "",
                        "base_price": 200,
                        "duration_minutes": 120
                    },
                    {
                        "id": 18,
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
    "services": [
        {
            "id": 1,
            "name": "Service 1",
            "description": "Great service",
            "duration_minutes": 25,
            "base_price": 25.0,
            "is_enabled": true,
            "photo_samples": []
        },
        {
            "id": 2,
            "name": "Service 2",
            "description": "Even better service",
            "duration_minutes": 35,
            "base_price": 35.0,
            "is_enabled": false,
            "photo_samples": [
                {
                    "url": "http://example.com/photo_1.jpg"
                },
                {
                    "url": "http://example.com/photo_1.jpg"
                }
            ]
        },
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
  -d '[
    {
        "name": "Nail polish",
        "description": "We're adding new service here",
        "base_price": 25.0,
        "duration_minutes": 25,
        "is_enabled": true,
        "category_uuid": "01899abd-89d9-4776-a74c-7e7d155b58af"
    },
    {
        "id": 25,
        "name": "Hair cut",
        "description": "Updating existing service here",
        "base_price": 35.0,
        "duration_minutes": 45,
        "is_enabled": false,
        "category_uuid": "01899abd-89d9-4776-a74c-7e7d155b58af"
    }
]'
```


**Response 200/201 OK** (200 if no new objects were created, 201 if new objects created)
```
{
    "services": [
        {
            "id": 26, // note: DB object was created, hence the id
            "name": "Nail polish",
            "description": "We're adding new service here",
            "base_price": 25.0,
            "duration_minutes": 25,
            "is_enabled": true,
            "photo_samples": [],
            "category_uuid": "01899abd-89d9-4776-a74c-7e7d155b58af",
            "category_name": "Special Occassions"
        },
        {
            "id": 25, // note: it was an existing object, so id is unchanged
            "name": "Hair cut",
            "description": "Updating existing service here",
            "base_price": 35.0,
            "duration_minutes": 45,
            "is_enabled": false,
            "photo_samples": [],
            "category_uuid": "01899abd-89d9-4776-a74c-7e7d155b58af",
            "category_name": "Special Occassions"
        }
    ]
}
```

### Permanently delete a service
Note: this will actually delete it from list, rather than just disable.
Actual `salon.StylistService` object will be kept in the DB, but `deleted_at` field will be non-null

**DELETE /api/v1/stylist/services/{service_id}**
(ex. if we have `26` for service id, will delete the last one from previous example)


**Response 200 OK**
```
[
    {
        "id": 25,
        "name": "Hair cut",
        "description": "Updating existing service here",
        "base_price": 35.0,
        "duration_minutes": 45,
        "is_enabled": false,
        "photo_samples": [],
        "category_uuid": "01899abd-89d9-4776-a74c-7e7d155b58af",
        "category_name": "Special Occassions"
    }
]
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
        "regular_price": 90,
        "client_price": 90,
        "service_name": "Haircut",
        "service_uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840",
        "datetime_start_at": "2018-05-15T18:00:00-04:00",
        "duration_minutes": 30,
        "status": "new"
    },
    {
        "uuid": "59636867-a7ba-4736-ac89-51aefeddec4e",
        "client_first_name": "John",
        "client_last_name": "Connor",
        "regular_price": 90,
        "client_price": 90,
        "service_name": "Updos",
        "service_uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840",
        "datetime_start_at": "2018-05-16T18:00:00-04:00",
        "duration_minutes": 60,
        "status": "cancelled_by_stylist"
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
    "uuid": "8cdc4851-62a6-4f91-9ff1-dba9d346f0a1",
    "client_uuid": "5637ce6c-7efd-4a0f-a9e4-86d6324d3a5d",
    "client_first_name": "Fred",
    "client_last_name": "McBob",
    "client_phone": "123456789",
    "regular_price": 90,
    "client_price": 90,
    "service_name": "Updos",
    "service_uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840",
    "datetime_start_at": "2018-05-19T22:00:00-04:00",
    "duration_minutes": 60,
    "status": "new"
}
```


### Preview appointment

This API does not actually create any parameter, but allows
to preview resulting price and conflicting appointments (if any).

**POST /api/v1/appointments/preview**

- **service_uuid** (required) - uuid of a service to create appointment for
- **datetime_start_at** (required) - datetime when appointment is to start
- **client_uuid** (optional) - if supplied, client price may be different
from the base price

```
curl -X POST \
  http://apiserver/api/v1/stylist/appointments/preview \
  -H 'Authorization: Token jwt_token' \
  -F service_uuid=ca821ca4-3d34-454a-9aa7-daa291ce2840 \
  -F 'datetime_start_at=2018-05-28 16:00' \
  -F client_uuid=5637ce6c-7efd-4a0f-a9e4-86d6324d3a5d
```

**Response 200 OK**

```
{
    "regular_price": 90,
    "client_price": 90,
    "duration_minutes": 60,
    "conflicts_with": [
        {
            "uuid": "78d7ed13-d54e-4226-9bbc-85ff80251070",
            "client_first_name": "Fred",
            "client_last_name": "McBob",
            "service_name": "Haircut",
            "datetime_start_at": "2018-05-28T16:15:00-04:00",
            "datetime_end_at": "2018-05-28T16:35:00-04:00",
            "duration_minutes": 20
        }
    ]
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
        "service_uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840",
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
        "service_uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840",
        "datetime_start_at": "2018-05-20T14:00:00-04:00"
       }'
```


**Response 201 Created**
```
{
    "uuid": "a406c7cc-17c2-493a-90e0-9091f740be37",
    "client_first_name": "Fred",
    "client_last_name": "McBob",
    "regular_price": 90,
    "client_price": 90,
    "service_name": "Updos",
    "service_uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840",
    "datetime_start_at": "2018-05-20T18:00:00-04:00",
    "duration_minutes": 60,
    "status": "new"
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

### Change appointment status
**POST/PATCH /api/v1/appointments/{appointment_uuid}**

```
curl -X POST http://apiserver/api/v1/stylist/appointments/8cdc4851-62a6-4f91-9ff1-dba9d346f0a1 \
  -H 'Authorization: Token jwt_token' \
  -H 'Content-Type: application/json' \
  -d '{"status": "new"}'
```

Statuses available for stylists to set on appointments:

`new`, `no_show`, `cancelled_by_stylist`, `checked_out`.

Note: at later stages we may want to add more fields to the request, e.g.
to specify some extra information about checking out, etc.

**Response 200 OK**

```
{
    "status": "new"
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
            "regular_price": 90,
            "client_price": 90,
            "service_name": "Haircut",
            "service_uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840",
            "datetime_start_at": "2018-05-15T16:00:00-04:00",
            "duration_minutes": 30,
            "status": "new"
        },
        {
            "uuid": "59636867-a7ba-4736-ac89-51aefeddec4e",
            "client_first_name": "John",
            "client_last_name": "Connor",
            "client_phone": "",
            "regular_price": 90,
            "client_price": 90,
            "service_name": "Updos",
            "service_uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840",
            "datetime_start_at": "2018-05-15T18:00:00-04:00",
            "duration_minutes": 60,
            "status": "new"
        }
    ],
    "today_visits_count": 2,
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
            "id": 3,
            "name": "Updos",
            "description": "",
            "base_price": 90,
            "duration_minutes": 20,
            "is_enabled": true,
            "photo_samples": [],
            "category_uuid": "a8e74fbd-3385-492e-9fb4-44d632b5991a",
            "category_name": "Special Occassions",
            "service_uuid": "ca821ca4-3d34-454a-9aa7-daa291ce2840"
        }
    ],
    "worktime": [
        {
            "weekday_iso": 1,
            "work_start_at": "08:00:00",
            "work_end_at": "17:00:00",
            "is_available": true,
            "booked_time_minutes": 20
        },
        {
            "weekday_iso": 2,
            "work_start_at": "08:00:00",
            "work_end_at": "17:00:00",
            "is_available": true,
            "booked_time_minutes": 20
        },
        {
            "weekday_iso": 3,
            "work_start_at": "08:00:00",
            "work_end_at": "17:00:00",
            "is_available": true,
            "booked_time_minutes": 0
        },
        {
            "weekday_iso": 4,
            "work_start_at": "08:00:00",
            "work_end_at": "17:00:00",
            "is_available": true,
            "booked_time_minutes": 0
        },
        {
            "weekday_iso": 5,
            "work_start_at": "08:00:00",
            "work_end_at": "17:00:00",
            "is_available": true,
            "booked_time_minutes": 0
        },
        {
            "weekday_iso": 6,
            "work_start_at": null,
            "work_end_at": null,
            "is_available": false,
            "booked_time_minutes": 0
        },
        {
            "weekday_iso": 7,
            "work_start_at": null,
            "work_end_at": null,
            "is_available": false,
            "booked_time_minutes": 0
        }
    ],
    "total_week_booked_minutes": 40
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
