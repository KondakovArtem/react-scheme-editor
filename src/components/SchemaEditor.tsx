import { FC, memo, ReactNode, useEffect, useRef } from "react";
import { useHydrateAtoms } from "jotai/utils";

import { SchemaEditorProps } from "../models";

import { SchemaEditorCanvas } from "./SchemaEditorCanvas";

import { Provider, useAtom, useSetAtom, WritableAtom } from "jotai";
import { configAtom } from "../context";
import { methodsAtom } from "../context/methods.context";
import { dataAtom } from "../context/data.context";

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
      <AtomsHydrator
        atomValues={[
          [configAtom, props.config],
          [dataAtom, props.data],
        ]}
      >
        <SchemaEditorComponent {...props}>{children}</SchemaEditorComponent>
      </AtomsHydrator>
    </Provider>
  );
};

export const SchemaEditorComponent: FC<SchemaEditorProps> = memo((props) => {
  const { onChangeConfig, children, onSelect, onChangeData } = props;
  const methodsRef = useRef({ onChangeConfig, onSelect });
  Object.assign(methodsRef.current, { onChangeConfig, onSelect });

  const setConfig = useSetAtom(configAtom);
  useEffect(() => setConfig(props?.config), [props?.config, setConfig]);
  const [data, setData] = useAtom(dataAtom);
  useEffect(() => setData(props?.data), [props?.data, setData]);

  const setMethods = useSetAtom(methodsAtom);

  useEffect(() => {
    setMethods({
      onDragEnd: ({ position: canvasPosition }) =>
        methodsRef.current.onChangeConfig?.({ canvasPosition }),
      onChangeConfig: (...args) => methodsRef.current.onChangeConfig?.(...args),
      onSelect,
      onChangeData,
    });
  }, [onSelect, setMethods, onChangeData]);

  return <SchemaEditorCanvas data={data}>{children}</SchemaEditorCanvas>;
});

SchemaEditor.displayName = "SchemaEditor";
