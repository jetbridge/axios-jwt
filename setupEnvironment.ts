import JSDOMEnvironment from 'jest-environment-jsdom';
import { applyStorage } from './src/applyStorage';
import { getBrowserLocalStorage } from './src';
import { StorageProxy } from './src/StorageProxy';


class SetupEnvironment extends JSDOMEnvironment {
  // constructor(config: any, context: any) {
  //   super(config, context);
  //   console.log(config.globalConfig)
  //   console.log(config.projectConfig)
  // }

  async setup() {
    await super.setup()
    applyStorage(getBrowserLocalStorage())
  }

  async teardown() {
    StorageProxy.Storage = null
    await super.teardown();
  }
}

module.exports = SetupEnvironment;
