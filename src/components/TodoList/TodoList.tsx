import { Dispatch, FC } from 'react';

import { TodoItem } from '../TodoItem/TodoItem';

import { Status } from '../../types/statusTypes';
import { Todo } from '../../types/Todo';

interface Props {
  todos: Todo[]; // Масив всіх todos для відображення
  filter: Status; // Поточний фільтр для todos (Active, Completed, All)
  onDelete: (todoId: number) => void; // Функція видалення todo за його ідентифікатором
  onToggle: (todo: Todo) => void; // Функція зміни статусу todo (виконано/не виконано)
  tempTodo: Todo | null; // Тимчасове todo для відображення, наприклад, при додаванні нового todo
  idsProccesing: number[]; // Масив ідентифікаторів todos, які знаходяться в процесі обробки (наприклад, завантаження або оновлення)
  onRename: (todo: Todo) => Promise<void>; // Асинхронна функція для зміни назви todo
  setIdsProccesing: Dispatch<React.SetStateAction<number[]>>; // Функція для зміни масиву ідентифікаторів todos в процесі обробки
}

export const TodoList: FC<Props> = ({
  todos,
  onDelete,
  onToggle,
  tempTodo,
  idsProccesing,
  onRename,
  setIdsProccesing,
}) => {
  return (
    //Основний блок списку todos
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(
        (
          todo, //Проходження по масиву todos і відображення кожного елемента
        ) => (
          <TodoItem
            key={todo.id} // Ключ для ефективності React
            todo={todo} // Передача todo в компонент TodoItem
            onDelete={onDelete} // Передача функції видалення todo в компонент TodoItem
            onToggle={onToggle} // Передача функції зміни статусу todo в компонент TodoItem
            isLoading={idsProccesing.includes(todo.id)} // Прапорець для показу завантаження todo
            onRename={onRename} // Передача функції зміни назви todo в компонент TodoItem
            setIdsProccesing={setIdsProccesing} // Передача функції для зміни масиву ідентифікаторів в процесі обробки
          />
        ),
      )}
      {tempTodo && <TodoItem todo={tempTodo} isLoading={true} />}
    </section> // Відображення тимчасового todo, якщо він є
  );
};
