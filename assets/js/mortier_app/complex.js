export default class Complex {
  constructor(re, im) {
    this.re = re;
    this.im = im;
  }

  add(z) {
    return new Complex(this.re + z.re, this.im + z.im);
  }

  sub(z) {
    return new Complex(this.re - z.re, this.im - z.im);
  }

  mul(z) {
    return new Complex(
      this.re * z.re - this.im * z.im,
      this.re * z.im + this.im * z.re
    );
  }

  div(z) {
    const d = z.re * z.re + z.im * z.im;
    return new Complex(
      (this.re * z.re + this.im * z.im) / d,
      (this.im * z.re - this.re * z.im) / d
    );
  }

  abs() {
    return Math.hypot(this.re, this.im);
  }
}
