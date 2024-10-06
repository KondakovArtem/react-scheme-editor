import { FC, memo, ReactNode, useEffect, useRef } from "react";
import { useHydrateAtoms } from "jotai/utils";

import { SchemaEditorProps } from "../models";

import { SchemaEditorCanvas } from "./SchemaEditorCanvas";

import {
  Provider,
  useAtom,
  useAtomValue,
  useSetAtom,
  WritableAtom,
} from "jotai";
import { configAtom } from "../context";
import { methodsAtom } from "../context/methods.context";
import { dataAtom } from "../context/data.context";
import { draftLinkAtom } from "../context/dragNodePosition.context";

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
  const { onChangeConfig, children, onSelect, onChangeData, onAddLink } = props;
  const methodsRef = useRef({ onChangeConfig });
  Object.assign(methodsRef.current, { onChangeConfig });

  const setConfig = useSetAtom(configAtom);
  useEffect(() => setConfig(props?.config), [props?.config, setConfig]);
  const [data, setData] = useAtom(dataAtom);
  useEffect(() => setData(props?.data), [props?.data, setData]);

  const setMethods = useSetAtom(methodsAtom);

  useEffect(() => {
    setMethods({
      onDragEnd: ({ position: canvasPosition }) =>
        methodsRef.current.onChangeConfig?.({ canvasPosition }),
      onChangeConfig,
      onSelect,
      onChangeData,
      onAddLink,
    });
  }, [onSelect, setMethods, onChangeData, onChangeConfig, onAddLink]);

  const draftLink = useAtomValue(draftLinkAtom);

  return (
    <>
      <SchemaEditorCanvas data={data}>{children}</SchemaEditorCanvas>
      <div>
        <pre style={{ fontSize: "8px", textAlign: "left" }}>
          {JSON.stringify(draftLink, null, "\t")}
        </pre>
      </div>
      {/* <div>
        <pre style={{ fontSize: "8px", textAlign: "left" }}>
          {JSON.stringify(nodeRects, null, "\t")}
        </pre>
      </div>
      <div>
        <pre style={{ fontSize: "8px" }}>
          {JSON.stringify(dragPosition, null, "\t")}
        </pre>
      </div> */}
    </>
  );
});

SchemaEditor.displayName = "SchemaEditor";
