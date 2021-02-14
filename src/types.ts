import { ActionCreatorWithPreparedPayload, configureStore } from '@reduxjs/toolkit';
import { Reducer } from 'redux';
import { OutputSelector } from 'reselect';

export type CreateReduxPackParams<S, PayloadMain, PayloadMap extends CRPackPayloadMap<S> = any> = {
  name: string;
  defaultInitial?: any;
  reducerName: string;
  formatPayload?: (data: PayloadMain) => any;
  payloadMap?: CreateReduxPackPayloadMap<S, PayloadMap> & PayloadMap;
} & (
  | { template?: 'simple' }
  | {
      template?: 'request';
    }
);

export type Action<T> = {
  type: string;
  payload: T;
} & Record<string, any>;

export type CreateReduxPackGeneratorBlock<RT = any> = <
  S = Record<string, any>,
  PayloadMain = Record<string, any>,
  RTD = Record<string, any>,
  PayloadMap extends CRPackPayloadMap<S> = any
>(
  info: CreateReduxPackParams<S, PayloadMain, PayloadMap>,
) => RT | RTD;

export type CreateReduxPackCustomGenerator<Gen = Record<string, any>> = Record<
  keyof Gen,
  CreateReduxPackGeneratorBlock
>;

export type CreateReduxPackGenerator = {
  actions: CreateReduxPackGeneratorBlock;
  stateNames: CreateReduxPackGeneratorBlock;
  actionNames: CreateReduxPackGeneratorBlock;
  initialState: CreateReduxPackGeneratorBlock;
  reducer: CreateReduxPackGeneratorBlock;
  selectors: CreateReduxPackGeneratorBlock;
};

export type CRPackReducer<PayloadMain = void, PayloadRun = Record<string, any>> = Record<
  string,
  (state: any, action: Action<Record<string, any> & { error?: string } & PayloadMain & PayloadRun>) => any
>;

export type CRPackInitialState = Record<string, any>;

export type CRPackPayloadMap<S> = Record<string | keyof S, any>;

type CRPackPayloadMapItem<T, PayloadMap extends CRPackPayloadMap<T>> =
  | {
      initial: T;
      formatSelector?: (state: T) => ReturnType<PayloadMap['formatSelector']>;
      key?: string;
      fallback?: T;
      modifyValue?: (payloadValue: any, prevStateValue?: T) => T;
    }
  | ({
      [K in keyof T]?: CRPackPayloadMapItem<T[K], PayloadMap[K]>;
    } & { key?: string });

export type CreateReduxPackPayloadMap<S, PayloadMap extends CRPackPayloadMap<S> = any> = {
  [P in keyof S]?: CRPackPayloadMapItem<S[P], PayloadMap[P]>;
};

type CRPackStateName<S> = S extends Record<string, any>
  ? {
      [P in keyof S]: S[P] extends Record<string, any> ? CRPackStateName<S[P]> : string;
    }
  : string;

export type CRPackRequestStateNames<S> = {
  isLoading: string;
  result: string;
  error: string;
} & CRPackStateName<S>;

export type CRPackSimpleStateNames<S> = {
  value: string;
} & CRPackStateName<S>;

export type CRPackRequestActionNames = { run: string; success: string; fail: string };

export type CRPackSimpleActionNames = { set: string; reset: string };

export type CreateReduxPackAction<DT, RT = DT> = ActionCreatorWithPreparedPayload<[DT], RT>;

export type CRPackRequestActions<S, PayloadRun, PayloadMain> = {
  run: CreateReduxPackAction<PayloadRun, PayloadRun>;
  success: CreateReduxPackAction<PayloadMain, PayloadMain | S>;
  fail: CreateReduxPackAction<string, string>;
};

export type CRPackSimpleActions<S, PayloadMain> = {
  set: CreateReduxPackAction<PayloadMain, PayloadMain | S>;
  reset: CreateReduxPackAction<void, void>;
};

type CreateReduxPackSelector<S, PayloadMap extends CRPackPayloadMap<S>> = {
  [P in keyof S]: S[P] extends Record<string, any>
    ? OutputSelector<
        any,
        'formatSelector' extends keyof PayloadMap[P] ? ReturnType<PayloadMap[P]['formatSelector']> : S[P],
        any
      > &
        CreateReduxPackSelector<S[P], PayloadMap[P]>
    : OutputSelector<
        any,
        'formatSelector' extends keyof PayloadMap[P] ? ReturnType<PayloadMap[P]['formatSelector']> : S[P],
        any
      >;
};

export type CRPackRequestSelectors<S, PayloadMap extends CRPackPayloadMap<S> = any> = {
  isLoading: OutputSelector<any, boolean, any>;
  error: OutputSelector<any, null | string, any>;
  result: OutputSelector<any, S, any>;
} & CreateReduxPackSelector<S, PayloadMap>;

export type CRPackSimpleSelectors<S, PayloadMap extends CRPackPayloadMap<S> = any> = {
  value: OutputSelector<any, boolean, any>;
} & CreateReduxPackSelector<S, PayloadMap>;

export type CRPackGenObj<S, PayloadMain, PayloadMap extends CRPackPayloadMap<S> = any> = {
  [P in Exclude<string, 'name'>]: (info: CreateReduxPackParams<S, PayloadMain, PayloadMap>) => any;
};

type CRPackGenResult<
  S,
  Gen extends CRPackGenObj<S, PayloadMain, PayloadMap>,
  PayloadMain,
  PayloadMap extends CRPackPayloadMap<S> = any
> = {
  [P in keyof Gen]: ReturnType<Gen[P]>;
};

