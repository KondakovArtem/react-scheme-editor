import { useRef } from "react";
import { useDrag } from "./useDrag";
import { useZoom } from "./useZoom";
import { SchemeEditorOptions } from "../models";

export function useCanvas<T extends HTMLElement>(options: SchemeEditorOptions) {
  const ref = useRef<T | null>(null);
  const { position } = useDrag(ref);
  const { zoom } = useZoom(ref, position);
  return { ref, zoom, position };
}
