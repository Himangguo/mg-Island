import Phaser from 'phaser'
import { generateAssets } from '../assets'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  create() {
    generateAssets(this)
    this.scene.start('World')
  }
}