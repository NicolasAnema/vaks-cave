// ============================================================
// AUDIO ALIASES — pairs manifest rows + music slots to the real
// uploaded files in assets/audio/ (which use descriptive names, not
// the vo/<stem>.opus convention). Paths are relative to assets/audio/
// and must match index.json exactly (run tools/audio_index.mjs after
// edits — it validates these and flags any dangling path).
//
// AudioManager prefers an alias over the stem convention. A string
// covers every line of a row; an array maps line variants by index
// (null = no recording for that line, falls back to the first one
// that exists, then to silent text). Edit freely to fix a match.
// ============================================================

export const VOICE_ALIASES = {
  m_big_days:      'sfx/It\'s a big days boss.opus',
  m_going_deep:    'sfx/Vaki going deep.opus',
  m_start_pool:    ['sfx/Enjoy your tea party.opus', 'sfx/Every Tuesday.opus', 'sfx/Culud Vaks.opus', 'sfx/live for faam.opus'],
  m_irie_feel:     'sfx/good to be feel irie.opus',
  m_irie_pool:     ['sfx/Smoke ganja.opus', null, 'sfx/Lucky Stick.opus'],
  m_too_strong:    'sfx/Too strong.opus',
  m_cat_die:       'sfx/Your cat.opus',
  m_vibe:          'sfx/Vibe with me.opus',
  m_wind_malawi:   'sfx/How is Malawi.opus',
  m_rrattax:       'sfx/Rrrattax.opus',
  m_not_scared:    'sfx/Confidence to kill mouse.opus',
  m_fish:          'sfx/You are a fish.opus',
  m_coming_boss:   'sfx/I\'m coming boss.opus',
  m_finished_room: 'sfx/Finish room.opus',
  m_chao:          'sfx/Cute goodbye.opus',
  m_wheres_boss:   'sfx/Where are you my boss.opus',
  m_shop_first:    'sfx/Hey tikolosh.opus',
  m_granny_faints: 'sfx/Vaks on why granny is fainting.opus',
  m_gogo:          'sfx/Granny Must let Vaks Sleep.opus',
  m_granny_spy:    ['sfx/Granny Spy on Vaks pt.1.opus', 'sfx/Granny Spy on Vaks pt.2.opus', 'sfx/Granny Spy on Vaks pt.3.opus'],
  m_tallman:       'sfx/Tallman owes Vaki.opus',
  m_shorty:        'sfx/Shorty Steal Plate.opus',
  m_stout:         'sfx/Lytie is stout.opus',
  m_meow_pool:     ['sfx/Vaki is a cat.opus', 'sfx/Meeeoooww.ogg', 'sfx/You forget to buy your cat.opus'],
  m_garden:        'sfx/Eyta Boss.mp3',
  m_idle_pool:     ['sfx/It\'s you!.opus', 'sfx/WhatAPP boss.opus', 'sfx/Vaki life update.opus', 'sfx/Grateful for status like.opus'],
  m_listen_up:     'sfx/Listen Up.opus',
  m_new_song:      'sfx/New song.opus',
  m_america_phone: 'sfx/America!.opus',
  m_peter_piper:   'sfx/Tounge Twister.opus',
  m_video_cutting: 'sfx/It\'s Cutting.opus',
  m_zombie:        'sfx/Sambies servant.opus',
  m_school:        'sfx/Why you not going to school.ogg',
  m_cat_eyes:      'sfx/Vaki going dark.opus',
};

export const MUSIC_ALIASES = {
  title: 'music/Theme Song.mp3',
  // lobby: 'music/Lobby.mp3',  // removed for now — Lobby.mp3 stays on disk, unwired
};
