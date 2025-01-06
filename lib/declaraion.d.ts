declare module '*.module.css';
declare module '*.module.scss';
declare module '*.svg';
declare module '*.svg?raw';
declare module '*.svg?react' {
  import * as React from 'react';

  const ReactComponent: React.FunctionComponent<
    React.ComponentProps<'svg'> & { title?: string }
  >;

  export default ReactComponent;
}

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
