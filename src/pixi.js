const PIXI = require('pixi.js')

let renderer, stage, tilingSprite

module.exports = {

    initRenderer: () => {
        renderer = PIXI.autoDetectRenderer(1280, 720)
        document.body.appendChild(renderer.view)
        stage = new PIXI.Container()
    },

    loadTexture: (filePath) => {
        const texture = PIXI.Texture.fromImage(filePath)
        tilingSprite = new PIXI.extras.TilingSprite(texture, renderer.width, renderer.height)
        stage.addChild(tilingSprite)
    },

    renderLoop: () => {
        animate()
    }

}

const animate = () => {
    let count = 0
    count += 0.005
    tilingSprite.tileScale.x = 2 + Math.sin(count)
    tilingSprite.tileScale.y = 2 + Math.cos(count)
    tilingSprite.tilePosition.x += 1
    tilingSprite.tilePosition.y += 1
    renderer.render(stage)
    requestAnimationFrame(animate)
}