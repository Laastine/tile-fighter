export function Keyboard(keyCode) {
  const key = {
    code: keyCode,
    isDown: false,
    isUp: true,
    press: undefined,
    release: undefined,
    downHandler: (event) => {
      if (event.keyCode === key.code) {
        if (key.isUp && key.press) key.press()
        key.isDown = true
        key.isUp = false
      }
      event.preventDefault()
    },
    upHandler: (event) => {
      if (event.keyCode === key.code) {
        if (key.isDown && key.release) {
          key.release()
        }
        key.isDown = false
        key.isUp = true
      }
      event.preventDefault()
    }
  }

  window.addEventListener("keydown", key.downHandler.bind(key), false)
  window.addEventListener("keyup", key.upHandler.bind(key), false)
  return key
}