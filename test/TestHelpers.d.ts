export type Equals<X, Y> = X extends Y ? (Y extends X ? true : false) : false;

type T = Equals<number, number>;

export type shouldPass = true;
export type shouldFail = false;

export type assert<_ extends true[]> = void;

export type typeChecking<T, U, Expect extends boolean> = Equals<
  Equals<T, U>,
  Expect
>;
