import { FC, PropsWithChildren, useMemo } from "react";
import { EDraggingMode, SchemaEditorConfig } from "../models";
import { ZoomProvider } from "./zoom.context";
import { CanvasPositionProvider } from "./canvasPosition.context";
import {
  ISchemaEditorMethodsContext,
  SchemaEditorMethodsContext,
} from "./editor.methods.context";

import { NodeRectsProvider } from "./rects.context";
import { CanvasSizeProvider } from "./canvasSize.context";
import { DraggingModeProvider } from "./draggingMode.context";
import { SelectedNodeProvider, SelectNodeDispatcher } from "./selected.context";

const RECTS = {};
const DEF_CANVAS_SIZE = { width: 0, height: 0 };

export const RootContext: FC<
  PropsWithChildren<{
    config?: SchemaEditorConfig;
    methodContext: ISchemaEditorMethodsContext;
    selectNode?: SelectNodeDispatcher;
  }>
> = ({ children, config, methodContext, selectNode }) => {
  const selectedNode = useMemo(
    () => config?.selected ?? [],
    [config?.selected]
  );

  return (
    <NodeRectsProvider state={RECTS}>
      <ZoomProvider state={config?.zoom ?? 1}>
        <CanvasPositionProvider state={config?.canvasPosition}>
          <CanvasSizeProvider state={DEF_CANVAS_SIZE}>
            <SchemaEditorMethodsContext.Provider value={methodContext}>
              <DraggingModeProvider state={EDraggingMode.none}>
                <SelectedNodeProvider
                  state={selectedNode}
                  setState={selectNode}
                >
                  {children}
                </SelectedNodeProvider>
              </DraggingModeProvider>
            </SchemaEditorMethodsContext.Provider>
          </CanvasSizeProvider>
        </CanvasPositionProvider>
      </ZoomProvider>
    </NodeRectsProvider>
  );
};
