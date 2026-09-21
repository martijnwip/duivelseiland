import * as migration_20260912_091210_initial from './20260912_091210_initial';
import * as migration_20260912_094959_t9_content_collections from './20260912_094959_t9_content_collections';
import * as migration_20260912_170239_localization from './20260912_170239_localization';
import * as migration_20260912_172117_hero_slides from './20260912_172117_hero_slides';
import * as migration_20260916_095659_intro_veld from './20260916_095659_intro_veld';
import * as migration_20260916_130959_historische_fotos from './20260916_130959_historische_fotos';
import * as migration_20260916_133300_slideshows from './20260916_133300_slideshows';
import * as migration_20260918_090608_magic_link_auth from './20260918_090608_magic_link_auth';
import * as migration_20260918_092651_over_de_naam from './20260918_092651_over_de_naam';
import * as migration_20260918_092814_invite_links from './20260918_092814_invite_links';
import * as migration_20260921_114535_intro_richtext from './20260921_114535_intro_richtext';

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
  {
    up: migration_20260918_090608_magic_link_auth.up,
    down: migration_20260918_090608_magic_link_auth.down,
    name: '20260918_090608_magic_link_auth',
  },
  {
    up: migration_20260918_092651_over_de_naam.up,
    down: migration_20260918_092651_over_de_naam.down,
    name: '20260918_092651_over_de_naam',
  },
  {
    up: migration_20260918_092814_invite_links.up,
    down: migration_20260918_092814_invite_links.down,
    name: '20260918_092814_invite_links',
  },
  {
    up: migration_20260921_114535_intro_richtext.up,
    down: migration_20260921_114535_intro_richtext.down,
    name: '20260921_114535_intro_richtext'
  },
];
