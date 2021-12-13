export type Equals<X, Y> = [X] extends [Y]
  ? [Y] extends [X]
    ? true
    : false
  : false;

export type shouldPass = true;
export type shouldFail = false;

export type assert<_ extends true[]> = void;

export type typeChecking<T, U, Expect extends true | false> = Equals<
  T,
  U
> extends Expect
  ? true
  : false;
