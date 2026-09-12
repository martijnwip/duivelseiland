import * as migration_20260912_091210_initial from './20260912_091210_initial';
import * as migration_20260912_094959_t9_content_collections from './20260912_094959_t9_content_collections';
import * as migration_20260912_172117_hero_slides from './20260912_172117_hero_slides';

export const migrations = [
  {
    up: migration_20260912_091210_initial.up,
    down: migration_20260912_091210_initial.down,
    name: '20260912_091210_initial',
  },
  {
    up: migration_20260912_094959_t9_content_collections.up,
    down: migration_20260912_094959_t9_content_collections.down,
    name: '20260912_094959_t9_content_collections',
  },
  {
    up: migration_20260912_172117_hero_slides.up,
    down: migration_20260912_172117_hero_slides.down,
    name: '20260912_172117_hero_slides'
  },
];
