// prettier-ignore
type Equals<X, Y> =
    (<T>() => T extends X ? 0 : 1) extends (<T>() => T extends Y ? 0 : 1)
      ? true
      : false;

export type shouldPass = true;
export type shouldFail = false;

export type assert<_ extends true[]> = void;

export type typeChecking<T, U, Expect> = Equals<Equals<T, U>, Expect>;
