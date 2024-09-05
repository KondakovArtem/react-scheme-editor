import {
  createContext,
  MutableRefObject,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/** Фабрика для генерации контекстов состояния и диспетчера
 *
 * createStateContextFactory: Функция, которая создает и возвращает провайдер и хуки для управления состоянием.
 * Принимает имя и опциональную функцию setter, которая определяет, как обновлять состояние.
 *
 * StateContext и DispatchContext: Два контекста, созданные с помощью createContext. Первый хранит текущее состояние,
 * второй — функцию для его изменения.
 *
 * Provider: Компонент, который предоставляет дочерним элементам доступ к состоянию и функции изменения состояния.
 * Использует useState для управления локальным состоянием и useEffect для синхронизации с пропсами. useMemo
 * используется для оптимизации функции изменения состояния.
 *
 * useStateContext и useDispatchContext: Хуки, которые возвращают текущее состояние и функцию изменения состояния соответственно.
 * Если они вызываются вне соответствующих провайдеров, выбрасывается ошибка.
 *
 */
export function createStateContextFactory<
  State,
  Setter = (s: Partial<State> | State | undefined) => void
>(
  name: string,
  setter?: (
    o: Partial<State> | undefined,
    c: Partial<State> | undefined
  ) => State | undefined
) {
  // Создаем контекст для хранения состояния
  const StateContext = createContext<State | undefined>(undefined);
  StateContext.displayName = `${name}StateContext`;

  // Создаем контекст для хранения функции изменения состояния
  const DispatchContext = createContext<Setter | undefined>(undefined);
  DispatchContext.displayName = `${name}DispatchContext`;

  let stateRef: { current?: Partial<State> } = {};
  // Компонент-провайдер, который предоставляет состояние и функцию изменения состояния
  const Provider = (
    props: PropsWithChildren<{
      state: State | undefined;
      setState?: Setter;
    }>
  ) => {
    // Локальное состояние, инициализируемое из пропсов
    const [state, setState] = useState<Partial<State> | undefined>(props.state);

    // Обновляем локальное состояние, если изменяются пропсы
    useEffect(() => setState(props.state), [props.state]);
    stateRef.current = state;
    // Мемоизированная функция для установки состояния с использованием переданного setter
    const setterState = useMemo(
      () => (curState: Partial<State> | State | undefined) =>
        setState(
          (preState) => setter?.(preState, curState) ?? (curState as State)
        ),
      []
    );

    const { children } = props;
    return (
      // Предоставляем состояние через StateContext
      <StateContext.Provider value={state as State}>
        {/* Предоставляем функцию изменения состояния через DispatchContext */}
        <DispatchContext.Provider
          value={props.setState ?? (setterState as Setter)}
        >
          {children}
        </DispatchContext.Provider>
      </StateContext.Provider>
    );
  };

  return {
    // Возвращаем компонент-провайдер и хуки для доступа к контекстам
    Provider,
    useStateContext: () => {
      const context = useContext(StateContext);
      if (context === undefined) {
        throw new Error(
          `useStateContext must be used within a ${StateContext.displayName}`
        );
      }
      return context;
    },
    useGetStateRef: () => stateRef as MutableRefObject<State>,
    useDispatchContext() {
      const context = useContext(DispatchContext);
      if (context === undefined) {
        throw new Error(
          `use${name}DispatchContext must be used within a ${DispatchContext.displayName}`
        );
      }
      return context;
    },
  };
}
