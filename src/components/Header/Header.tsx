import React, { Dispatch, FormEvent, SetStateAction } from 'react';
import cn from 'classnames';

interface Props {
  hasTodos: boolean; // Прапорець, що показує, чи є todos
  addTodo: (event: FormEvent<HTMLFormElement>) => void; // Функція для додавання нового todo
  title: string; // Заголовок нового todo
  setTitle: Dispatch<SetStateAction<string>>; // Функція для зміни заголовка нового todo
  toggleAll: () => void; // Функція для переключення всіх todos
  isToggleVisible: boolean; // Прапорець, що показує, чи видимий переключатель всіх todos
  inputRef: React.RefObject<HTMLInputElement>; // Посилання на елемент введення
}

export const Header: React.FC<Props> = ({
  hasTodos,
  addTodo,
  title,
  setTitle,
  toggleAll,
  isToggleVisible,
  inputRef,
}) => {
  return (
    <header className="todoapp__header">
      {hasTodos && ( //Показує кнопку "Toggle All", якщо є todos
        <button
          type="button"
          className={cn('todoapp__toggle-all', { active: isToggleVisible })} // Додає клас "active", якщо isToggleVisible true
          data-cy="ToggleAllButton" // Для тестування, додатковий атрибут data-cy
          onClick={toggleAll} // Обробник кліку для toggleAll
        />
      )}

      {/* Форма для введення нового todo */}
      <form onSubmit={addTodo}>
        <input
          data-cy="NewTodoField" // Для тестування, додатковий атрибут data-cy
          type="text"
          className="todoapp__new-todo" // Клас CSS для стилізації поля введення
          placeholder="What needs to be done?" // Плейсхолдер для поля введення
          ref={inputRef} // Посилання на елемент введення
          value={title} // Поточне значення заголовка нового todo
          onChange={event => setTitle(event.target.value.trimStart())} // Обробник зміни значення поля введення
        />
      </form>
    </header>
  );
};

Header.displayName = 'header'; // Налаштування властивості displayName для компоненту Header
