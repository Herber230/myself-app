:::lead
_The purpose of this article is to work as an introduction to [entifix-ts-backend](https://github.com/Herber230/entifix-ts-backend). This is the first one of a series that pretend to explain every characteristic, the reason of its development and the other entifix versions (This is for backend, but there is Entifix for frontend too)._
:::

::figure[TypeScript makes Entifix possible]{src="./image-1.png" alt="The TypeScript wordmark in white over a blue city skyline"}

## What the hell is Entifix?

Entifix is in short terms, the very first step in the road of building a new TypeScript framework. The main idea is that the developers should only worry about create entities and their behavior. All the logic for REST exposition and communication between microservices should be a standard or convention.

## Whats behind?

Entifix is built on top on node, written in TypeScript, and its core functions are from two of most common frameworks: [express](https://expressjs.com/) and [mongoose](https://mongoosejs.com/). There are a lot of features for RabbitMQ interaction, because for sure you will want to construct many entifix application and connect them.

## Warming up

It is necessary node, docker and docker-compose to following this tutorial. Here is the [repo](https://github.com/Herber230/entifix-cars-app) with the complete code.

We are going to build an entifix app from scratch to show the main functionality. Also we are going to use docker-compose to run two containers, one with our app and another one with mongo to create the connection.

## Npm init and Npm install

Perform the npm initialization and the basic values.

```sh
npm init
```

Then, lets install the entifix-ts-backend:

```sh
npm install --save entifix-ts-backend
```

And the dev dependencies:

```sh
npm install --save-dev typescript @types/node
```

Later, we are going to configure our typescript environment. We add a **tsconfig.json** file:

```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "removeComments": false,
    "outDir": "dist",
    "sourceMap": true
  },
  "exclude": ["node_modules"],
  "include": ["server/**/*.ts"]
}
```

As you can see, we are going to use a folder (server) for our app and another for the generated javascript code (dist). We need _experimentalDecorators_ and _emitDecoratorMetadata_ setted as true.

## Files structure

Let’s create this suggested structure:

```text
entifix-cars
│  package.json
│  package-lock.json
│  tsconfig.json
│
└─── server
│   │  app.ts
│   │  server.ts
│   │
│   └─── entities
│       │  Brand.ts
│       │  Car.ts
│       │  Characteristic.ts
```

## Bootstrap files

The files to start the application are _app.ts_ and _server.ts_

```ts
// app.ts
import { EntifixApplication, EntifixAppConfig } from 'entifix-ts-backend';

class App extends EntifixApplication {
  //#region Properties
  //#endregion

  //#region Methods
  //#endregion

  //#region Accessors

  protected get serviceConfiguration() {
    let config: EntifixAppConfig = {
      serviceName: 'entifix-cars',
      mongoService: {
        user: '<user>',
        url: 'mongodb:27017/entifix-cars-db',
        password: '<pass>',
      },
      protectRoutes: { enable: false },
      devMode: true,
    };

    return config;
  }

  //#endregion
}

export { App };
```

What we create, is the class to create the instance of our app, and this is a singleton. We import from entifix-ts-backend two things:

- **EntifixApplication**: Abstract class for entifix applications
- **EntifixAppConfig**: Interface to define a structure for configurations.

The accessor _serviceConfiguration_ define a serviceName, mongo configuration credentials, protectRoutes as false to disable token validations during income http requests and devMode as true.

Now we are going to proceed with server.ts

```ts
// server.ts
import http = require('http');
import { App } from './app';

var port = 3000;
var application = new App(port);
var server = http.createServer(application.expressApp);

server.listen(port, () => {
  console.log('Server listening on port:' + port);
});

export { server, application };
```

This file imports previous app.ts and then starts our app.

## Entity files

The entities are the main reason for entifix creation. The main idea is that developers just have to create them and define its properties and business logic. In other words, create entities in a declarative way.

Let’s create a simple entity:

```ts
// Brand.ts
import { EMEntity, EntityDocument, ExpositionType, DefinedAccessor, DefinedEntity } from 'entifix-ts-backend';

interface IBrand {
  name: string;
  country: string;
}

interface IBrandModel extends EntityDocument, IBrand {}

@DefinedEntity()
class Brand extends EMEntity implements IBrand {
  //#region Properties
  //#endregion

  //#region Methods
  //#endregion

  //#region Accessors

  @DefinedAccessor({
    exposition: ExpositionType.Normal,
    schema: { type: String },
  })
  get name(): string {
    return (this._document as IBrandModel).name;
  }
  set name(value: string) {
    (this._document as IBrandModel).name = value;
  }

  @DefinedAccessor({
    exposition: ExpositionType.Normal,
    schema: { type: String },
  })
  get country(): string {
    return (this._document as IBrandModel).country;
  }
  set country(value: string) {
    (this._document as IBrandModel).country = value;
  }

  //#endregion
}

export { IBrand, IBrandModel, Brand };
```

We are going to make a larger stop here. First, we need three elements to conform and entity: An interface for a common schema (IBrand), an interface for a mongoose model (IBrandModel) that extends from EntityDocument (Which extends MongooseModel), and finally the entity itself (Brand). Second, the _DefinedEntity_ create the core metadata.

As a third aspect, we could focus on the structure for the accessors:

```ts
@DefinedAccessor({
  exposition: ExpositionType.Normal,
  schema: { type: String },
})
get country(): string {
  return (this._document as IBrandModel).country;
}
set country(value: string) {
  (this._document as IBrandModel).country = value;
}
```

The accessor _country_ is just a kind of wrapper for the model property. You can see the parameters _exposition_ and _schema_ and infer that this parameters define the behavior for persistence to mongo and serialization to http request/response.

That was our first entity, now let’s create _Characteristic_ in a very similar way:

```ts
// Characteristic.ts
import { EMEntity, EntityDocument, ExpositionType, DefinedAccessor, DefinedEntity } from 'entifix-ts-backend';

interface ICharacteristic {
  charName: string;
  charValue: string;
}

interface ICharacteristicModel extends EntityDocument, ICharacteristic {}

@DefinedEntity()
class Characteristic extends EMEntity implements ICharacteristic {
  //#region Properties
  //#endregion

  //#region Methods
  //#endregion

  //#region Accessors

  @DefinedAccessor({
    exposition: ExpositionType.Normal,
    schema: { type: String },
  })
  get charName(): string {
    return (this._document as ICharacteristicModel).charName;
  }
  set charName(value: string) {
    (this._document as ICharacteristicModel).charName = value;
  }

  @DefinedAccessor({
    exposition: ExpositionType.Normal,
    schema: { type: String },
  })
  get charValue(): string {
    return (this._document as ICharacteristicModel).charValue;
  }
  set charValue(value: string) {
    (this._document as ICharacteristicModel).charValue = value;
  }

  //#endregion
}

export { ICharacteristic, ICharacteristicModel, Characteristic };
```

However, we are building entities, and entities have relations with other entities. Let’s take a look what entifix can do for that:

```ts
// Car.ts
import { EMEntity, EntityDocument, DefinedAccessor, ExpositionType, EMMemberActivator, MemberBindingType, DefinedEntity } from 'entifix-ts-backend';

import { ICharacteristic, Characteristic, ICharacteristicModel } from './Characteristic';
import { Brand } from './Brand';

interface ICar {
  idBrand?: string;
  lineName: string;
  year: number;
  color: string;
  characteristics: Array<ICharacteristic>;
}

interface ICarModel extends EntityDocument, ICar {}

@DefinedEntity()
class Car extends EMEntity implements ICar {
  //#region Properties

  private _characteristics: Array<Characteristic>;
  private _brand: Brand;

  //#endregion

  //#region Methods
  //#endregion

  //#region Accessors

  @DefinedAccessor({
    exposition: ExpositionType.Normal,
    schema: { type: String },
  })
  get lineName(): string {
    return (this._document as ICarModel).lineName;
  }
  set lineName(value: string) {
    (this._document as ICarModel).lineName = value;
  }

  @DefinedAccessor({
    exposition: ExpositionType.Normal,
    schema: { type: Number },
  })
  get year(): number {
    return (this._document as ICarModel).year;
  }
  set year(value: number) {
    (this._document as ICarModel).year = value;
  }

  @DefinedAccessor({
    exposition: ExpositionType.Normal,
    schema: { type: String },
  })
  get color(): string {
    return (this._document as ICarModel).color;
  }
  set color(value: string) {
    (this._document as ICarModel).color = value;
  }

  @DefinedAccessor({
    exposition: ExpositionType.Normal,
    schema: { type: String },
    alias: 'idBrand',
    activator: new EMMemberActivator(Brand.getInfo(), MemberBindingType.Reference, true),
  })
  get brand(): Brand {
    return this._brand;
  }
  set brand(value: Brand) {
    (this._document as ICarModel).idBrand = value && value._id ? value._id.toString() : null;
    this._brand = value;
  }

  @DefinedAccessor({
    exposition: ExpositionType.Normal,
    schema: { type: String },
    activator: new EMMemberActivator(Characteristic.getInfo(), MemberBindingType.Snapshot, true),
  })
  get characteristics(): Array<Characteristic> {
    return this._characteristics;
  }
  set characteristics(value: Array<Characteristic>) {
    (this._document as ICarModel).characteristics = value ? value.map(v => v.getDocument() as ICharacteristicModel) : null;
    this._characteristics = value;
  }

  //#endregion
}

export { ICar, ICarModel, Car };
```

There are two important things here. The properties brand and characteristic are another entities, but regarding the model, the mongo document only saves the idBrand but complete characteristic Array (ICar interface). This is possible thanks the way of we use the parameter _activator_ for the _DefinedAccessor_ respectively. Brand is a reference entity and characteristic is a snapshot entity.

After create entities, we need to register and expose them. Let’s modify the app.ts file:

```ts
// app.ts
// ...
import { Brand, IBrandModel } from './entities/Brand';
import { Characteristic, ICharacteristicModel } from './entities/Characteristic';
import { Car, ICarModel } from './entities/Car';

class App extends EntifixApplication {
  // ...

  //#region Methods

  protected registerEntities(): void {
    this.serviceSession.registerEntity<IBrandModel, Brand>(Brand, Brand.getInfo());
    this.serviceSession.registerEntity<ICharacteristicModel, Characteristic>(Characteristic, Characteristic.getInfo());
    this.serviceSession.registerEntity<ICarModel, Car>(Car, Car.getInfo());
  }

  protected exposeEntities(): void {
    this.routerManager.exposeEntity('Brand');
    this.routerManager.exposeEntity('Characteristic');
    this.routerManager.exposeEntity('Car');
  }

  //#endregion

  // ...
}
```

## Scripts

We need to add some commands to start our application.

```jsonc
// package.json
{
  "name": "entifix-cars",
  // ...
  "scripts": {
    "compile": "tsc",
    "start": "npm run compile && node dist/server.js",
  },
  // ...
}
```

With this configuration we can use the commands to transpile the typescript code and start the app.

## Mongo with compose

At this point, it is only necessary to set credentials and a valid mongo uri. If you already have mongo installed, you can proceed with a npm start!. However, if you want to test the example with containers, we can add a setup with docker-compose to use containers for entifix-cars-app and mongo.

Let’s create this folder structure outside our current folder:

```text
entifix-cars-stack
│  docker-compose.yml
│
└─── entifix-cars
│     ... <Already existing files>
│
└─── mongo
│   │
│   └─── datadb
│   │
│   └─── entrypoint
│       │  entrypoint.js
```

This structure is going to start our app and configure a mongo instance with the database and user already created.

This is the compose:

```yaml
# docker-compose.yml
version: '3'

services:
  entifix-cars:
    image: 'node:10.4'
    working_dir: /src
    command: bash -c "npm install && npm start"
    volumes:
      - ./entifix-cars:/src
    ports:
      - 3000:3000
    links:
      - mongodb
    depends_on:
      - mongodb

  mongodb:
    image: 'mongo:3.6'
    ports:
      - 27017:27017
    volumes:
      - ./mongo/entrypoint:/docker-entrypoint-initdb.d/
      - ./mongo/datadb:/data/db
    command: mongod --noauth
```

This compose use containers (Don’t build them) and mount volumes for source code and configuration.

The most important config here is the entrypoint for mongo container, because this allows us to create the database and user for entifix-cars-app

This is the entrypoint:

```js
// entrypoint.js
db = db.getSiblingDB('entifix-cars-db');

db.createUser({
  user: 'entifixUser',
  pwd: 'entifix123',
  roles: [{ role: 'readWrite', db: 'entifix-cars-db' }],
});
```

## Wrapping up

Now, with a simple command you start your application:

```sh
docker-compose up
```

You have a crud for each entity with this pattern:

```http
GET localhost:3000/api/brand

GET localhost:3000/api/brand/:id

POST localhost:3000/api/brand
{
  "name": "BMW",
  "country": "Germany"
}

PUT localhost:3000/api/brand
{
  "id": "11234adfa32413434",
  "name": "BMW",
  "country": "Germany"
}

DELETE localhost:3000/api/brand/:id
```

You already have a filtering engine working:

```http
# All cars with year greater than 2010 and color contains 'blue'
GET localhost:3000/api/car?fixed_filer=year|gt|2010&fixed_filer=color|lk|blue

# All BMW Cars
GET localhost:3000/api/car?fixed_filer=brand.name|eq|BMW
```

You also can navigate into properties (With its own crud included):

```http
# List all characteristics of a car
GET localhost:3000/api/car/:idCar/characteristics

# Add a characteristic
POST localhost:3000/api/car/:idCar/characteristics
{
  "charName": "CC",
  "charValue": 5000
}

# Get the Brand
GET localhost:3000/api/car/:idCar/brand
```

All of that just declaring entities.

PS: I will be adding more examples for Entifix and its features, you could be interested in its strong RabbitMQ and Websocket functionality… And also complete documentation.

:::aside
First published on [Medium](https://herbercolop.medium.com/the-first-entifix-application-4bda3776950f) on 1 August 2020.
:::
