## Log in or sign up

#### POST /api/v1/client/auth/code

```json
{
  "client_phone": "+12525858484"
}
```

**Response 200 OK**

```json
{
  "client_phone": "+12525858484"
}
```

**Response 400 Bad Request**

```json
{
  "client_phone": [
     "The phone number is registered to another person. Please contact us if you have any questions"
  ]
}
```

#### POST /api/v1/client/auth/code/confirm

```json
{
  "client_phone": "+12525858484",
  "code": "858484"
}
```

**Response 200 OK**

```json
{
  "client_phone": "+12525858484",
  "code": "858484"
}
```

**Response 400 Bad Request**

```json
{
  "client_phone": [
     "The phone number is registered to another person. Please contact us if you have any questions"
  ]
}
```

**Response 400 Bad Request**

```json
{
  "code": [
     "You entered a wrong verification code. Please try again."
  ]
}
```

## Stylists

#### GET /api/v1/client/stylists

**Response 200 OK**

```json
[
  {
    "id": 1,
    "first_name": "Freya",
    "last_name": "McBob",
    "profile_photo_url": "http://example.com/profile_photo.jpg",
    "salon_name": "Jane's Beauty",
    "salon_address": "Some address",
    "phone": "(650) 350-1234"
  },
  {
    "id": 2,
    "first_name": "Freya",
    "last_name": "McBob",
    "profile_photo_url": "http://example.com/profile_photo.jpg",
    "salon_name": "Jane's Beauty",
    "salon_address": "Some address",
    "phone": "(650) 350-1234"
  }
]
```

#### GET /api/v1/client/stylists/related

**Response 200 OK**

```json
{
    "id": 1,
    "first_name": "Freya",
    "last_name": "McBob",
    "profile_photo_url": "http://example.com/profile_photo.jpg",
    "salon_name": "Jane's Beauty",
    "salon_address": "Some address",
    "phone": "(650) 350-1234"
}
```

#### GET /api/v1/client/search-stylists?query=Freya

**Response 200 OK**

```json
[
  {
    "id": 2,
    "first_name": "Freya",
    "last_name": "McBob",
    "profile_photo_url": "http://example.com/profile_photo.jpg",
    "salon_name": "Jane's Beauty",
    "salon_address": "Some address",
    "phone": "(650) 350-1234"
  }
]
```

## Services

#### GET /api/v1/client/services

**Response 200 OK**

```json
[
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
```

#### GET /api/v1/client/search-services?query=Braids

**Response 200 OK**

```json
[
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
```

### Service pricing

#### POST /api/v1/client/services/pricing

```json
{
  "service_uuid": "f2f0d141-47a8-4393-9c8e-c79126502c41",
  "stylist_uuid": "f74b1c66-943c-4bc4-bf14-6fefa21ab5a5"
}
```

**Response 200 OK**

❗️Not returning non-working and fully booked days.

```json
{

  "service_uuid": "e15cc4e9-e7a9-4905-a94d-5d44f1b860e9",
  "stylist_uuid": "f74b1c66-943c-4bc4-bf14-6fefa21ab5a5",
  "prices": [
    {
      "date": "2018-06-18",
      "price": 5
    },
    {
      "date": "2018-06-20",
      "price": 5
    }
  ]
}
```

**Response 400 Bad Request**

```json
{
  "service_uuid": [
      "No such service"
  ]
}
```

**Response 400 Bad Request**

```json
{
  "stylist_uuid": [
      "No such Stylist"
  ]
}
```
