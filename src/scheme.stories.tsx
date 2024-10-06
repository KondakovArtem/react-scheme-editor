import type { Meta, StoryObj } from '@storybook/react';
import { SchemaEditor } from 'lib/components/SchemaEditor';
import { arrows } from 'lib/components/link/arrows';
import { Slot } from 'lib/components/slot/Slot';
import { SlotHandler } from 'lib/components/slot/SlotHandler';
import {
  SchemaEditorConfig,
  SchemaEditorData,
  SchemaEditorNode,
  SchemaEditorNodeLink,
  SchemaEditorNodeLinkArrow,
  SchemaEditorNodeSlot,
  SchemaEditorProps,
  TangentDirections,
} from 'lib/models';
import { PropsWithChildren, memo, useCallback, useMemo, useState } from 'react';

import st from './Style.module.scss';

type Story = StoryObj<typeof SchemaEditor>;

export default {
  title: 'Schema Editor/Default',
  component: SchemaEditor,
  // tags: ['autodocs'],
} as Meta<typeof SchemaEditor>;

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

const test = {
  nodes: [
    {
      id: '44158027-f3fb-4702-a582-aec35380cd77',
      position: {
        x: 50,
        y: 50,
      },
      size: {
        width: 300,
        height: 200,
      },
      type: 'simple',
      slots: [
        {
          id: '44158027-f3fb-4702-a582-aec35380cd77.slot_1',
          direction: {
            in: [TangentDirections.LEFT],
            out: [TangentDirections.RIGHT],
          },
          visualDirection: 'right',
          data: {
            title: 'Slot 1',
          },
        },
        {
          id: '44158027-f3fb-4702-a582-aec35380cd77.slot_2',
          direction: 'in',
          visualDirection: 'right',
          data: {
            title: 'Slot 2',
          },
        },
        {
          id: '44158027-f3fb-4702-a582-aec35380cd77.slot_3',
          direction: 'out',
          visualDirection: 'right',
          data: {
            title: 'Slot 3',
          },
        },
      ],
      data: {
        name: 'QueryDatabaseTable',
      },
    },
    {
      id: '867b169e-6215-4d5d-9068-134608ee4c12',
      position: {
        x: 220,
        y: 418,
      },
      type: 'simple2',
      slots: [
        {
          id: '867b169e-6215-4d5d-9068-134608ee4c12.slot_1',
          direction: {
            in: [TangentDirections.LEFT],
            out: [TangentDirections.RIGHT],
          },
          data: {
            title: 'Slot 1',
          },
        },
      ],
      data: {
        name: 'SplitJson',
      },
    },
  ],
  links: [
    {
      id: '86b8f7ec-8632-4f0b-a44c-c8a4b9f34bee',
      points: [{ x: 100, y: 100 }],
      title: '',
      from: '44158027-f3fb-4702-a582-aec35380cd77',
      to: '867b169e-6215-4d5d-9068-134608ee4c12.slot_1',
      lineColor: '#9090FF',
      lineColorActive: '#FF9090',
      lineType: 'dashed',
      fromArrow: 'arrowMany',
    },
    // {
    //   id: "97d857ac-c62f-4742-ae97-d490524bf0e2",
    //   points: [],
    //   title: "",
    //   from: "867b169e-6215-4d5d-9068-134608ee4c12",
    //   to: "44158027-f3fb-4702-a582-aec35380cd77.slot_1",
    //   lineColor: "var(--success-default)",
    // },
  ],
} as SchemaEditorData;

export const Default: Story = {
  render: () => {
    const [config, setConfig] = useState<SchemaEditorConfig>({
      canvasPosition: { x: 100, y: 100 },
      zoom: 0.2,
      showNavigator: false,
    });

    const [data, setData] = useState<SchemaEditorData>(
      test as SchemaEditorData,
      //   {
      //   nodes,
      //   links,
      // }
    );

    const [text, setText] = useState('test');

    // const selected = useMemo(() => config?.selected, [config?.selected]);

    return (
      <div className="App">
        <button onClick={() => setData({ nodes: generateNodes(1000) })}>
          Random
        </button>
        <button
          onClick={() =>
            setConfig((o) => ({ ...o, showNavigator: !o.showNavigator }))
          }
        >
          Toggle Map
        </button>
        <div style={{ width: '1000px', height: '600px', position: 'relative' }}>
          <div style={{ fontSize: '8px' }}>{JSON.stringify(config)}</div>
          <button onClick={() => setText(text + 'bla')}>{text}</button>
          <SchemaEditor
            data={data}
            config={config}
            onChangeConfig={useCallback<
              NonNullable<SchemaEditorProps['onChangeConfig']>
            >(
              (c: Partial<SchemaEditorConfig>) =>
                setConfig((o) => ({ ...o, ...c })),
              [],
            )}
            onSelect={useCallback<NonNullable<SchemaEditorProps['onSelect']>>(
              (selected) => setConfig((c) => ({ ...c, selected })),
              [],
            )}
            onChangeData={useCallback<
              NonNullable<SchemaEditorProps['onChangeData']>
            >((data) => setData((d) => ({ ...d, ...data })), [])}
            onAddLink={useCallback<NonNullable<SchemaEditorProps['onAddLink']>>(
              (data) =>
                setData((d) => {
                  debugger;
                  return {
                    ...d,
                    links: [
                      ...(d.links ?? []),
                      {
                        id: `${Math.random()}`,
                        ...data,
                        points: [],
                      },
                    ],
                  };

                  // ...d, ...data
                }),
              [],
            )}
          >
            {useMemo(
              () => (data, selected) => (
                <SampleNode
                  data={data}
                  selected={!!selected}
                  setText={setText}
                  text={text}
                />
              ),
              [text],
            )}
          </SchemaEditor>
        </div>
      </div>
    );
  },
};

const SampleNode = memo(
  ({
    data,
    text,
    setText,
  }: {
    data: SchemaEditorNode;
    selected?: boolean;
    text: string;
    setText(v: string): void;
  } & PropsWithChildren) => {
    console.log(`render simple ${data.id}`);

    const { inSlots, outSlots } = useMemo(() => {
      return (data.slots ?? []).reduce(
        (pre, slot) => {
          if (slot.direction?.in) {
            pre.inSlots.push(slot);
          } else if (slot.direction?.out) {
            pre.outSlots.push(slot);
          }
          return pre;
        },
        {
          inSlots: [] as SchemaEditorNodeSlot[],
          outSlots: [] as SchemaEditorNodeSlot[],
        },
      );
    }, [data.slots]);

    return (
      <div>
        <button onClick={() => setText(text + 'bla')}>{text}</button>
        {data.type === 'simple' && <div>simple={data.id}</div>}
        {data.type === 'simple2' && <div>simple2={data.id}</div>}
        {/* <div>sample selected={selected + ""}</div> */}
        <div className={st.slotContainer}>
          <div>
            {inSlots.map((slot) => {
              return (
                <Slot key={slot.id} data={slot}>
                  <div className={st.inSlot}></div>
                </Slot>
              );
            })}
          </div>
          <div>
            {outSlots.map((slot) => {
              return (
                <Slot key={slot.id} data={slot}>
                  <div className={st.outSlot}></div>
                </Slot>
              );
            })}
            <SlotHandler id={data.id}>
              <div className={st.outSlot}></div>
            </SlotHandler>
          </div>
        </div>
      </div>
    );
  },
);
SampleNode.displayName = 'SampleNode';
