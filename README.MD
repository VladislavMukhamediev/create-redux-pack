## Create Redux Pack (CRPack)

Create Redux Pack is a wrapper around **@reduxjs/toolkit** and **reselect** meant to reduce development time and amount of common errors working with **redux**.

Most Apps with Redux state management use a lot of boilerplates. This library moves those boilerplates / repetitions away from your eyes. Even if default logic of CRPack doesn't fit your code style you can always make your own reusable generator(s) and still save a lot of time.


## Installation

To install CRPack simple run:

```sh
npm install --save create-redux-pack
```

## Examples

<details>
<summary>Using with configureStore utility</summary>

```js
    // Package
    import createReduxPack from 'create-redux-pack';
  
    export const {
      name,
      stateNames,
      actionNames,
      actions,
      selectors,
      initialState,
      reducer,
    } = createReduxPack({ name: 'SimplePack', reducerName: 'sampleReducer' });

    // React component

    import { actions, selectors } from '@src/store/packages';
    //...
    const dispatch = useDispatch();
    const result = useSelector(selectors.result);
    const isLoading = useSelector(selectors.isLoading);
    
    useEffect(() => dispatch(actions.run()), []);
    //...

    // Redux-Saga
    
    function* fetchSomething() {
      try {
        const data = yield call(Api.getSomething);
        yield put(actions.success(data));
      } catch (error) {
        yield put(actions.fail(error));
      }
    }
    
    function* watcher() {
      yield takeEvery(actionNames.run, fetchSomething);
    }
```
</details>

<details>
<summary>Using without configureStore utility</summary>

To add logic of a pack it is required to inject its reducer and initialState into according reducer, other parts like selectors and actions can be used without other requirements.

```js
    // Package
    import createReduxPack from 'create-redux-pack';
  
    export const pack = createReduxPack({ name: 'SimplePack', reducerName: 'sampleReducer' });

    // Reducer
    import { createReducer } from '@reduxjs/toolkit';
    import { pack } from '@store/packages/pack';

    const initialState = {
      ...pack.initialState,
    } 

    export const sampleReducer = createReducer(initialState, {
      ...pack.reducer,
    });      

    // Or traditional way

    export const sampleReducerFn = (state = initialState, action) => {
      if (pack.reducer[action.type]) {
        return pack.reducer[action.type](state, action)
      }

      switch(action.type) {
      case 'something':
        return {
          ...state,
          whatever: action.payload,
        }
      default: 
        return {
          ...state,
        }
      }
    }  

```
</details>
<details>
<summary>Using with customizations</summary>

```js
    import createReduxPack from "create-redux-pack";

    const { 
      stateNames: firstPackStateNames,  
      initialState: firstPackInitialState, 
      selectors: firstPackSelectors, 
    } = createReduxPack({
      name: 'PackWithPayload',
      reducerName: 'Reducer',
      payloadMap: {
        item1: {
          key: 'passedItem1',
          initial: null,
        },
        item2: {
          key: 'passedItem2',
          innerItem1: {
            key: 'someField.sub', 
            item: {
              // will take 'passedItem2.someField.sub.item' of payload
              initial: { a: 0 },
              fallback: { a: 10 },
            },
          },
        },
      },
    });
    
    const PackWithPayloadModify = createReduxPack({
      name: 'PackWithPayload + modify',
      reducerName: 'Reducer',
      payloadMap: {
        [firstPackStateNames.item1]: {
          key: 'passedItem1',
          initial: firstPackInitialState[firstPackStateNames.item1],
          modifyValue: (passedItem, prevValue) => prevValue + passedItem,
        }, 
        [firstPackStateNames.item2]: {
          innerItem1: { // end state will contain both pack's innerItem1
            // will take 'innerItem1' of payload
            initial: 1,
            modifyValue: (passedItem, prevValue) => prevValue + 1,
            },
          },
        },
    });

    const { actions, selectors, actionNames } = PackWithPayloadModify;

    // React Component
    
    const item1 = useSelector(firstPackSelectors.item1);
    const result = useSelector(selectors.result);
    const isLoading = useSelector(selectors.isLoading);

    dispatch(actions.run());

    // Redux-Saga

    function* fetchSomething() {
      try {
        const data = yield call(Api.getSomething);
        yield put(actions.success(data));
      } catch (error) {
        yield put(actions.fail(error));
      }
    }
    
    function* watcher() {
      yield takeEvery(actionNames.run, fetchSomething);
    }
```
</details>

