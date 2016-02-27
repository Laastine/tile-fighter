/**
  Modief version of https://github.com/boo1ean/mersenne-twister
 */
export class RandomSeed {
  N: number
  M: number
  MATRIX_A: number   /* constant vector a */
  UPPER_MASK: number /* most significant w-r bits */
  LOWER_MASK: number /* least significant r bits */

  mt: number[] /* the array for the state vector */
  mti: number /* mti==N+1 means mt[N] is not initialized */
  constructor(seed: number) {
    this.N = 624
    this.M = 397
    this.MATRIX_A = 0x9908b0df   /* constant vector a */
    this.UPPER_MASK = 0x80000000 /* most significant w-r bits */
    this.LOWER_MASK = 0x7fffffff /* least significant r bits */

    this.mt = new Array(this.N) /* the array for the state vector */
    this.mti=this.N+1 /* mti==N+1 means mt[N] is not initialized */
    this.init_seed(seed)
  }

  init_seed(s: number) {
    this.mt[0] = s >>> 0
    for (this.mti = 1; this.mti < this.N; this.mti++) {
      s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30)
      this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253)
        + this.mti
      /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
      /* In the previous versions, MSBs of the seed affect   */
      /* only MSBs of the array mt[].                        */
      /* 2002/01/09 modified by Makoto Matsumoto             */
      this.mt[this.mti] >>>= 0
      /* for >32 bit machines */
    }
  }

  random() {
    var y: any
    var mag01 = new Array(0x0, this.MATRIX_A)
    /* mag01[x] = x * MATRIX_A  for x=0,1 */

    if (this.mti >= this.N) { /* generate N words at one time */
      var kk: number

      if (this.mti == this.N + 1)  /* if init_seed() has not been called, */
        this.init_seed(5489)
      /* a default initial seed is used */

      for (kk = 0; kk < this.N - this.M; kk++) {
        y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK)
        this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1]
      }
      for (; kk < this.N - 1; kk++) {
        y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK)
        this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1]
      }
      y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK)
      this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1]

      this.mti = 0
    }

    y = this.mt[this.mti++]

    /* Tempering */
    y ^= (y >>> 11)
    y ^= (y << 7) & 0x9d2c5680
    y ^= (y << 15) & 0xefc60000
    y ^= (y >>> 18)

    return y >>> 0
  }
}