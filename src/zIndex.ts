import * as PIXI from "pixi.js";

/**
 * Monkey-patch PIXI.js API
 **/


(function () {
  PIXI.DisplayObject.prototype.depth = 0;

  PIXI.Container.prototype.sortChildrenByDepth = function () {
    this.children.mergeSort(sortByDepth);
  };

  function sortByDepth(a: {depth: number}, b: {depth: number}) {
    let left = a.depth;
    let right = b.depth;
    if (left < right)
      return -1;
    if (left == right)
      return 0;
    else
      return 1;
  }
})();

const p = Array.prototype as any;

p.mergeSort = mergeSort;
p.bubbleSort = bubbleSort;
p.shuffle = shuffle;
p.swap = swap;

function shuffle() {
  const o = this;
  for (let j: number, x: number, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

function swap(a: number, b: number) {
  const o = this;
  const temp = o[a];
  o[a] = o[b];
  o[b] = temp;
  return o;
}

function bubbleSort(compare: (a: number, b: number) => number) {
  const a = this;
  let swapped: boolean;
  do {
    swapped = false;
    for (let i = 0; i < a.length - 1; i++) {
      if (compare(a[i], a[i + 1]) > 0) {
        let temp = a[i];
        a[i] = a[i + 1];
        a[i + 1] = temp;
        swapped = true;
      }
    }
  } while (swapped);
}

function mergeSort(compare: (a: number, b: number) => number) {
  const items = this;

  if (items.length < 2) {
    return items;
  }

  const middle = Math.floor(items.length / 2),
    left = items.slice(0, middle),
    right = items.slice(middle),
    params = merge(left.mergeSort(compare), right.mergeSort(compare), compare);

  // Add the arguments to replace everything between 0 and last item in the array
  params.unshift(0, items.length);
  items.splice.apply(items, params);
  return items;
}

function merge(left: number[], right: number[], compare: (a: number, b: number) => number) {
  const result: number[] = []
  let il = 0
  let ir = 0

  while (il < left.length && ir < right.length) {
    if (compare(left[il], right[ir]) < 0) {
      result.push(left[il++]);
    } else {
      result.push(right[ir++]);
    }
  }

  return result.concat(left.slice(il)).concat(right.slice(ir));
}
