/**
 * Minimal dense linear algebra for the recipe solver.
 * Small systems (a handful of fertilizers x a handful of elements), so a plain
 * Gaussian-elimination least-squares solve is more than adequate.
 */

export type Matrix = number[][]; // row-major
export type Vector = number[];

export function matVec(A: Matrix, x: Vector): Vector {
  return A.map((row) => row.reduce((s, a, j) => s + a * x[j], 0));
}

export function transpose(A: Matrix): Matrix {
  if (A.length === 0) return [];
  return A[0].map((_, j) => A.map((row) => row[j]));
}

/** A^T · A  (n x n) for an m x n matrix A. */
export function normalMatrix(A: Matrix): Matrix {
  const At = transpose(A);
  const n = At.length;
  const out: Matrix = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let k = 0; k < A.length; k++) s += A[k][i] * A[k][j];
      out[i][j] = s;
    }
  }
  return out;
}

/** A^T · b (length n). */
export function normalVector(A: Matrix, b: Vector): Vector {
  const At = transpose(A);
  return At.map((row) => row.reduce((s, a, k) => s + a * b[k], 0));
}

/**
 * Solve a symmetric positive (semi-)definite system M x = c by Gaussian
 * elimination with partial pivoting. Returns null if singular.
 */
export function solveSPD(M: Matrix, c: Vector): Vector | null {
  const n = M.length;
  // augmented copy
  const A: Matrix = M.map((row, i) => [...row, c[i]]);
  for (let col = 0; col < n; col++) {
    // pivot
    let piv = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
    }
    if (Math.abs(A[piv][col]) < 1e-12) return null;
    [A[col], A[piv]] = [A[piv], A[col]];
    // eliminate
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = A[r][col] / A[col][col];
      if (f === 0) continue;
      for (let k = col; k <= n; k++) A[r][k] -= f * A[col][k];
    }
  }
  return A.map((row, i) => row[n] / A[i][i]);
}

/** Least-squares solution of A x = b via the normal equations. */
export function lstsq(A: Matrix, b: Vector): Vector | null {
  if (A.length === 0 || A[0].length === 0) return [];
  return solveSPD(normalMatrix(A), normalVector(A, b));
}

/** Extract the columns of A indexed by `cols`, preserving row order. */
export function selectColumns(A: Matrix, cols: number[]): Matrix {
  return A.map((row) => cols.map((j) => row[j]));
}
