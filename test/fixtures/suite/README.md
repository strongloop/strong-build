## LoopBack Sample Application

### i-Car Rentals Corp

i-Car is an (imaginary) car rental dealer with locations in major cities around
the world. They need to replace their existing desktop reservation system with
a new mobile app.

### End user experience

The app enables customers to find the closest available cars using the i-Car app
on a smartphone. The app shows a map of nearby rental locations and lists
available cars in the area shown on the map. In addition, the customer can
filter the list of cars by make, model, class, year and color. The customer can
then select the desired car and reserve it via the app. If not logged in the app
prompts the customer to login or register. The app indicates if the desired car
is available and if so, confirms the reservation.

### Features

 - Authenticates and verifies customers' identities.
 - Securely exposes inventory data to mobile applications.
 - Allow customers to find cars available **within a specific area**.
 - Allow customers to reserve cars for rental.

### REST APIs

 - `/cars` exposes a queryable (filter, sort) collection of available cars
    over HTTP / JSON
 - `/cars/nearby?&lat=...&long=... or ?zip=...` returns a filtered set of
    available cars nearby the requesting user
 - `/cars/nearby?id=24&zip=94555` returns nearby cars of id 24.
 - `/cars/:id` returns a specific car from the inventory, with specific
    pricing and images
 - `/users/login` allows a customer to login
 - `/users/logout` allows a customer to logout

### Infrastructure

#### Customer Database

All customer information is available from the SalesForce API.

#### Inventory Database

All car inventory is already available in an **existing** Oracle X3-8 Exadata
database.

The Inventory DB schema looks like this:

##### **Customers**
 - id string
 - name string
 - username string
 - email string
 - password string
 - realm string
 - emailverified boolean
 - verificationtoken string
 - credentials string[]
 - challenges string[]
 - status string
 - created date
 - lastupdated date
 
##### **Reservations**
 - id string
 - product_id string
 - location_id string
 - customer_id string
 - qty number
 - status string
 - reserve_date date
 - pickup_date date
 - return_date date

##### **Inventory_Levels**
 - id string
 - product_id string
 - location_id string
 - available number
 - total number
 
##### **Car**
- id string
- vin string
- year number
- make string
- model string
- image string
- carClass string
- color string
 
##### **Location**
 - id string
 - street string
 - city string
 - zipcode string
 - name string
 - geo GeoPoint

##### **Inventory_View**

**View** to return qty of available products for the given city.

 - product (product name)
 - location (location name)
 - available (qty available)

#### Geo Lookup

Google's location API is used to return the users city from a given zip or lat/long.

### Configure and run the application

By default, the sample application uses the memory connector and listen on
http://0.0.0.0:3000.
 
> node app

Open browser and point it to http://127.0.0.1:3000.

You can configure other data sources by adding the following json into `.loopbackrc`
at the root of the module.

    {
        "demo": {
            "memory": {},
            "oracle": {
                "host": "your-oracle-server-ip-or-hostname",
                "port": 1521,
                "database": "XE",
                "username": "demo",
                "password": "password"
            },
            "mongodb": {
                "host": "your-mongodb-server-ip-or-hostname",
                "database": "demo",
                "username": "demo",
                "password": "password",
                "port": 27017
            }
        }
    }

The sample can be configured using the following environment variables:

- DB: The db type, use 'memory', 'mongodb' or 'oracle'
- IP: The http server listener ip address or hostname, default to 0.0.0.0 (any address)
- PORT: The http server listener port number, default to 3000

For example,

To run the application at port 3001 with MongoDB:

> DB=mongodb PORT=3001 node app

To run the application at port 3002 with Oracle:

> DB=oracle PORT=3002 node app

