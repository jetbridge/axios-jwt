import axios from 'axios';
import { applyAuthTokenInterceptor } from '../index'

describe('applyAuthTokenInterceptor', () => {
  it('throws an error if the passed axios instance if not an actual axios instance', () => {
    // GIVEN
    // I have an object that is not an Axios instance
    const totallyNotAnAxiosInstance = { foo: 'bar ' }

    // WHEN
    // I call applyAuthTokenInterceptor
    // THEN
    // I expect an error to have been called
    expect(() => {
      applyAuthTokenInterceptor(totallyNotAnAxiosInstance as any, { requestRefresh: jest.fn() })
    }).toThrow('invalid axios instance: [object Object]')
  })

  it('add the interceptor to the axios instance', () => {
    // GIVEN
    // I have an axios instance
    const instance = axios.create({})
    // that naturally has no interceptors
    const interceptors = instance.interceptors.request as any
    expect(interceptors.handlers.length).toEqual(0)

    // WHEN
    // I call applyAuthTokenInterceptor
    applyAuthTokenInterceptor(instance, { requestRefresh: jest.fn() })

    // THEN
    // I expect an interceptor to have been added
    expect(interceptors.handlers.length).toEqual(1)
  })
})
