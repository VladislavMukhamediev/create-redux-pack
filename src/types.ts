import { ActionCreatorWithPreparedPayload, configureStore } from '@reduxjs/toolkit';
import { Reducer } from 'redux';
import { OutputSelector } from 'reselect';

export type CreateReduxPackParams<S, PayloadMain, RealType extends CRPackRealType<S> = any> = {
  name: string;
  resultInitial?: any;
  reducerName: string;
  formatPayload?: (data: PayloadMain) => any;
  payloadMap?: CreateReduxPackPayloadMap<S, RealType> & RealType;
};

export type Action<T> = {
  type: string;
  payload: T;
} & Record<string, any>;

export type CreateReduxPackGeneratorBlock<RT = any> = <
  S = Record<string, any>,
  PayloadMain = Record<string, any>,
  RTD = Record<string, any>,
  RealType extends CRPackRealType<S> = any
>(
  info: CreateReduxPackParams<S, PayloadMain, RealType>,
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

export type CreateReduxPackReducer<PayloadMain = void, PayloadRun = Record<string, any>> = Record<
  string,
  (state: any, action: Action<Record<string, any> & { error?: string } & PayloadMain & PayloadRun>) => any
>;

export type CreateReduxPackInitialState = Record<string, any>;

export type CRPackRealType<S> = Record<string | keyof S, any>;

type CRPackPayloadMapItem<T, RealType extends CRPackRealType<T>> =
  | {
      initial: T;
      formatSelector?: (state: T) => ReturnType<RealType['formatSelector']>;
      key?: string;
      fallback?: T;
      modifyValue?: (payloadValue: any, prevStateValue?: T) => T;
    }
  | ({
      [K in keyof T]?: CRPackPayloadMapItem<T[K], RealType[K]>;
    } & { key?: string });

export type CreateReduxPackPayloadMap<S, RealType extends CRPackRealType<S> = any> = {
  [P in keyof S]?: CRPackPayloadMapItem<S[P], RealType[P]>;
};

type CRPackStateName<S> = S extends Record<string, any>
  ? {
      [P in keyof S]: S[P] extends Record<string, any> ? CRPackStateName<S[P]> : string;
    }
  : string;

export type CreateReduxPackStateNames<S> = {
  isLoading: string;
  result: string;
  error: string;
} & CRPackStateName<S>;

export type CreateReduxPackActionNames = { run: string; success: string; fail: string };

export type CreateReduxPackAction<DT, RT = DT> = ActionCreatorWithPreparedPayload<[DT], RT>;

export type CreateReduxPackActions<S, PayloadRun, PayloadMain> = {
  run: CreateReduxPackAction<PayloadRun, PayloadRun>;
  success: CreateReduxPackAction<PayloadMain, PayloadMain | S>;
  fail: CreateReduxPackAction<string, string>;
};

type CreateReduxPackSelector<S, RealType extends CRPackRealType<S>> = {
  [P in keyof S]: S[P] extends Record<string, any>
    ? OutputSelector<
        any,
        'formatSelector' extends keyof RealType[P] ? ReturnType<RealType[P]['formatSelector']> : S[P],
        any
      > &
        CreateReduxPackSelector<S[P], RealType[P]>
    : OutputSelector<
        any,
        'formatSelector' extends keyof RealType[P] ? ReturnType<RealType[P]['formatSelector']> : S[P],
        any
      >;
};

export type CreateReduxPackSelectors<S, RealType extends CRPackRealType<S> = any> = {
  isLoading: OutputSelector<any, boolean, any>;
  error: OutputSelector<any, null | string, any>;
  result: OutputSelector<any, S, any>;
} & CreateReduxPackSelector<S, RealType>;

export type CreateReduxPackReturnType<S, PayloadRun, PayloadMain, RealType extends CRPackRealType<S> = any> = {
  stateNames: CreateReduxPackStateNames<S>;
  actionNames: CreateReduxPackActionNames;
  actions: CreateReduxPackActions<S, PayloadRun, PayloadMain>;
  initialState: CreateReduxPackInitialState;
  reducer: CreateReduxPackReducer<PayloadMain, PayloadRun>;
  selectors: CreateReduxPackSelectors<S, RealType>;
  name: string;
} & {
  withGenerator: <Gen = Record<string, any>>(
    generator: {
      [P in Exclude<keyof Gen, 'name'>]: (info: CreateReduxPackParams<S, PayloadMain, RealType>) => Gen[P];
    },
  ) => {
    [P in keyof CreateReduxPackCombinedGenerators<
      Gen,
      S,
      PayloadRun,
      PayloadMain,
      RealType
    >]: CreateReduxPackCombinedGenerators<Gen, S, PayloadRun, PayloadMain, RealType>[P];
  };
};

export type CreateReduxPackFn = <
  S = Record<string, any>,
  PayloadRun = void,
  PayloadMain = Record<string, any>,
  RealType extends CRPackRealType<S> = any
>(
  info: CreateReduxPackParams<S, PayloadMain, RealType>,
) => CreateReduxPackReturnType<S, PayloadRun, PayloadMain, RealType>;

export type CreateReduxPackActionMap = Record<string, (state: any, action: Action<any>) => typeof state>;

export type CreateReduxPackType = {
  getRunName: (name: string) => string;
  getSuccessName: (name: string) => string;
  getFailName: (name: string) => string;
  getLoadingName: (name: string) => string;
  getResultName: (name: string) => string;
  getErrorName: (name: string) => string;
  getKeyName: (name: string, key: string) => string;
  _generator: CreateReduxPackGenerator;
  _reducers: Record<string, CreateReduxPackReducer>;
  _initialState: CreateReduxPackInitialState;
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
  withGenerator: <S, PayloadRun, PayloadMain, Gen, RealType extends CRPackRealType<S> = any>(
    info: CreateReduxPackParams<S, PayloadMain, RealType>,
    generator: {
      [P in Exclude<keyof Gen, 'name'>]: (info: CreateReduxPackParams<S, PayloadMain, RealType>) => Gen[P];
    },
  ) => {
    [P in keyof CreateReduxPackCombinedGenerators<
      Gen,
      S,
      PayloadRun,
      PayloadMain,
      RealType
    >]: CreateReduxPackCombinedGenerators<Gen, S, PayloadRun, PayloadMain, RealType>[P];
  };
};

export type CreateReduxPackCombinedGenerators<
  Gen,
  S,
  PayloadRun,
  PayloadMain,
  RealType extends CRPackRealType<S> = any
> = CreateReduxPackReturnType<S, PayloadRun, PayloadMain, RealType> & Gen;
