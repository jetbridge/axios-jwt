import { applyStorage } from './src/applyStorage';
import { getBrowserLocalStorage } from './src';

beforeAll(()=> {
  applyStorage(getBrowserLocalStorage())
})
