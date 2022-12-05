import { StorageProxy } from './StorageProxy';
import { WebStorageService } from './WebStorageService';

// Initialize default web-storage
StorageProxy.Storage = new WebStorageService(localStorage)
