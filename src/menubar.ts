import * as PIXI from 'pixi.js'
import {config} from './config'
import {Tilemap} from './tilemap'

class Menubar extends PIXI.Container {
  public background: PIXI.Graphics
  public selectedTileCoordText: PIXI.Text
  public selectedTileTypeText: PIXI.Text
  public movementWarning: PIXI.Text
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
      {fontSize: '12px', fill: '#777', align: 'left'})
    this.selectedTileTypeText = new PIXI.Text('Terrain: ',
      {fontSize: '12px', fill: '#777', align: 'left'})
    this.movementWarning = new PIXI.Text('',
      {fontSize: '8px', fill: '#F00', align: 'left'})
    this.selectedTileTypeText.position.y = 17
    this.movementWarning.position.y = 70
    this.addChild(this.selectedTileCoordText)
    this.addChild(this.selectedTileTypeText)
    this.addChild(this.movementWarning)
    this.addMenuButton(this, '+', 0, 24, tilemap, tilemap.zoomIn)
    this.addMenuButton(this, '-', 30, 24, tilemap, tilemap.zoomOut)
  }

  public addMenuButton(that: any, text: string, x: number, y: number, obj: any, callback: any) {
    const textColor = '#777'
    const button = new PIXI.Text(text, {fontSize: '40px', fill: textColor}) as any
    button.position.x = x
    button.position.y = y
    button.interactive = true
    button.buttonMode = true
    button.hitArea = new PIXI.Rectangle(0, 12, 30, 30)
    button.mousedown = button.touchstart = () => {
      button.style = {fontSize: '40px', fill: '#333'}
    }
    button.mouseover = () => {
      button.style = {fontSize: '40px', fill: '#333'}
    }
    button.mouseup = button.touchend = () => {
      callback.call(obj)
      button.style = {fontSize: '40px', fill: textColor}
    }
    button.mouseupoutside = button.touchendoutside = () => {
      button.style = {fontSize: '40px', fill: textColor}
    }
    button.mouseout = () => {
      button.style = {fontSize: '40px', fill: textColor}
    }
    that.addChild(button)
  }
}

export default Menubar
