::figure{src="./image-1.png" alt="The ReactiveX eel logo beside the React atom logo"}

:::lead
React-hooks are a really great feature of React, they allow us to reuse a lot of our logic in a optimum way when we decided to use custom hooks. I learned Angular even before my first notion of React, and at the beginning this feature was a bit challenging because of the paradigm change that implies.
:::

After some practice, I notice some patterns that could save me a lot of time. There is one aspect I consider really important to focus on for applications that contains reusable layers: The exception handling. This has to be natural, easy to use for other developers, provide a complete coverage and also a way to perform logic depending on the exception data itself.

At this point I found a gap that motivated the solution presented here, because I couldn’t find a clearly way to handle the exceptions. When you have some custom hooks one inside another, for example, it becomes a bit weird if you implement useState for an object with the last exception. Passing callbacks between multiple hook layers doesn’t seem better.

Then I think about Observables, if I can expose one in a custom hook, the consumer can just subscribe to it and perform the corresponding actions when the application requires it. Another aspect really important, if I have two sources of possible exceptions, I can merge them in a single flow and keep the pattern. And finally, if I need different actions in different layers of my app, I can expose a Subject instead an Observable and that’s it!.

## Warming up

I am going to focus the explanation on the Rxjs and Hooks details, I assume you are a bit familiarized with a Typescript setup for React. Of course this is the repo so you can experiment with it:

[Herber230/react-hooks-rx-exceptions](https://github.com/Herber230/react-hooks-rx-exceptions)

Also, you can check the [Rxjs](https://rxjs.dev/guide/overview) site and this [great post](https://medium.com/@benlesh/observables-and-finnish-notation-df8356ed1c9b) about finnish notation.

## Show me the code!

This is a basic example of how we can use use an observable inside a hook:

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

The previous snippet is a basic example of how to handle the observer and the subscription, and it give us an idea of how we can create synergy between both APIs.

Well, let’s imagine we have a flow of exceptions that we can handle, and of course it would be great if we can use the flow as multicast, I mean multiple independent subscribers:

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

Well, same idea here. The difference is that we use a subject instead of an observable and we are using an Exception type to define our exceptions. That is useful in my opinion.

To create the exception flow let’s see how to use for a useRequest hook:

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

Here we have a custom hook that allows us to perform async request. The single param is the performer function that returns a promise to handle the result, and it is used trough a useCallback similiar to the previous hooks. You can notice that the catch function of this promise use the subject that it is created above. And finally, but most important fact here, is that we need to instance the Subject one single time per hook instance, so we use a useRef hook for that.

And how we can use the useRequest hook?… Well, let’s make another reusable layer. The useEntity hook:

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

This new layer use two useRequest hook to enable two of the possible actions we usually needs for an Entity crud. As you can notice, we rename the decomposited objects and we have two exception flows, each handling the corresponding possible scenarios that could broke our code. Also you notice for sure the new strange one, the useMergedException$ hook:

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

This makes the most of the magic to me. As we are adding more and more layers of reusable code, we are going to find more exceptions flow and it would be really awful to keep them separated. The best we can do is merge them all in single flow and return then as result of our custom hook and keep a pattern.

So, a merge operator imported from rxjs is the indicated, but this creates an observable and as the pattern we are trying to create, the final flow must be a subject. So thats why we create a new Subject and we subscribe it to the merged result to multicast the flow.

With the useMergedException$ hook you can merge as many flows as you need.

Finally, we can implement our useEntity hook:

```tsx
// useEntityImplementation.tsx
const { isOnTask: isOnTaskCar, loadCollection: carLoadCollection, entityCollection: carCollection, saveEntity: saveCar, exception$: carException$ } = useEntity(DummyCarService.getCars, DummyCarService.addCar);

useException$(carException$, exception => {
  setCarException(`It was an exception for CAR. Type: ${exception.type}`);
});
```

This is just an snippet, you can find the complete implementation inside the repo. But you can see that DummyCarService provides the async requests to enable the useEntityHook, and with the implementation of useException$ hook we can handle all the exceptions that can be possible thrown inside our custom hook.

## Wrapping Up

This is the screen you should see when you run the repo:

::figure{src="./image-2.png" alt="The demo app: a table of cars with Add Car and Reload buttons, and a bikes panel reading “It was an exception for BIKES. Type: RequestException”"}

The main component has a double implementation of useEntity hook. Also two dummy services that throw exceptions in a random way (50–50) so you can see how they are handled.

Thanks for reading. Hope this could be useful to you.

:::aside
First published on [Medium](https://herbercolop.medium.com/handling-exceptions-with-rxjs-and-react-hooks-52a2c1436c59) on 19 June 2021.
:::
