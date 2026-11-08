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
import * as migration_20260921_132141_footer_richtext from './20260921_132141_footer_richtext';
import * as migration_20260921_142717_footer_richtext_repair from './20260921_142717_footer_richtext_repair';
import * as migration_20260922_105605_agenda_recurrence from './20260922_105605_agenda_recurrence';
import * as migration_20260922_132036_agenda_rich_layout from './20260922_132036_agenda_rich_layout';
import * as migration_20260922_135352_agenda_schedule_title_optional from './20260922_135352_agenda_schedule_title_optional';
import * as migration_20260922_141111_agenda_whatsapp_number from './20260922_141111_agenda_whatsapp_number';
import * as migration_20260923_121226_buurtborrel from './20260923_121226_buurtborrel';
import * as migration_20260923_141050_menu_zichtbaar from './20260923_141050_menu_zichtbaar';
import * as migration_20260924_121946_geschiedenis_verhaal from './20260924_121946_geschiedenis_verhaal';
import * as migration_20261002_093041_idee_likes from './20261002_093041_idee_likes';
import * as migration_20261002_100644_nieuwsbrief_abonnees from './20261002_100644_nieuwsbrief_abonnees';
import * as migration_20261002_104348_nieuwsbrief_bron from './20261002_104348_nieuwsbrief_bron';
import * as migration_20261002_125350_activiteiten from './20261002_125350_activiteiten';
import * as migration_20261002_131210_nieuwsbrief_naam from './20261002_131210_nieuwsbrief_naam';
import * as migration_20261002_133220_adresboek from './20261002_133220_adresboek';
import * as migration_20261002_140942_fase_goedgekeurd from './20261002_140942_fase_goedgekeurd';
import * as migration_20261002_143838_merge_activiteiten_nieuwsbrief from './20261002_143838_merge_activiteiten_nieuwsbrief';
import * as migration_20261006_111532_datum_samenvoegen from './20261006_111532_datum_samenvoegen';
import * as migration_20261006_122805_nieuwsbrief_edities from './20261006_122805_nieuwsbrief_edities';
import * as migration_20261006_232651_redacteur_mag_versturen from './20261006_232651_redacteur_mag_versturen';
import * as migration_20261006_235848_buurtpas from './20261006_235848_buurtpas';
import * as migration_20261007_001845_vakmensen_vakken from './20261007_001845_vakmensen_vakken';
import * as migration_20261007_010522_buurtpas_nieuwsbrief from './20261007_010522_buurtpas_nieuwsbrief';
import * as migration_20261014_120726_vakmensen_aanmelden from './20261014_120726_vakmensen_aanmelden';
import * as migration_20261014_130000_vaklui from './20261014_130000_vaklui';
import * as migration_20261014_160000_vakken_hoofdletter from './20261014_160000_vakken_hoofdletter';
import * as migration_20261021_121920_nieuwsbrief_deellink from './20261021_121920_nieuwsbrief_deellink';
import * as migration_20261021_142202_whatsapp_aanmeldingen from './20261021_142202_whatsapp_aanmeldingen';
import * as migration_20261021_144909_ideeen_seintjes from './20261021_144909_ideeen_seintjes';
import * as migration_20261025_090321_vaklui_aanbeveling from './20261025_090321_vaklui_aanbeveling';
import * as migration_20261029_150919_vaklui_slug from './20261029_150919_vaklui_slug';
import * as migration_20261029_155049_whatsapp_uitnodiging from './20261029_155049_whatsapp_uitnodiging';
import * as migration_20261102_161209_vaklui_telefoon_publiek from './20261102_161209_vaklui_telefoon_publiek';
import * as migration_20261108_124658_media_object_key from './20261108_124658_media_object_key';

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
    name: '20260921_114535_intro_richtext',
  },
  {
    up: migration_20260921_132141_footer_richtext.up,
    down: migration_20260921_132141_footer_richtext.down,
    name: '20260921_132141_footer_richtext',
  },
  {
    up: migration_20260921_142717_footer_richtext_repair.up,
    down: migration_20260921_142717_footer_richtext_repair.down,
    name: '20260921_142717_footer_richtext_repair',
  },
  {
    up: migration_20260922_105605_agenda_recurrence.up,
    down: migration_20260922_105605_agenda_recurrence.down,
    name: '20260922_105605_agenda_recurrence',
  },
  {
    up: migration_20260922_132036_agenda_rich_layout.up,
    down: migration_20260922_132036_agenda_rich_layout.down,
    name: '20260922_132036_agenda_rich_layout',
  },
  {
    up: migration_20260922_135352_agenda_schedule_title_optional.up,
    down: migration_20260922_135352_agenda_schedule_title_optional.down,
    name: '20260922_135352_agenda_schedule_title_optional',
  },
  {
    up: migration_20260922_141111_agenda_whatsapp_number.up,
    down: migration_20260922_141111_agenda_whatsapp_number.down,
    name: '20260922_141111_agenda_whatsapp_number',
  },
  {
    up: migration_20260923_121226_buurtborrel.up,
    down: migration_20260923_121226_buurtborrel.down,
    name: '20260923_121226_buurtborrel',
  },
  {
    up: migration_20260923_141050_menu_zichtbaar.up,
    down: migration_20260923_141050_menu_zichtbaar.down,
    name: '20260923_141050_menu_zichtbaar',
  },
  {
    up: migration_20260924_121946_geschiedenis_verhaal.up,
    down: migration_20260924_121946_geschiedenis_verhaal.down,
    name: '20260924_121946_geschiedenis_verhaal',
  },
  {
    up: migration_20261002_093041_idee_likes.up,
    down: migration_20261002_093041_idee_likes.down,
    name: '20261002_093041_idee_likes',
  },
  {
    up: migration_20261002_100644_nieuwsbrief_abonnees.up,
    down: migration_20261002_100644_nieuwsbrief_abonnees.down,
    name: '20261002_100644_nieuwsbrief_abonnees',
  },
  {
    up: migration_20261002_104348_nieuwsbrief_bron.up,
    down: migration_20261002_104348_nieuwsbrief_bron.down,
    name: '20261002_104348_nieuwsbrief_bron',
  },
  {
    up: migration_20261002_125350_activiteiten.up,
    down: migration_20261002_125350_activiteiten.down,
    name: '20261002_125350_activiteiten',
  },
  {
    up: migration_20261002_131210_nieuwsbrief_naam.up,
    down: migration_20261002_131210_nieuwsbrief_naam.down,
    name: '20261002_131210_nieuwsbrief_naam',
  },
  {
    up: migration_20261002_133220_adresboek.up,
    down: migration_20261002_133220_adresboek.down,
    name: '20261002_133220_adresboek',
  },
  {
    up: migration_20261002_140942_fase_goedgekeurd.up,
    down: migration_20261002_140942_fase_goedgekeurd.down,
    name: '20261002_140942_fase_goedgekeurd',
  },
  {
    up: migration_20261002_143838_merge_activiteiten_nieuwsbrief.up,
    down: migration_20261002_143838_merge_activiteiten_nieuwsbrief.down,
    name: '20261002_143838_merge_activiteiten_nieuwsbrief',
  },
  {
    up: migration_20261006_111532_datum_samenvoegen.up,
    down: migration_20261006_111532_datum_samenvoegen.down,
    name: '20261006_111532_datum_samenvoegen',
  },
  {
    up: migration_20261006_122805_nieuwsbrief_edities.up,
    down: migration_20261006_122805_nieuwsbrief_edities.down,
    name: '20261006_122805_nieuwsbrief_edities',
  },
  {
    up: migration_20261006_232651_redacteur_mag_versturen.up,
    down: migration_20261006_232651_redacteur_mag_versturen.down,
    name: '20261006_232651_redacteur_mag_versturen',
  },
  {
    up: migration_20261006_235848_buurtpas.up,
    down: migration_20261006_235848_buurtpas.down,
    name: '20261006_235848_buurtpas',
  },
  {
    up: migration_20261007_001845_vakmensen_vakken.up,
    down: migration_20261007_001845_vakmensen_vakken.down,
    name: '20261007_001845_vakmensen_vakken',
  },
  {
    up: migration_20261007_010522_buurtpas_nieuwsbrief.up,
    down: migration_20261007_010522_buurtpas_nieuwsbrief.down,
    name: '20261007_010522_buurtpas_nieuwsbrief',
  },
  {
    up: migration_20261014_120726_vakmensen_aanmelden.up,
    down: migration_20261014_120726_vakmensen_aanmelden.down,
    name: '20261014_120726_vakmensen_aanmelden',
  },
  {
    up: migration_20261014_130000_vaklui.up,
    down: migration_20261014_130000_vaklui.down,
    name: '20261014_130000_vaklui',
  },
  {
    up: migration_20261014_160000_vakken_hoofdletter.up,
    down: migration_20261014_160000_vakken_hoofdletter.down,
    name: '20261014_160000_vakken_hoofdletter',
  },
  {
    up: migration_20261021_121920_nieuwsbrief_deellink.up,
    down: migration_20261021_121920_nieuwsbrief_deellink.down,
    name: '20261021_121920_nieuwsbrief_deellink',
  },
  {
    up: migration_20261021_142202_whatsapp_aanmeldingen.up,
    down: migration_20261021_142202_whatsapp_aanmeldingen.down,
    name: '20261021_142202_whatsapp_aanmeldingen',
  },
  {
    up: migration_20261021_144909_ideeen_seintjes.up,
    down: migration_20261021_144909_ideeen_seintjes.down,
    name: '20261021_144909_ideeen_seintjes',
  },
  {
    up: migration_20261025_090321_vaklui_aanbeveling.up,
    down: migration_20261025_090321_vaklui_aanbeveling.down,
    name: '20261025_090321_vaklui_aanbeveling',
  },
  {
    up: migration_20261029_150919_vaklui_slug.up,
    down: migration_20261029_150919_vaklui_slug.down,
    name: '20261029_150919_vaklui_slug',
  },
  {
    up: migration_20261029_155049_whatsapp_uitnodiging.up,
    down: migration_20261029_155049_whatsapp_uitnodiging.down,
    name: '20261029_155049_whatsapp_uitnodiging',
  },
  {
    up: migration_20261102_161209_vaklui_telefoon_publiek.up,
    down: migration_20261102_161209_vaklui_telefoon_publiek.down,
    name: '20261102_161209_vaklui_telefoon_publiek',
  },
  {
    up: migration_20261108_124658_media_object_key.up,
    down: migration_20261108_124658_media_object_key.down,
    name: '20261108_124658_media_object_key'
  },
];
