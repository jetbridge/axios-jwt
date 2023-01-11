import { applyStorage } from './src/applyStorage';
import { getBrowserLocalStorage } from './index';

beforeAll(()=> {
  applyStorage(getBrowserLocalStorage())
})
