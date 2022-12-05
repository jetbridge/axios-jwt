import { StorageProxy } from './StorageProxy';
import { StorageService } from './StorageService';

// Initialize default web-storage
StorageProxy.Storage = new StorageService(localStorage)
