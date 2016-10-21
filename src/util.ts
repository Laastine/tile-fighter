/**
 * Linear congruential generator
 */
export class LCG {
  m: number
  a: number
  c: number
  state: number

  constructor(seed: number) {
    this.m = 0x80000000; // 2**31;
    this.a = 1103515245;
    this.c = 12345;
    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1))
  }

  randomInt() {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state;
  }

  /**
   * returns in range [0,1]
   * @returns {number}
   */
  randomFloat() {
    return this.randomInt() / (this.m - 1);
  }

  /**
   * returns in range [start, end): including start, excluding end
   * @param start
   * @param end
   * @returns {number}
   */
  nextRange(start: number, end: number) {
    return start + Math.floor(this.randomInt() / this.m * end - start);
  }

  choice(array: number[]) {
    return array[this.nextRange(0, array.length)];
  }
}

export const cartesianToIsometric = (pointX: number, pointY: number) => {
  const x = pointX - pointY
  const y = (pointX + pointY) / 2
  return new PIXI.Point(x, y)
}

export const isometricToCartesian = (pointX: number, pointY: number) => {
  const x = (2 * pointY + pointX) / 2
  const y = (2 * pointY - pointX) / 2
  return new PIXI.Point(x, y)
}

export const mapObject: any = function (o: any, f: Function) {
  const res: any = {}
  Object.keys(o).forEach(function (k) {
    res[k] = f.call(this, o[k], k, o)
  })
  return res
}

export const getOrElse = (x: any, orElse: any) => x ? x : orElse
