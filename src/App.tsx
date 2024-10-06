import 'normalize.css';
import { PropsWithChildren, memo, useCallback, useMemo, useState } from 'react';

import { SchemaEditor } from '../lib/components/SchemaEditor';
import { arrows } from '../lib/components/link/arrows';
import { Slot } from '../lib/components/slot/Slot';
import { SlotHandler } from '../lib/components/slot/SlotHandler';
import {
  SchemaEditorConfig,
  SchemaEditorData,
  SchemaEditorNode,
  SchemaEditorNodeLink,
  SchemaEditorNodeLinkArrow,
  SchemaEditorProps,
  TangentDirections,
} from '../lib/models';

import './App.scss';

function generateNodes(count: number) {
  const nodes = [];
  const types = ['simple', 'simple2'];

  for (let i = 0; i < count; i++) {
    const node = {
      id: (i + 1).toString(), // Уникальный ID
      position: {
        x: Math.floor(Math.random() * 1000), // Случайное значение x
        y: Math.floor(Math.random() * 1000), // Случайное значение y
      },
      type: types[Math.floor(Math.random() * types.length)], // Случайный тип
    };

    nodes.push(node);
  }

  return nodes;
}

function generateLinks(count: number): SchemaEditorNodeLink[] {
  const links: SchemaEditorNodeLink[] = [];
  const fromIds = [1, 2, 3, 4, 5];
  const toIds = [6, 7, 8, 9];

  const arrowIds = Object.keys(arrows);

  for (let i = 0; i < count; i++) {
    links.push({
      id: (i + 1).toString(), // Уникальный ID
      from: fromIds[Math.floor(Math.random() * fromIds.length)] + '',
      fromArrow: arrowIds[
        Math.floor(Math.random() * arrowIds.length)
      ] as SchemaEditorNodeLinkArrow,
      toArrow: arrowIds[
        Math.floor(Math.random() * arrowIds.length)
      ] as SchemaEditorNodeLinkArrow,
      to: toIds[Math.floor(Math.random() * toIds.length)] + '',
      points: [],
    });
  }

  return links;
}

const nodes = generateNodes(10);
const links = generateLinks(1);

function App() {}

export default App;