## Lazy loading

CRPack fully and internally supports lazy loading. If you are using webpack reducer of each package will be injected on their first import.

> Lazy loading only works if store was configured using provided configureStore utility.


## Instances for loading

It's annoying how sometimes fetching data updates loading everywhere showing loader when and where you did not intend to. With action instances you can separate loaders accordingly.

## Dynamic Logger

CRPack has integrated logger which can be enabled and disabled from any part of your code. It will only display type and payload of dispatched actions but practice shows it is enough and if it isn't you should use redux devtools, the main purpose of this logger is to display actions that are dispatched on current page / screen to ease debugging a bit.

## CRPack is an extension not a replacement

CRPack is just a utility you can use to create common / simple packs of redux components. Unless you configure store with this library you can just append provided components where you need them. And even if you do configure store with it, it still provides tools to manually create what you need. For example createReducerOn append an action map to reducer and inject it on import (supports lazy loading).

## Reducer is an Action Map

In context of CRPack all Action Maps referred as Reducers. The difference of terms is major, yet passing action map to parameter named reducer will result in an actual reducer with same cases making those two terms equal for the library.

> Action Map is an object containing cases for reducer that looks like this <br />**{ [typeOfAction]: (state, action) => ({ ...state, result: action.payload }) }**

## API reference

