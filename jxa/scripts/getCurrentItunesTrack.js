/* global Application */

const app = Application('iTunes')
const { currentTrack } = app
JSON.stringify({
  title: currentTrack.name(),
  artist: currentTrack.artist(),
  album: currentTrack.album(),
  duration: currentTrack.duration(),
  position: app.playerPosition(),
})
