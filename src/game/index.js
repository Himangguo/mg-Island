import Phaser from 'phaser'
import BootScene from './scenes/BootScene'
import WorldScene from './scenes/WorldScene'
import {
  BugHunterScene,
  AimChallengeScene,
  SwimScene,
  ChordScene,
  OllieScene,
  RainTrapScene,
  FitnessScene
} from './scenes/minigames'

export function createGame(parent) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 540,
    backgroundColor: '#0e0a0b',
    pixelArt: true,
    roundPixels: true,
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: 540
    },
    scene: [
      BootScene,
      WorldScene,
      BugHunterScene,
      AimChallengeScene,
      SwimScene,
      ChordScene,
      OllieScene,
      RainTrapScene,
      FitnessScene
    ]
  })
}