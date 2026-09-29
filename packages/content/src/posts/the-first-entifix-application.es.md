:::lead
_El propósito de este artículo es servir de introducción a [entifix-ts-backend](https://github.com/Herber230/entifix-ts-backend). Es el primero de una serie que pretende explicar cada característica, la razón de su desarrollo y las demás versiones de entifix (esta es para backend, pero también hay Entifix para frontend)._
:::

::figure[TypeScript hace posible Entifix]{src="./image-1.png" alt="El logotipo de TypeScript en blanco sobre el perfil de una ciudad en azul"}

## ¿Qué diablos es Entifix?

Entifix es, en pocas palabras, el primer paso en el camino de construir un nuevo framework de TypeScript. La idea principal es que los desarrolladores solo deban preocuparse por crear entidades y su comportamiento. Toda la lógica para exponerlas por REST y para comunicar microservicios debería ser un estándar o una convención.

## ¿Qué hay detrás?

Entifix está construido sobre node, escrito en TypeScript, y sus funciones principales vienen de dos de los frameworks más comunes: [express](https://expressjs.com/es/) y [mongoose](https://mongoosejs.com/). Tiene muchas funcionalidades para interactuar con RabbitMQ, porque seguramente vas a querer construir muchas aplicaciones entifix y conectarlas.

## Calentando motores

Para seguir este tutorial se necesitan node, docker y docker-compose. Aquí está el [repositorio](https://github.com/Herber230/entifix-cars-app) con el código completo.

Vamos a construir una aplicación entifix desde cero para mostrar la funcionalidad principal. También vamos a usar docker-compose para correr dos contenedores, uno con nuestra aplicación y otro con mongo para crear la conexión.

## Npm init y npm install

Inicializamos npm con los valores básicos.

```sh
npm init
```

Luego, instalamos entifix-ts-backend:

```sh
npm install --save entifix-ts-backend
```

Y las dependencias de desarrollo:

```sh
npm install --save-dev typescript @types/node
```

Después configuramos nuestro entorno de TypeScript. Agregamos un archivo **tsconfig.json**:

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

Como puedes ver, vamos a usar una carpeta (server) para nuestra aplicación y otra para el código JavaScript generado (dist). Necesitamos _experimentalDecorators_ y _emitDecoratorMetadata_ en true.

## Estructura de archivos

Creemos esta estructura sugerida:

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

## Archivos de arranque

Los archivos para arrancar la aplicación son _app.ts_ y _server.ts_

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

Lo que creamos es la clase de la que sale la instancia de nuestra aplicación, y es un singleton. Importamos dos cosas de entifix-ts-backend:

- **EntifixApplication**: la clase abstracta de las aplicaciones entifix.
- **EntifixAppConfig**: la interfaz que define la estructura de la configuración.

El accessor _serviceConfiguration_ define un serviceName, las credenciales de mongo, protectRoutes en false para desactivar la validación de tokens en las peticiones HTTP entrantes, y devMode en true.

Ahora seguimos con server.ts

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

Este archivo importa el app.ts anterior y arranca nuestra aplicación.

## Archivos de entidades

Las entidades son la razón principal de que exista entifix. La idea es que los desarrolladores solo tengan que crearlas y definir sus propiedades y su lógica de negocio. En otras palabras, crear entidades de forma declarativa.

Creemos una entidad sencilla:

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

Aquí vamos a detenernos un poco más. Primero, una entidad necesita tres elementos: una interfaz para el esquema común (IBrand), una interfaz para el modelo de mongoose (IBrandModel) que extiende de EntityDocument (que a su vez extiende de MongooseModel) y, por último, la entidad misma (Brand). Segundo, _DefinedEntity_ crea los metadatos principales.

Como tercer aspecto, veamos la estructura de los accessors:

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

El accessor _country_ es solo una especie de envoltorio de la propiedad del modelo. Por los parámetros _exposition_ y _schema_ puedes deducir que definen el comportamiento de la persistencia en mongo y de la serialización en las peticiones y respuestas HTTP.

Esa fue nuestra primera entidad; ahora creemos _Characteristic_ de forma muy parecida:

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

Pero estamos construyendo entidades, y las entidades se relacionan con otras entidades. Veamos qué puede hacer entifix para eso:

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

Aquí hay dos cosas importantes. Las propiedades brand y characteristics son otras entidades, pero en el modelo el documento de mongo solo guarda idBrand, y en cambio guarda el arreglo completo de características (la interfaz ICar). Esto es posible por cómo usamos el parámetro _activator_ de cada _DefinedAccessor_: Brand es una entidad por referencia y Characteristic una entidad por snapshot.

Después de crear las entidades, tenemos que registrarlas y exponerlas. Modifiquemos app.ts:

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

Necesitamos agregar algunos comandos para arrancar la aplicación.

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

Con esta configuración podemos usar los comandos para transpilar el código TypeScript y arrancar la aplicación.

## Mongo con compose

A estas alturas solo hace falta configurar las credenciales y una URI de mongo válida. Si ya tienes mongo instalado, ¡puedes seguir con un npm start! Pero si quieres probar el ejemplo con contenedores, podemos agregar una configuración de docker-compose con contenedores para entifix-cars-app y para mongo.

Creemos esta estructura de carpetas fuera de nuestra carpeta actual:

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

Esta estructura va a arrancar nuestra aplicación y a configurar una instancia de mongo con la base de datos y el usuario ya creados.

Este es el compose:

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

Este compose usa contenedores (sin construirlos) y monta volúmenes para el código fuente y la configuración.

La configuración más importante aquí es el entrypoint del contenedor de mongo, porque nos permite crear la base de datos y el usuario de entifix-cars-app.

Este es el entrypoint:

```js
// entrypoint.js
db = db.getSiblingDB('entifix-cars-db');

db.createUser({
  user: 'entifixUser',
  pwd: 'entifix123',
  roles: [{ role: 'readWrite', db: 'entifix-cars-db' }],
});
```

## Para terminar

Ahora, con un solo comando arrancas tu aplicación:

```sh
docker-compose up
```

Tienes un CRUD para cada entidad con este patrón:

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

Ya tienes un motor de filtros funcionando:

```http
# Todos los carros de un año mayor a 2010 cuyo color contiene 'blue'
GET localhost:3000/api/car?fixed_filer=year|gt|2010&fixed_filer=color|lk|blue

# Todos los carros BMW
GET localhost:3000/api/car?fixed_filer=brand.name|eq|BMW
```

También puedes navegar dentro de las propiedades (cada una con su propio CRUD):

```http
# Todas las características de un carro
GET localhost:3000/api/car/:idCar/characteristics

# Agregar una característica
POST localhost:3000/api/car/:idCar/characteristics
{
  "charName": "CC",
  "charValue": 5000
}

# La marca
GET localhost:3000/api/car/:idCar/brand
```

Todo eso solo con declarar entidades.

P. D.: Iré agregando más ejemplos de Entifix y sus funcionalidades; quizá te interese su sólido soporte de RabbitMQ y WebSocket… Y también una documentación completa.

:::aside
Publicado originalmente en inglés en [Medium](https://herbercolop.medium.com/the-first-entifix-application-4bda3776950f) el 1 de agosto de 2020. Traducción al español.
:::
