import {Point} from 'pixi.js'

/**
 * Linear congruential generator
 */
export class LCG {
    public m: number
    public a: number
    public c: number
    public state: number

    public constructor(seed: number) {
      this.m = 0x80000000 // 2**31;
      this.a = 1103515245
      this.c = 12345
      this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1))
    }

    public randomInt() {
      this.state = (this.a * this.state + this.c) % this.m
      return this.state
    }

    /**
   * returns in range [0,1]
   * @returns {number}
   */
    public randomFloat() {
      return this.randomInt() / (this.m - 1)
    }

    /**
   * returns in range [start, end): including start, excluding end
   * @param start
   * @param end
   * @returns {number}
   */
    public nextRange(start: number, end: number) {
      return start + Math.floor(this.randomInt() / this.m * end - start)
    }

    public choice(array: number[]) {
      return array[this.nextRange(0, array.length)]
    }
}

export const cartesianToIsometric = (pointX: number, pointY: number) => {
  const x = pointX - pointY
  const y = (pointX + pointY) / 2
  return new Point(x, y)
}

export const isometricToCartesian = (pointX: number, pointY: number) => {
  const x = (2 * pointY + pointX) / 2
  const y = (2 * pointY - pointX) / 2
  return new Point(x, y)
}

export const mapObject = (o: object, f: (arg: number) => number) => {
  const res = {}
  Object.keys(o).forEach(k => {
    // @ts-ignore
    res[k] = f.call(this, o[k], k, o)
  })
  return res
}
