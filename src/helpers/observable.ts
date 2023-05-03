export class Observable<T> {
  private callbacks: ((value: T) => void)[] = [];
  private _value: T;

  private emit() {
    for (const cb of this.callbacks) {
      cb(this._value);
    }
  }

  private mkproxy(value: T & object): T {
    for (const key in value) {
      if (typeof value[key] === "object" && value[key] !== null) {
        value[key] = this.mkproxy(value[key] as T & object) as (T & object)[Extract<
          keyof T,
          string
        >];
      }
    }
    return new Proxy(value, {
      set: (target, property, value) => {
        if (typeof value === "object" && value !== null) {
          target[property as keyof T] = this.mkproxy(value) as any;
        } else {
          target[property as keyof T] = value;
        }
        this.emit();
        return true;
      },
    });
  }

  constructor(value: T) {
    if (typeof value === "object" && value !== null) {
      this._value = this.mkproxy(value);
    } else {
      this._value = value;
    }
  }

  public subscribe(cb: (value: T) => void) {
    this.callbacks.push(cb);
    return () => {
      this.callbacks = this.callbacks.filter((x) => x !== cb);
    };
  }

  public get value() {
    return this._value;
  }

  public set value(value: T) {
    if (typeof value === "object" && value !== null) {
      this._value = this.mkproxy(value);
    } else {
      this._value = value;
    }
    this.emit();
  }
}

export class RenderedObservable<T> extends Observable<T> {
  _render: (value: T) => void;
  constructor(value: T, render: (value: T) => void) {
    super(value);
    this._render = render;
    super.subscribe(this._render);
  }
  rerender() {
    this._render(super.value);
  }
}

export default Observable;
