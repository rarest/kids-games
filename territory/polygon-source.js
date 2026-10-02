import fast from "polygon-clipping";
import * as precise from "polyclip-ts";
// Normal operations use robust floating-point predicates. Rare degenerate
// output falls back to decimal clipping with sub-pixel coordinate tolerance.
precise.setPrecision(1e-12);
function run(name, args) {
  try {
    return fast[name](...args);
  } catch {
    return precise[name](...args);
  }
}
export const union = (...args) => run("union", args);
export const intersection = (...args) => run("intersection", args);
export const difference = (...args) => run("difference", args);