export type CRPackRequestGen<S, PayloadRun, PayloadMain, PayloadMap extends CRPackPayloadMap<S> = any> = {
  stateNames: (info: CreateReduxPackParams<S, PayloadMain, PayloadMap>) => CRPackRequestStateNames<S>;
  actionNames: (info: CreateReduxPackParams<S, PayloadMain, PayloadMap>) => CRPackRequestActionNames;
  actions: (
    info: CreateReduxPackParams<S, PayloadMain, PayloadMap>,
  ) => CRPackRequestActions<S, PayloadRun, PayloadMain>;
  initialState: (info: CreateReduxPackParams<S, PayloadMain, PayloadMap>) => CRPackInitialState;
  reducer: (info: CreateReduxPackParams<S, PayloadMain, PayloadMap>) => CRPackReducer<PayloadMain, PayloadRun>;
  selectors: (info: CreateReduxPackParams<S, PayloadMain, PayloadMap>) => CRPackRequestSelectors<S, PayloadMap>;
};

export type CRPackSimpleGen<S, PayloadRun, PayloadMain, PayloadMap extends CRPackPayloadMap<S> = any> = {
  stateNames: (info: CreateReduxPackParams<S, PayloadMain, PayloadMap>) => CRPackSimpleStateNames<S>;
  actionNames: (info: CreateReduxPackParams<S, PayloadMain, PayloadMap>) => CRPackSimpleActionNames;
  actions: (info: CreateReduxPackParams<S, PayloadMain, PayloadMap>) => CRPackSimpleActions<S, PayloadMain>;
  initialState: (info: CreateReduxPackParams<S, PayloadMain, PayloadMap>) => CRPackInitialState;
  reducer: (info: CreateReduxPackParams<S, PayloadMain, PayloadMap>) => CRPackReducer<PayloadMain, PayloadRun>;
  selectors: (info: CreateReduxPackParams<S, PayloadMain, PayloadMap>) => CRPackSimpleSelectors<S, PayloadMap>;
};

export type CreateReduxPackReturnType<
  S,
  PayloadRun,
  PayloadMain,
  TGen extends CRPackGenObj<S, PayloadMain, PayloadMap>,
  PayloadMap extends CRPackPayloadMap<S> = any
> = CRPackGenResult<S, TGen, PayloadMain, PayloadMap> & {
  name: string;
} & {
  withGenerator: <Gen = Record<string, any>>(
    generator: {
      [P in Exclude<keyof Gen, 'name'>]: (info: CreateReduxPackParams<S, PayloadMain, PayloadMap>) => Gen[P];
    },
  ) => {
    [P in keyof CreateReduxPackCombinedGenerators<
      Gen,
      S,
      PayloadRun,
      PayloadMain,
      PayloadMap
    >]: CreateReduxPackCombinedGenerators<Gen, S, PayloadRun, PayloadMain, PayloadMap>[P];
  };
};

export type CreateReduxPackFn = <
  S = Record<string, any>,
  PayloadRun = void,
  PayloadMain = Record<string, any>,
  PayloadMap extends CRPackPayloadMap<S> = any,
  Info extends CreateReduxPackParams<S, PayloadMain, PayloadMap> = any
>(
  info: Info,
) => CreateReduxPackReturnType<
  S,
  PayloadRun,
  PayloadMain,
  Info['template'] extends 'simple'
    ? CRPackSimpleGen<S, PayloadRun, PayloadMain, PayloadMap>
    : CRPackRequestGen<S, PayloadRun, PayloadMain, PayloadMap>,
  PayloadMap
>;

export type CreateReduxPackActionMap = Record<string, (state: any, action: Action<any>) => typeof state>;

export type CreateReduxPackType = {
  getSetName: (name: string) => string;
  getResetName: (name: string) => string;
  getRunName: (name: string) => string;
  getSuccessName: (name: string) => string;
  getFailName: (name: string) => string;
  getValueName: (name: string) => string;
  getLoadingName: (name: string) => string;
  getResultName: (name: string) => string;
  getErrorName: (name: string) => string;
  getKeyName: (name: string, key: string) => string;
  _generators: Record<string, CreateReduxPackGenerator>;
  _reducers: Record<string, CRPackReducer>;
  _initialState: CRPackInitialState;
  updateReducer: () => void;
  isLoggerOn: boolean;
  getRootReducer: (reducers?: Record<string, CreateReduxPackActionMap>, initialState?: Record<string, any>) => Reducer;
  injectReducerInto: (
    reducerName: string,
    actionMap: CreateReduxPackActionMap,
    initialState: Record<string, any>,
  ) => void;
  _store: ReturnType<typeof configureStore> | null;
  preventReducerUpdates: boolean;
  freezeReducerUpdates: () => void;
  releaseReducerUpdates: () => void;
  /*
   * @deprecated use pack's withGenerator(gen) method instead
   */
  withGenerator: <S, PayloadRun, PayloadMain, Gen, PayloadMap extends CRPackPayloadMap<S> = any>(
    info: CreateReduxPackParams<S, PayloadMain, PayloadMap>,
    generator: CRPackGenObj<S, PayloadMain, PayloadMap>,
  ) => {
    [P in keyof CreateReduxPackCombinedGenerators<
      Gen,
      S,
      PayloadRun,
      PayloadMain,
      PayloadMap
    >]: CreateReduxPackCombinedGenerators<Gen, S, PayloadRun, PayloadMain, PayloadMap>[P];
  };
};

export type CreateReduxPackCombinedGenerators<
  Gen,
  S,
  PayloadRun,
  PayloadMain,
  PayloadMap extends CRPackPayloadMap<S> = any
> = CreateReduxPackReturnType<S, PayloadRun, PayloadMain, PayloadMap> & Gen;
