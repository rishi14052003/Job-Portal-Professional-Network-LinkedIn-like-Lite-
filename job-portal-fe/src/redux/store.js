import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './userSlice.js';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user']
};

const appReducer = combineReducers({
  user: userReducer
});

const rootReducer = (state, action) => {
  if (
    action.type === 'user/resetUser' ||
    action.type === 'user/logout' ||
    action.type === 'user/registerSuccess' ||
    action.type === 'user/loginSuccess'
  ) {
    storage.removeItem('persist:root');
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] }
    })
});

export const persistor = persistStore(store);
export default store;
