import React, {
  FC,
  forwardRef,
  MutableRefObject,
  PropsWithChildren,
  useEffect,
} from "react";

interface DraggerProps extends PropsWithChildren {
  //   target?: MutableRefObject<null>;
}

export const Dragger = forwardRef<HTMLElement, DraggerProps>((props, ref) => {
  console.log("render dragger");

  useEffect(() => {
    console.log("useEffect dragger");
    debugger;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ref;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    props;
  }, [(ref as any)?.current]);

  return <>{props.children}</>;
});
