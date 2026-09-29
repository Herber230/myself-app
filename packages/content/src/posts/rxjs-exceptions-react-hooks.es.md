::figure{src="./image-1.png" alt="El logotipo de ReactiveX, una anguila, junto al átomo de React"}

:::lead
Los hooks son una gran característica de React: nos permiten reutilizar mucha de nuestra lógica de forma óptima cuando decidimos crear hooks personalizados. Aprendí Angular incluso antes de tener la primera noción de React, y al principio esta característica fue un reto por el cambio de paradigma que implica.
:::

Con algo de práctica, noté algunos patrones que podían ahorrarme mucho tiempo. Hay un aspecto que considero muy importante en las aplicaciones con capas reutilizables: el manejo de excepciones. Tiene que ser natural, fácil de usar para otros desarrolladores, cubrir todos los casos y además permitir ejecutar lógica según los datos de la excepción misma.

Ahí encontré un vacío que motivó la solución que presento aquí, porque no encontraba una forma clara de manejar las excepciones. Cuando tienes varios hooks personalizados, uno dentro de otro, se vuelve un poco raro usar useState para un objeto con la última excepción. Y pasar callbacks entre varias capas de hooks no parece mejor.

Entonces pensé en los Observables: si expongo uno en un hook personalizado, quien lo consume solo tiene que suscribirse y ejecutar las acciones que correspondan cuando la aplicación lo requiera. Otro aspecto muy importante: si tengo dos fuentes de posibles excepciones, puedo unirlas en un solo flujo y mantener el patrón. Y por último, si necesito acciones distintas en distintas capas de la aplicación, puedo exponer un Subject en lugar de un Observable, ¡y listo!

## Calentando motores

Voy a centrar la explicación en los detalles de Rxjs y de los hooks; asumo que conoces un poco la configuración de TypeScript para React. Por supuesto, este es el repositorio para que experimentes con él:

