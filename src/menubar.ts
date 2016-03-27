import * as PIXI from 'pixi.js'
import {Tilemap} from './tilemap'
import {config} from './config'

class Menubar extends PIXI.Container {
  background: PIXI.Graphics
  selectedTileCoordText: PIXI.Text
  selectedTileTypeText: PIXI.Text
  movementWarning: PIXI.Text
  constructor(tilemap: Tilemap) {
    super()
    this.interactive = true
    const marginWidth = 2
    this.background = new PIXI.Graphics()
    this.background.lineStyle(1, 0x000000, 1)
    this.background.beginFill(0x444444, 1)
    this.background.drawRect(config.menuBarWidth - marginWidth, 0, marginWidth, config.screenX)
    this.background.endFill()
    this.background.lineStyle(0, 0x000000, 1)
    this.background.beginFill(0xDDDDDD, 1)
    this.background.drawRect(0, 0, config.menuBarWidth - marginWidth, config.screenX)
    this.background.endFill()
    this.depth = 2
    this.addChild(this.background)

    this.selectedTileCoordText = new PIXI.Text('Tile: ',
      {font: '12px Helvetica', fill: '#777', align: 'left'})
    this.selectedTileTypeText = new PIXI.Text('Terrain: ',
      {font: '12px Helvetica', fill: '#777', align: 'left'})
    this.movementWarning = new PIXI.Text('',
      {font: '8px Helvetica', fill: '#F00', align: 'left'})
    this.selectedTileTypeText.position.y = 17
    this.movementWarning.position.y = 70
    this.addChild(this.selectedTileCoordText)
    this.addChild(this.selectedTileTypeText)
    this.addChild(this.movementWarning)
    this.addMenuButton(this, '+', 0, 24, tilemap, tilemap.zoomIn)
    this.addMenuButton(this, '-', 30, 24, tilemap, tilemap.zoomOut)
  }

  addMenuButton(that: any, text: string, x: number, y: number, obj: any, callback: any) {
    const textColor = '#777'
    const button = new PIXI.Text(text, {font: '40px Helvetica', fill: textColor}) as any
    button.position.x = x
    button.position.y = y
    button.interactive = true
    button.buttonMode = true
    button.hitArea = new PIXI.Rectangle(0, 12, 30, 30)
    button.mousedown = button.touchstart = () => {
      button.style = {font: '40px Helvetica', fill: '#333'}
    }
    button.mouseover = () => {
      button.style = {font: '40px Helvetica', fill: '#333'}
    }
    button.mouseup = button.touchend = () => {
      callback.call(obj)
      button.style = {font: '40px Helvetica', fill: textColor}
    }
    button.mouseupoutside = button.touchendoutside = () => {
      button.style = {font: '40px Helvetica', fill: textColor}
    }
    button.mouseout = () => {
      button.style = {font: '40px Helvetica', fill: textColor}
    }
    that.addChild(button)
  }
}

export default Menubar
