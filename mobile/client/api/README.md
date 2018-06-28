POST: request-code

#### body
```json
{
  "client_phone": "+12525858484"
}
```
========================================================================================================================

POST: verify-code

#### body
```json
{
  "client_phone": "+12525858484",
  "code": "858484" // do we need different endpoint here?
}
```
========================================================================================================================

GET: related_stylist

#### response
```json
{
    "id": 1,
    "first_name": "Freya",
    "last_name": "McBob",
    "profile_photo_url": "http://example.com/profile_photo.jpg",
    "salon_name": "Jane's Beauty"
}
```
========================================================================================================================

GET: stylists

#### response
```json
[
  {
    "id": 1,
    "first_name": "Freya",
    "last_name": "McBob",
    "profile_photo_url": "http://example.com/profile_photo.jpg",
    "salon_name": "Jane's Beauty",
    "salon_address": "Some address"
  },
  {
    "id": 2,
    "first_name": "Freya",
    "last_name": "McBob",
    "profile_photo_url": "http://example.com/profile_photo.jpg",
    "salon_name": "Jane's Beauty",
    "salon_address": "Some address"
  }
]
```
========================================================================================================================

GET: search-stylists?query="Freya"

#### response
```json
[
  {
    "id": 2,
    "first_name": "Freya",
    "last_name": "McBob",
    "profile_photo_url": "http://example.com/profile_photo.jpg",
    "salon_name": "Jane's Beauty",
    "salon_address": "Some address"
  }
]
```
========================================================================================================================

GET: category

#### response
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
========================================================================================================================

GET: search-services?query="Braids"

#### response
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
========================================================================================================================

POST: pricing

#### body
```json
{
  "service_uuid": "f2f0d141-47a8-4393-9c8e-c79126502c41"
}
```

#### response
```json
{

  "service_uuid": "e15cc4e9-e7a9-4905-a94d-5d44f1b860e9",
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
    }
  ]
}
```