[Herber230/react-hooks-rx-exceptions](https://github.com/Herber230/react-hooks-rx-exceptions)

También puedes revisar el sitio de [Rxjs](https://rxjs.dev/guide/overview) y este [gran artículo](https://medium.com/@benlesh/observables-and-finnish-notation-df8356ed1c9b) sobre la notación finlandesa.

## ¡Muéstrame el código!

Este es un ejemplo básico de cómo usar un observable dentro de un hook:

```tsx
// useObservable.tsx
import { useEffect, useCallback } from 'react';
import { Observable } from 'rxjs';

// Get an existing observable and a function to handle the events
export function useObservable(observable$: Observable<number>, handler: (param: number) => void) {
  // We need to use a useCallback
  const fnHandler = useCallback(param => param + 1, []);

  // A side efect that clean the subscription as it must be when we work with ReactiveX
  useEffect(() => {
    const subscripton = observable$.subscribe({ next: fnHandler });
    return () => subscripton.unsubscribe();
  }, []);
}
```

El fragmento anterior muestra de forma básica cómo manejar el observer y la suscripción, y nos da una idea de cómo crear sinergia entre ambas APIs.

Ahora imaginemos que tenemos un flujo de excepciones que podemos manejar, y claro, sería genial poder usarlo como multicast, es decir, con varios suscriptores independientes:

```ts
// useExceptions.ts
import { useEffect, useCallback } from 'react';
import { Subject } from 'rxjs';
import { Exception } from '../utils';

export function useException$(exception$: Subject<Exception>, exceptionHandler: (exception: Exception) => void) {
  const fnExHandler = useCallback((e: Exception) => exceptionHandler(e), [exceptionHandler]);

  useEffect(() => {
    const subscripton = exception$.subscribe({ next: fnExHandler });
    return () => subscripton.unsubscribe();
  }, [exception$, fnExHandler]);
}
```

La misma idea. La diferencia es que usamos un subject en lugar de un observable, y un tipo Exception para definir nuestras excepciones, lo que en mi opinión es útil.

Para crear el flujo de excepciones, veamos cómo usarlo en un hook useRequest:

```ts
// useRequest.ts
import { useState, useCallback, useRef } from 'react';
import { Subject } from 'rxjs';
import { Exception } from '../utils';

export function useRequest<TParms, TResponse>(performer: (params: TParms) => Promise<TResponse>) {
  const [isOnTask, setIsOnTask] = useState(false);
  const [response, setResponse] = useState<TResponse>();

  //Create the Exception flow one time in the hook instance
  const exception$ = useRef(new Subject<Exception>()).current;

  const performRequest = useCallback(
    (params: TParms) => {
      setIsOnTask(true);
      performer(params)
        .then(response => {
          setResponse(response);
        })
        .catch(e => {
          //Send the exception
          exception$.next(new Exception().setOriginalException(e).setType('RequestException'));
        })
        .finally(() => {
          setIsOnTask(false);
        });
    },
    [performer],
  );

  return {
    isOnTask,
    performRequest,
    response,
    exception$,
  };
}
```

Aquí tenemos un hook personalizado para hacer peticiones asíncronas. Su único parámetro es la función que las ejecuta y devuelve una promesa con el resultado, y se usa a través de un useCallback, como en los hooks anteriores. Fíjate en que el catch de esa promesa usa el subject creado más arriba. Y por último, lo más importante: hay que instanciar el Subject una sola vez por instancia del hook, y para eso usamos useRef.

¿Y cómo usamos el hook useRequest?… Pues hagamos otra capa reutilizable: el hook useEntity:

```ts
// useEntity.ts
import { useEffect, useState } from 'react';
import { useRequest } from './useRequest';
import { useMergedException$ } from './useMergedExceptions';

export function useEntity<TEntity>(retrievePerformer: () => Promise<Array<TEntity>>, savePerformer: (entity: TEntity) => Promise<TEntity>) {
  const [isOnTask, setIsOnTask] = useState(false);

  const { isOnTask: isLoading, response: entityCollection, performRequest: loadCollection, exception$: retrieveException$ } = useRequest<void, Array<TEntity>>(retrievePerformer);

  const { isOnTask: isSaving, response: entity, performRequest: saveEntity, exception$: saveException$ } = useRequest<TEntity, TEntity>(savePerformer);

  const exception$ = useMergedException$(retrieveException$, saveException$);

  useEffect(() => {
    setIsOnTask(isLoading || isSaving);
  }, [isLoading, isSaving]);

  return {
    isOnTask,
    isLoading,
    entityCollection,
    loadCollection,
    isSaving,
    entity,
    saveEntity,
    exception$,
  };
}
```

Esta nueva capa usa dos hooks useRequest para habilitar dos de las acciones que normalmente necesita el CRUD de una entidad. Como ves, renombramos los objetos desestructurados y tenemos dos flujos de excepciones, cada uno con los escenarios que podrían romper nuestro código. Seguro también notaste uno nuevo y extraño, el hook useMergedException$:

```ts
// useMergedExceptions.ts
import { useRef, useEffect } from 'react';
import { merge, Observable, Subject } from 'rxjs';
import { Exception } from '../utils';

export function useMergedException$(...exception$: Array<Observable<Exception>>) {
  // Single instance of the new subject
  const mergedException$ = useRef(new Subject<Exception>()).current;

  useEffect(() => {
    const mergedFlow$ = merge(...exception$);
    // Convert the observable to a multicast flow
    const subscription = mergedFlow$.subscribe(mergedException$);
    return () => subscription.unsubscribe();
  }, []);

  return mergedException$;
}
```

Para mí aquí está la mayor parte de la magia. A medida que agregamos capas de código reutilizable, vamos a encontrar más flujos de excepciones, y sería terrible mantenerlos separados. Lo mejor es unirlos todos en un solo flujo, devolverlo como resultado de nuestro hook y mantener el patrón.

El operador merge de rxjs es el indicado, pero crea un observable, y según el patrón que buscamos, el flujo final debe ser un subject. Por eso creamos un nuevo Subject y lo suscribimos al resultado combinado para que el flujo sea multicast.

Con el hook useMergedException$ puedes unir tantos flujos como necesites.

Por último, podemos usar nuestro hook useEntity:

```tsx
// useEntityImplementation.tsx
const { isOnTask: isOnTaskCar, loadCollection: carLoadCollection, entityCollection: carCollection, saveEntity: saveCar, exception$: carException$ } = useEntity(DummyCarService.getCars, DummyCarService.addCar);

useException$(carException$, exception => {
  setCarException(`It was an exception for CAR. Type: ${exception.type}`);
});
```

Es solo un fragmento; la implementación completa está en el repositorio. Pero puedes ver que DummyCarService provee las peticiones asíncronas para el hook useEntity, y que con useException$ manejamos todas las excepciones que podrían lanzarse dentro de nuestro hook.

## Para terminar

Esta es la pantalla que deberías ver al correr el repositorio:

::figure{src="./image-2.png" alt="La aplicación de ejemplo: una tabla de carros con los botones Add Car y Reload, y un panel de bicicletas que dice “It was an exception for BIKES. Type: RequestException”"}

El componente principal usa dos veces el hook useEntity, con dos servicios de prueba que lanzan excepciones al azar (50–50) para que veas cómo se manejan.

Gracias por leer. Espero que te sea útil.

:::aside
Publicado originalmente en inglés en [Medium](https://herbercolop.medium.com/handling-exceptions-with-rxjs-and-react-hooks-52a2c1436c59) el 19 de junio de 2021. Traducción al español.
:::
