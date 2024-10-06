import { useAtomValue, atom } from "jotai";
import { useMemo } from "react";
// import { dragPositionAtom } from "../context/dragNodePosition.context";
import { nodeRectsAtom } from "../context/rects.context";
import {
  SchemaEditorData,
  SchemaEditorNodeSlotDirection,
  SlotRect,
  TangentDirections,
} from "../models";
import { dataAtom } from "../context/data.context";
import { useSelectAtomValue } from "../utils/atom.selector";

export function usePosition(id: string) {
  return useSelectAtomValue(nodeRectsAtom, (rects) => rects?.[id], [id]);
}

function findSlotById(data: SchemaEditorData | undefined, targetId: string) {
  // Проверяем, есть ли nodes в дереве
  if (!data?.nodes || !Array.isArray(data.nodes)) {
    return null; // Возвращаем null, если nodes нет
  }
  // Рекурсивная функция для поиска по nodes
  for (const node of data.nodes) {
    if (node.id === targetId) {
      return node; // Возвращаем узел, если найдено совпадение
    }
    // Если у узла есть слоты, проверяем их
    const foundInSlots = node?.slots?.find((slot) => slot.id === targetId);
    if (foundInSlots) {
      return foundInSlots; // Возвращаем слот, если найдено совпадение
    }
  }
  return null; // Возвращаем null, если ничего не найдено
}

const DEF_DIRECTIONS = [TangentDirections.AUTO];

export function useSlotPosition(
  id: string | undefined,
  direction: SchemaEditorNodeSlotDirection
) {
  const slot = useAtomValue(
    useMemo(
      () =>
        atom((get) => {
          if (!id) return undefined;
          const slot = findSlotById(get(dataAtom), id);
          const directions =
            slot?.direction?.[direction] ??
            slot?.direction?.all ??
            DEF_DIRECTIONS;
          const nodeRect = get(nodeRectsAtom)?.[id];
          let result = nodeRect;
          if (
            result?.height === undefined ||
            result?.width === undefined ||
            result?.x === undefined ||
            result?.y === undefined
          ) {
            return undefined;
          }
          return { ...result, directions } as SlotRect;
        }),
      [id, direction]
    )
  );

  return useMemo(
    () => slot,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slot?.directions, slot?.height, slot?.width, slot?.x, slot?.y]
  );
}
