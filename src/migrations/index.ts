import * as migration_20260912_091210_initial from './20260912_091210_initial';

export const migrations = [
  {
    up: migration_20260912_091210_initial.up,
    down: migration_20260912_091210_initial.down,
    name: '20260912_091210_initial'
  },
];
