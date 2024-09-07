import { FC, memo, ReactNode, useEffect, useRef } from "react";
import { useHydrateAtoms } from "jotai/utils";

import { SchemaEditorProps } from "../models";

import { SchemaEditorCanvas } from "./SchemaEditorCanvas";

import { Provider, useSetAtom, WritableAtom } from "jotai";
import { configAtom } from "../context";
import { methodsAtom } from "../context/methods.context";

const AtomsHydrator = ({
  atomValues,
  children,
}: {
  atomValues: [WritableAtom<unknown, [any], unknown>, unknown][];
  children: ReactNode;
}) => {
  useHydrateAtoms(new Map(atomValues));
  return <>{children}</>;
};

export const SchemaEditor: FC<SchemaEditorProps> = ({ children, ...props }) => {
  return (
    <Provider>
      <AtomsHydrator atomValues={[[configAtom, props.config]] as any}>
        <SchemaEditorComponent {...props}>{children}</SchemaEditorComponent>
      </AtomsHydrator>
    </Provider>
  );
};

export const SchemaEditorComponent: FC<SchemaEditorProps> = memo((props) => {
  const { onChangeConfig, children, onSelect } = props;
  debugger;
  const methodsRef = useRef({ onChangeConfig, onSelect });
  Object.assign(methodsRef.current, { onChangeConfig, onSelect });

  const setConfig = useSetAtom(configAtom);
  useEffect(() => setConfig(props?.config), [props?.config, setConfig]);

  const setMethods = useSetAtom(methodsAtom);

  useEffect(() => {
    setMethods({
      onDragEnd: ({ position: canvasPosition }) =>
        methodsRef.current.onChangeConfig?.({ canvasPosition }),
      onChangeConfig: (...args) => methodsRef.current.onChangeConfig?.(...args),
      onSelect,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectRef = useRef(props.onSelect);
  onSelectRef.current = props.onSelect;

  return (
    <SchemaEditorCanvas data={props.data}>{children}</SchemaEditorCanvas>
    // <SchemaEditorMethodsContext.Provider
    //   value={useMemo(
    //     () => ({
    //       onDragEnd: ({ position: canvasPosition }) =>
    //         methodsRef.current.onChangeConfig?.({ canvasPosition }),
    //       onChangeConfig: (...args) =>
    //         methodsRef.current.onChangeConfig?.(...args),
    //       onSelect,
    //     }),
    //     []
    //   )}
    // >

    // </SchemaEditorMethodsContext.Provider>
  );
});

SchemaEditor.displayName = "SchemaEditor";
