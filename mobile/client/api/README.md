## Log in or sign up

#### `POST` /api/v1/client/auth/code

```json
{
  "phone": "+12525858484"
}
```

**Response 200 OK**

```json
{
  "phone": "+12525858484"
}
```

**Response 400 Bad Request**

[field_errors](https://github.com/madebeauty/monorepo/issues/35#issuecomment-389011477):
- invalid phone (check with google libphonenumber)
- someone elses phone

```json
{
  "code": "form_is_invalid",
  "field_errors": {
    "phone": [{
      "code": "invalid_phone",
      "details": {
        "description": "The phone number is not valid"
      }
    }, {
      "code": "someone_elses_phone",
      "details": {
        "description": "The phone number is registered to another person"
      }
    }]
  }
}
```

[ServerError](https://github.com/madebeauty/monorepo/issues/35#issuecomment-389011477):
- request timeout error on re-requesting new code within e.g. less than 2min

```json
{
  "code": "re_request_timeout",
  "non_field_errors": [{
    "code": "re_request_timeout",
    "details": {
      "description": "Request timeout error. You should wait for 2min before re-requesting a code."
    }
  }]
}
```

#### `POST` /api/v1/client/auth/code/confirm

```json
{
  "phone": "+12525858484",
  "code": "858484"
}
```

**Response 200 OK**

❗Empty `stylist_invite` object if a client is not invited by a stylist.

```json
{
  "phone": "+12525858484",
  "code": "858484",
  "stylist_invite": {
    "uuid": "15610c0a-a819-4731-b503-1e5e3f4fdbee",
    "first_name": "Freya",
    "last_name": "McBob",
    "profile_photo_url": "http://example.com/profile_photo.jpg",
    "salon_name": "Jane's Beauty",
    "salon_address": "Some address",
    "phone": "(650) 350-1234"
  }
}
```

**Response 400 Bad Request**

The same from previous `POST` /api/v1/client/auth/code:
- invalid phone (check with google libphonenumber)
- someone elses phone

And add one more [field_error](https://github.com/madebeauty/monorepo/issues/35#issuecomment-389011477):
- wrong verification code

```json
{
  "code": "form_is_invalid",
  "field_errors": {
    "code": [{
      "code": "invalid_code",
      "details": {
        "description": "Wrong verification code is enetered"
      }
    }]
  }
}
```

## Stylists

#### `GET` /api/v1/client/stylists

**Response 200 OK**

```json
{
  "stylists": [
    {
      "uuid": "15610c0a-a819-4731-b503-1e5e3f4fdbee",
      "first_name": "Freya",
      "last_name": "McBob",
      "profile_photo_url": "http://example.com/profile_photo.jpg",
      "salon_name": "Jane's Beauty",
      "salon_address": "Some address",
      "phone": "(650) 350-1234"
    },
    {
      "uuid": "15610c0a-a819-4731-b503-1e5e3f4fdbee",
      "first_name": "Freya",
      "last_name": "McBob",
      "profile_photo_url": "http://example.com/profile_photo.jpg",
      "salon_name": "Jane's Beauty",
      "salon_address": "Some address",
      "phone": "(650) 350-1234"
    }
  ]
}
```

#### `GET` /api/v1/client/search-stylists?query=Freya

**Response 200 OK**

Empty array if not found.

```json
{
  "stylists": [{
    "uuid": "15610c0a-a819-4731-b503-1e5e3f4fdbee",
    "first_name": "Freya",
    "last_name": "McBob",
    "profile_photo_url": "http://example.com/profile_photo.jpg",
    "salon_name": "Jane's Beauty",
    "salon_address": "Some address",
    "phone": "(650) 350-1234"
  }]
}
```

## Services

#### `GET` /api/v1/client/services

**Response 200 OK**

Returns categories with services.

```json
{
  "categories": [
    {
      "name": "Braids and Locs",
      "uuid": "15610c0a-a819-4731-b503-1e5e3f4fdbee",
      "services": [
        {
          "uuid": "f2f0d141-47a8-4393-9c8e-c79126502c41",
          "name": "Color",
          "min_price": 56,
          "max_price": 88
        }
      ]
    }
  ]
}
```

#### `GET` /api/v1/client/search-services?query=Braids

<details><summary>❗This API was indicated as not needed.</summary>

**Response 200 OK**

Returns categories with services.

```json
{
  "categories": [
    {
      "name": "Braids and Locs",
      "uuid": "15610c0a-a819-4731-b503-1e5e3f4fdbee",
      "services": [
        {
          "uuid": "f2f0d141-47a8-4393-9c8e-c79126502c41",
          "name": "Color",
          "min_price": 56,
          "max_price": 88
        }
      ]
    }
  ]
}
```
</details>

### Service pricing

#### `POST` /api/v1/client/services/pricing

```json
{
  "service_uuid": "f2f0d141-47a8-4393-9c8e-c79126502c41",
  "stylist_uuid": "f74b1c66-943c-4bc4-bf14-6fefa21ab5a5"
}
```

**Response 200 OK**

```json
{
  "service_uuid": "e15cc4e9-e7a9-4905-a94d-5d44f1b860e9",
  "stylist_uuid": "f74b1c66-943c-4bc4-bf14-6fefa21ab5a5",
  "prices": [
    {
      "date": "2018-06-18",
      "price": 5,
      "is_fully_booked": true,
      "is_working_day": true
    },
    {
      "date": "2018-06-20",
      "price": 5,
      "is_fully_booked": false,
      "is_working_day": false
    }
  ]
}
```

**Response 400 Bad Request**

[field_errors](https://github.com/madebeauty/monorepo/issues/35#issuecomment-389011477):
- no such service
- not stylist’s service
- no such stylist

```json
{
  "code": "form_is_invalid",
  "field_errors": {
    "service_uuid": [{
      "code": "not_existed",
      "details": {
        "description": "Service doesn’t exist"
      }
    }, {
      "code": "not_stylists_service",
      "details": {
        "description": "Not a service of provided stylist"
      }
    }],
    "stylist_uuid": [{
      "code": "not_existed",
      "details": {
        "description": "Stylist doesn’t exist"
      }
    }]
  }
}
```

### Time slots

#### `POST` /api/v1/client/services/time-slots

**Response 200 OK**

❗This endpoint could be combined with /pricing

Returning free time slots to choose:

```json
{

  "service_uuid": "e15cc4e9-e7a9-4905-a94d-5d44f1b860e9",
  "stylist_uuid": "f74b1c66-943c-4bc4-bf14-6fefa21ab5a5",
  "time_slots": [
    {
      "start": "2018-06-18T09:30:00-04:00",
      "end": "2018-06-18T11:30:00-04:00"
    },
    {
      "start": "2018-06-18T09:30:00-04:00",
      "end": "2018-06-18T11:30:00-04:00"
    }
  ]
}
```

**Response 400 Bad Request**

The same errors from `POST` /api/v1/client/services/pricing:
- no such service
- not stylist’s service
- no such stylist

### Appointments

#### `POST` /api/v1/client/appointments

Very close to stylists API.

❗No force flag.

```json
{
  "stylist_uuid": "f74b1c66-943c-4bc4-bf14-6fefa21ab5a5",
  "datetime_start_at": "2018-06-18T09:30:00-04:00",
  "services": [{
    "service_uuid": "e15cc4e9-e7a9-4905-a94d-5d44f1b860e9"
  }]
}
```

**Response 200 OK**

```json
{
  "uuid": "f74b1c66-943c-4bc4-a94d-5d44f1b860e9",
  "stylist_uuid": "f74b1c66-943c-4bc4-bf14-6fefa21ab5a5",
  "stylist_first_name": "Fred",
  "stylist_last_name": "McBob",
  "stylist_phone": "+12525858484",
  "datetime_start_at": "2018-06-18T09:30:00-04:00",
  "total_client_price_before_tax": 295,
  "total_tax": 26.18,
  "total_card_fee": 8.83,
  "grand_total": 315,
  "has_tax_included": false,
  "has_card_fee_included": false,
  "duration_minutes": 60,
  "status": "new",
  "services": [{
    "service_uuid": "e15cc4e9-e7a9-4905-a94d-5d44f1b860e9"
  }],
}
```

**Response 400 Bad Request**

The same errors from `POST` /api/v1/client/services/pricing:
- no such service
- not stylist’s service
- no such stylist

And add errors for `datetime_start_at`:

```json
{
  "code": "form_is_invalid",
  "field_errors": {
    "datetime_start_at": [{
      "code": "past_date",
      "details": {
        "description": "Cannot add appointment for a past date and time"
      }
    }, {
      "code": "outside_working_hours",
      "details": {
        "description": "Cannot add appointment outside working hours"
      }
    }, {
      "code": "intersecting",
      "details": {
        "description": "Cannot add appointment intersecting with another"
      }
    }]
  }
}
```

#### `POST`/`PATCH` /api/v1/client/appointments/:appointment_uuid

Very close to `Change appointment status` from Stylist API.

## Should be needed also

- `GET` clients profile
- `GET` appointments list and one appointment
