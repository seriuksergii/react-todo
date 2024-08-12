import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import cn from 'classnames';

import { USER_ID, todoService } from './api/todos';
import { UserWarning } from './UserWarning';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';

import { Status } from './types/statusTypes';
import { Todo } from './types/Todo';
import { Errors } from './types/errors';

export const App: FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [errorMessage, setErrorMessage] = useState(Errors.DEFAULT);
  const [filter, setFilter] = useState(Status.All);
  const [idsProccesing, setIdsProccesing] = useState<number[]>([]);

  const ref = useRef<HTMLInputElement | null>(null);

  // Запит на сервер за списком todos при завантаженні компонента
  useEffect(() => {
    ref.current?.focus(); // Фокус на полі введення після завантаження

    todoService
      .getTodos()
      .then(setTodos) // Оновлення стану todos з отриманими даними
      .catch(() => setErrorMessage(Errors.LOAD)); // Виведення помилки при невдалому запиті
  }, []);

  // Обробка помилок: автоматичне видалення повідомлення про помилку через 3 секунди
  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timeout = setTimeout(() => setErrorMessage(Errors.DEFAULT), 3000);

    return () => clearTimeout(timeout);
  }, [errorMessage]);

  // Фільтрація todos відповідно до вибраного статусу (активні, завершені або всі)
  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  const getVisibleTodos = () => {
    if (filter === Status.Active) {
      return activeTodos;
    } else if (filter === Status.Completed) {
      return completedTodos;
    } else {
      return todos;
    }
  };

  // Додавання нового todo
  const handleAddTodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setErrorMessage(Errors.TITLE); // Показ помилки, якщо поле введення порожнє

      return;
    }

    if (ref.current) {
      ref.current.disabled = true; // Вимкнення поля введення під час додавання todo
    }

    const newTodo = {
      title: normalizedTitle,
      userId: USER_ID,
      completed: false,
    };

    setTempTodo({ ...newTodo, id: 0 }); // Відображення тимчасового todo перед підтвердженням додавання

    todoService
      .handleAddTodo(newTodo)
      .then((resTodo: Todo) => {
        setTodos(currentTodos => [...currentTodos, resTodo]); // Додавання нового todo в список
        setTitle(''); // Очистка поля введення
      })
      .catch(() => {
        setErrorMessage(Errors.ADD); // Обробка помилки додавання todo
      })
      .finally(() => {
        if (ref.current) {
          ref.current.disabled = false; // Увімкнення поля введення після завершення операції
        }

        setTempTodo(null); //Скасування відображення тимчасового todo
        ref.current?.focus(); // Повернення фокусу на поле введення
      });
  };

  // Видалення todo за її id
  const onDelete = (todoId: number) => {
    setIdsProccesing(current => [...current, todoId]); // Додавання id todo до списку оброблених

    todoService
      .onDelete(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        ); // Видалення todo зі списку після успішного видалення на сервері
      })
      .catch(() => {
        setErrorMessage(Errors.DELETE); // Обробка помилки видалення todo
      })
      .finally(() => {
        setIdsProccesing(current => current.filter(id => id !== todoId)); // Видалення id todo зі списку оброблених
        ref.current?.focus(); // Повернення фокусу на поле введення
      });
  };

  // Очищення завершених todos
  const onClear = () => {
    completedTodos.forEach(todo => onDelete(todo.id)); // Видалення кожної завершеної todo
  };

  // Перемикання стану todo (активна/завершена)
  const onToggle = (todo: Todo) => {
    setIdsProccesing(current => [...current, todo.id]); // Додавання id todo до списку оброблених

    todoService
      .updateTodo({ ...todo, completed: !todo.completed })
      .then(updatedTodo => {
        setTodos(currentTodos =>
          currentTodos.map(currentTodo =>
            currentTodo.id === updatedTodo.id ? updatedTodo : currentTodo,
          ),
        ); // Оновлення todo після успішного оновлення на сервері
      })
      .catch(() => setErrorMessage(Errors.UPDATE)) //Обробка помилки оновлення todo
      .finally(() => {
        setIdsProccesing(current => current.filter(id => id !== todo.id)); // Видалення id todo зі списку оброблених
      });
  };

  // Перейменування todo
  const onRename = (todo: Todo) => {
    setIdsProccesing(current => [...current, todo.id]); // Додавання id todo до списку оброблених

    return todoService
      .updateTodo({ ...todo })
      .then(updatedTodo => {
        setTodos(currentTodos =>
          currentTodos.map(currentTodo =>
            currentTodo.id === updatedTodo.id ? updatedTodo : currentTodo,
          ),
        ); // Оновлення todo після успішного оновлення на сервері
      })
      .catch(() => {
        setErrorMessage(Errors.UPDATE); // Обробка помилки оновлення todo
        throw new Error();
      });
  };

  // Перемикання стану всіх todos
  const updateAllToggleStatus = () => {
    if (activeTodos.length) {
      activeTodos.forEach(onToggle); // Позначення всіх активних todos як завершені
    } else {
      completedTodos.forEach(onToggle); // Позначення всіх завершених todos як активні
    }
  };

  // Визначення видимості кнопки переключення стану всіх todos
  const isToggleVisible = !activeTodos.length;

  // Перевірка, чи є користувач залогований
  if (!USER_ID) {
    return <UserWarning />; // Відображення повідомлення про необхідність увійти в систему
  }

  // Відображення заголовку, форми введення нового todo, списку todos та футера з фільтрами
  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          hasTodos={!!todos.length}
          addTodo={handleAddTodo}
          title={title}
          setTitle={setTitle}
          toggleAll={updateAllToggleStatus}
          isToggleVisible={isToggleVisible}
          inputRef={ref}
        />

        <TodoList
          todos={getVisibleTodos()}
          filter={filter}
          onDelete={onDelete}
          onToggle={onToggle}
          tempTodo={tempTodo}
          idsProccesing={idsProccesing}
          onRename={onRename}
          setIdsProccesing={setIdsProccesing}
        />

        {todos.length > 0 && (
          <Footer
            activeTodosCount={activeTodos.length}
            filter={filter}
            setFilter={setFilter}
            onClear={onClear}
            canClearAllVisible={!!completedTodos.length}
          />
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={cn(
          'notification',
          'is-danger',
          'is-light',
          'has-text-weight-normal',
          { hidden: !errorMessage },
        )}
      >
        <button data-cy="HideErrorButton" type="button" className="delete" />
        {errorMessage}
      </div>
    </div>
  );
};
