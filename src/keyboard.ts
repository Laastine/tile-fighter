export interface IKey {
  code: number
  isDown: boolean
  isUp: boolean
  press: () => void
  release: () => void
  downHandler: (arg: KeyboardEvent) => void
  upHandler: (arg: KeyboardEvent) => void
}

export function keyboard(keyCode: number) {
  const key = {
    code: keyCode,
    isDown: false,
    isUp: true,
    press: Function,
    release: Function,
    downHandler: (event: KeyboardEvent) => {
      if (event.keyCode === key.code) {
        if (key.isUp && key.press) {
          key.press()
        }
        key.isDown = true
        key.isUp = false
      }
    },
    upHandler: (event: KeyboardEvent) => {
      if (event.keyCode === key.code) {
        if (key.isDown && key.release) {
          key.release()
        }
        key.isDown = false
        key.isUp = true
      }
    }
  }

  window.addEventListener('keydown', key.downHandler.bind(key), false)
  window.addEventListener('keyup', key.upHandler.bind(key), false)
  return key
}