- [createReduxPack](#createreduxpackpackinfo--pack)
- [pack.withGenerator](#packwithgeneratorpackinfo-generator--injectedpack)
- [configureStore](#configurestoreoptions--store)
- [mergeGenerators](#mergegeneratorsgenerator--generator)
- [createAction](#createactionname-formatpayload--payload--action)
- [createSelector](#createselectorreducerorsource-keyorformat--selector)
- [createReducerCase](#createreducercasestate-action--partialstate)
- [createReducerOn](#createreduceronreducername-actionmap-initialstate--void)
- [loggerToggle](#enablelogger-and-disablelogger)
- [toggleReducerUpdates](#createreduxpackfreezereducerupdates)
- [resetAction](#resetaction)
- [createReduxPack[formatNames]](#createreduxpack-name-formation)
- [createReduxPack[informationalItems]](#createreduxpack_store)

### createReduxPack(packInfo) => pack
Creates pack of redux components with default generator

**createReduxPack**<State, PayloadRun, PayloadMain>

- **State** = Record<string, any> - appended State of reducer
- **PayloadRun** = void - type of run Payload
- **PayloadMain** = Record<string, any> - type of success Payload

#### packInfo

- **name** - *string*, Required, pack name, will be modified to be unique
- **reducerName** - *string*, Required, name of reducer, will be used to add or inject logic into specified reducer
- **defaultInitial** - *any*, Optional, initial value of default result/value, fallbacks to *null*, should be defined if you are using result/value for state management
- **mergeByKey** - *string*, Optional, if not empty will make reducers try to merge default value with payload using key as identificator, initial and payload should be an array or an object otherwise no merge will commence
- **formatPayload** - *(data: PayloadMain) => State*, Optional, function to format payload for default value field
- **payloadMap** - *CreateReduxPackPayloadMap<State>*, Optional, object of extra fields that will be appended to state
- **template** - *'request' | 'simple'*, Optional, template to use when creating a package, fallbacks to 'request'.

#### payloadMap

{ [key of (State, anotherPackState)]: options | { [innerKey of State[key]]: options | ... }  }

Accepts object with options or nested object with end section containing options, supports keys of  another pack's State.

Options:
- **initial** - *State[key of field]*, Required, initial value of this field
- **formatPayload** - *(payload: PayloadMain) => State[key of field]*, Optional, function to get value for current field from payload
- **fallback** - *any*, Optional, value that will replace current field value in case falsy payload will be provided to success action. It's just a guard to prevent potential crashes of bad payload.
- **formatSelector** - *(data: State[key of field]) => any*, Optional, function to format field value for selector to return. **Types have to be specified explicitly** (known issue) *or typescript will throw error on non-primitive types*.
- **modifyValue** - *(value: any, prevValue?: State[key of field]) => State[key of field]*, Optional, used to set new value according or using previous value.

#### Request Pack contains

- **name** - contains generated name of pack
- **actions** - contains default actions
    - **run** - (payload: PayloadRun) => Action
    - **success** - (payload: PayloadMain) => Action
    - **fail** - (error: string) => Action
    - **&ast;.instances.&ast;** - according action with injected instance
- **selectors** - contains selectors for generated fields of state
    - **isLoading** - Selector for loading
    - **isLoading.instances.&ast;** - Selectors for instanced loadings
    - **error** - Selector for error
    - **result** - Selector for result
    - **[key of State]** - Selectors for each field of payloadMap
    - **[key of State][innerKey of State[key]][...]** - Selectors for nested payloadMap object, if field wasn't declared in payloadMap it can still be accessed, failing to acquire that key will result in selector returning *undefined*.
- **initialState** - contains initial state for generated fields can only be accessed with stateNames
- **reducer** - contains action map for reducer can only be accessed with actionNames
- **actionNames** - contains keys to actions of reducers
    - **run** - string
    - **success** - string
    - **fail** - string
- **stateNames** - contains keys to values of state
    - **isLoading** - string
    - **result** - string
    - **error** - string
    - **[key of State]** - string, fields passed to payloadMap
    - **[key of State][innerKey of State[key]][...]** - string, fields of nested payloadMap object, returns generated key or own key if field wasn't declared.
  
#### Simple Pack contains

- **name** - contains generated name of pack
- **actions** - contains default actions
    - **set** - (payload: PayloadMain) => Action
    - **reset** - () => Action
- **selectors** - contains selectors for generated fields of state
    - **value** - Selector for default value field
    - **[key of State]** - Selectors for each field of payloadMap
    - **[key of State][innerKey of State[key]][...]** - Selectors for nested payloadMap object, if field wasn't declared in payloadMap it can still be accessed, failing to acquire that key will result in selector returning *undefined*.
- **initialState** - contains initial state for generated fields can only be accessed with stateNames
- **reducer** - contains action map for reducer can only be accessed with actionNames
- **actionNames** - contains keys to actions of reducers
    - **set** - string
    - **reset** - string
- **stateNames** - contains keys to values of state
    - **value** - string
    - **[key of State]** - string, fields passed to payloadMap
    - **[key of State][innerKey of State[key]][...]** - string, fields of nested payloadMap object, returns generated key or own key if field wasn't declared.

### pack.withGenerator(packInfo, generator) => injectedPack

Creates pack of redux components using default generator injected with provided custom generator, **results of generators with same name as default packs parts will be merged**.

**pack.withGenerator**<State, PayloadRun, PayloadMain, Gen>

- **State** = Record<string, any> - appended State of reducer
- **PayloadRun** = void - type of run Payload
- **PayloadMain** = Record<string, any> - type of success Payload
- **Gen** = Record<string, any> - type of fields that will be added

#### generator

Accepts an object containing fields with functions that accept a packInfo parameter and return any type of data that you want your pack to have

> Field with name of **name** will be rejected. Only default generator can set pack's name.

```js
  const generator = {
    anyField: (info) => info.name,  
    anotherField: () => 'anotherField',  
  }

  const customPack = createReduxPack({
    name: 'CustomPack',
    reducerName: 'Reducer',
  }).withGenerator(generator);

  console.log(customPack.anotherField) // 'anotherField'

```

Main purpose of withGenerator is to inject logic into default generator

> It is advised to get packInfo from provided parameter to keep generators reusable and get packInfo modified internally

```js
  import createReduxPack, { createAction } from 'create-redux-pack';

  const generator =  {
    actionNames: ({ name }) => ({
      reset: name + 'Reset',
    }),
    actions: ({ name }) => ({
      reset: createAction(name + 'Reset'),
    }),
    reducer: ({ name }) => ({
      [name + 'Reset']: (state) => ({
        ...state,
        [createReduxPack.getResultName(name)]: null,
      }),
    }),
  }

  const customPack = createReduxPack.withGenerator({
        name: 'PackWithCustomAction',
        reducerName: 'Reducer',
  }, generator);
  
  // React Component
  dispatch(customPack.actions.reset());

```

### configureStore(options) => store

Configures store with provided options, **accepts same parameters as configureStore of @reduxjs/toolkit except reducer**, reducer will be added internally, provided will be rejected.

### mergeGenerators(...generator) => generator

Merges multiple generators into one. Exists to combine logic of several reusable generators.

> Will merge results of reducer cases

### createAction(name, formatPayload) => (payload) => Action

Creates same action as CRPack creates internally. Accepts action name and a function to format payload.

### createSelector(reducerOrSource, keyOrFormat) => Selector

Creates same selector as CRPack creates internally. Accepts reducer name to get state from and that state's key or source selector and formation.

### createReducerCase(state, action) => Partial<State>

Creates reducer case, will spread state in result itself. Exists to skip comparison stage of generator's merging.

### createReducerOn(reducerName, actionMap, initialState) => void

Creates reducer and inject it to selected place.

> Injection will only happen on file import, meaning it is required to add <br />**import "@store/reducers/myReducer"** <br />to a page you will need it on or to a store configuration file / root file of your app depending on the requirement of lazy loading.

### enableLogger() and disableLogger()

Enables / disables logger

> Doesn't prevent actions from others places to be logged, will display any action that was dispatched while active

> It is advised to remove usage of those functions before building

```js
  import { enableLogger, disableLogger } from 'create-redux-pack';
  // React Component
  
  // Enable logger on mount and disable it on unmount
  useEffect(() => {
    enableLogger();
    return disableLogger
  }, [])
   
```

### createReduxPack.freezeReducerUpdates()

Stops all injections of reducers into store until activated

### createReduxPack.releaseReducerUpdates()

Allows all injections of reducers into store and immediately injects all reducers added since injections disable.

> It is advised to freeze updated in the beginning of files that are being lazy loaded and release updates in their ends. This feature exists because all packages injected separately and single bulk update will be more performant.

### resetAction

Call returns action that can be dispatched to reset store to initial state.
  
### createReduxPack name formation
- *createReduxPack*.**getRunName(name)** - returns run action name
- *createReduxPack*.**getSuccessName(name)** - returns success action name
- *createReduxPack*.**getFailName(name)** - returns fail action name
- *createReduxPack*.**getLoadingName(name)** - returns loading state name
- *createReduxPack*.**getErrorName(name)** - returns error state name
- *createReduxPack*.**getKeyName(name, key)** - returns generic state name

### createReduxPack._store

*ReadOnly*. Contains store configured with configureStore.

### createReduxPack._reducers

*ReadOnly*. Contains all injected reducers (merged)

### createReduxPack._initialState

*ReadOnly*. Contains initialState of all injected reducers (merged)

### createReduxPack._generators

*ReadOnly*. Contains default generators for request and simple packages.

## ToDo list
- [x] Expose merge for generators
- [x] Merge results of merged reducers
- [x] Resolve payloadMap to support nested payload object
- [x] Add instances for loading
- [ ] Merge for reducer values / results
- [ ] PayloadMap for run and error actions
- [ ] Provide utils to work with nested payloadMap within generators
- [ ] Injection to Root Reducer for global actions
