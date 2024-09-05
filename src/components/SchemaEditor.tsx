import {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { SchemaEditorProps } from "../models";

import { SchemaEditorCanvas } from "./SchemaEditorCanvas";
import { RootContext } from "../context/root.context";
import { SelectNodeDispatcher } from "../context/selected.context";

export const SchemaEditor: FC<SchemaEditorProps> = memo((props) => {
  const { onChangeConfig, children } = props;

  const [config, setConfig] = useState(props.config);

  useEffect(() => setConfig(props.config), [props.config]);

  const methodsRef = useRef({
    onChangeConfig,
  });
  Object.assign(methodsRef.current, { onChangeConfig });

  const onSelectRef = useRef(props.onSelect);
  onSelectRef.current = props.onSelect;

  return (
    <RootContext
      selectNode={useCallback<SelectNodeDispatcher>(
        (data) => onSelectRef.current?.(data.ids),
        []
      )}
      methodContext={useMemo(
        () => ({
          onDragEnd: ({ position: canvasPosition }) =>
            methodsRef.current.onChangeConfig?.({ canvasPosition }),
          onChangeConfig: (...args) =>
            methodsRef.current.onChangeConfig?.(...args),
        }),
        []
      )}
      config={config}
    >
      <SchemaEditorCanvas data={props.data}>{children}</SchemaEditorCanvas>
    </RootContext>
  );
});

SchemaEditor.displayName = "SchemaEditor";
