export type Action<T> =
  | {
      op: 'clear';
    }
  | {
      op: 'set';
      with: T;
    }
  | {
      op: 'update';
      with: Partial<T>;
    }
  | {
      op: 'setProp';
      with: {
        prop: keyof T;
        value: T[keyof T];
      };
    };
