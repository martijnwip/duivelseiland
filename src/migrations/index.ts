import * as migration_20260912_091210_initial from './20260912_091210_initial';
import * as migration_20260912_094959_t9_content_collections from './20260912_094959_t9_content_collections';
import * as migration_20260912_170239_localization from './20260912_170239_localization';
import * as migration_20260912_172117_hero_slides from './20260912_172117_hero_slides';
import * as migration_20260916_095659_intro_veld from './20260916_095659_intro_veld';
import * as migration_20260916_130959_historische_fotos from './20260916_130959_historische_fotos';
import * as migration_20260916_133300_slideshows from './20260916_133300_slideshows';

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
    up: migration_20260912_170239_localization.up,
    down: migration_20260912_170239_localization.down,
    name: '20260912_170239_localization',
  },
  {
    up: migration_20260912_172117_hero_slides.up,
    down: migration_20260912_172117_hero_slides.down,
    name: '20260912_172117_hero_slides',
  },
  {
    up: migration_20260916_095659_intro_veld.up,
    down: migration_20260916_095659_intro_veld.down,
    name: '20260916_095659_intro_veld',
  },
  {
    up: migration_20260916_130959_historische_fotos.up,
    down: migration_20260916_130959_historische_fotos.down,
    name: '20260916_130959_historische_fotos',
  },
  {
    up: migration_20260916_133300_slideshows.up,
    down: migration_20260916_133300_slideshows.down,
    name: '20260916_133300_slideshows',
  },
];
