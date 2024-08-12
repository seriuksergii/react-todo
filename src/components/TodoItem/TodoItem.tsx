/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { Dispatch, FC, FormEvent, SetStateAction, useState } from 'react'; // Імпорт необхідних бібліотек React
import classNames from 'classnames'; // Імпорт бібліотеки для генерації класів CSS

import { Todo } from '../../types/Todo'; // Імпорт типу Todo

interface Props {
  todo: Todo; // Об'єкт todo, який відображатиметься
  onDelete?: (todoId: number) => void; // Опціональна функція для видалення todo за її ідентифікатором
  onToggle?: (todo: Todo) => void; // Опціональна функція для зміни статусу todo (виконано/не виконано)
  isLoading: boolean; // Прапорець, що показує, чи триває завантаження для todo
  onRename?: (todo: Todo) => Promise<void>; // Опціональна асинхронна функція для зміни назви todo
  setIdsProccesing?: Dispatch<SetStateAction<number[]>>; // Опціональна функція для зміни масиву ідентифікаторів в процесі обробки
}

export const TodoItem: FC<Props> = ({
  todo,
  onDelete,
  onToggle,
  isLoading,
  onRename,
  setIdsProccesing,
}) => {
  const [isRenaming, setIsRenaming] = useState(false); // Стан для відображення режиму редагування назви todo
  const [newTitle, setNewTitle] = useState(''); // Стан для збереження нової назви todo

  // Функція для обробки події відправки форми при редагуванні назви todo
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedNewTitle = newTitle.trim();

    // Якщо нова назва дорівнює поточній, завершити редагування
    if (trimmedNewTitle === todo.title) {
      setIsRenaming(false);

      return;
    }

    // Якщо нова назва порожня, викликати функцію видалення todo
    if (!trimmedNewTitle) {
      onDelete?.(todo.id);

      return;
    }

    // Викликати функцію для зміни назви todo з новою назвою
    onRename?.({ ...todo, title: trimmedNewTitle })
      ?.then(() => setIsRenaming(false)) // При успішній зміні назви закрити режим редагування
      .catch(() => {}) // Обробка помилки при зміні назви (не реалізовано в даному прикладі)
      .finally(() => {
        setIdsProccesing?.(current => current.filter(id => id !== todo.id)); // Видалення ідентифікатора todo з масиву обробки
      });
  };

  const { id, completed, title } = todo; // Деструктуризація todo на окремі поля

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', {
        completed: completed,
      })}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={completed}
          onChange={() => onToggle?.(todo)} // Обробка зміни статусу todo
        />
      </label>

      {isRenaming ? ( // Відображення форми для редагування назви todo, якщо активовано режим редагування
        <form
          onSubmit={handleSubmit}
          onBlur={handleSubmit} // Обробка виходу з фокусу поля вводу
          onKeyUp={e => (e.key === 'Escape' ? setIsRenaming(false) : '')} // Обробка клавіші Escape для виходу з режиму редагування
        >
          <input
            autoFocus
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={newTitle}
            onChange={event => setNewTitle(event.target.value)} // Обробка зміни значення поля вводу
          />
        </form>
      ) : (
        <>
          {' '}
          {/* Відображення назви todo і кнопки видалення, якщо режим редагування не активовано */}
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => {
              // Обробка подвійного кліку для активації режиму редагування
              setNewTitle(title); // Встановлення поточної назви todo в поле редагування
              setIsRenaming(true); // Активація режиму редагування
            }}
          >
            {title}
          </span>
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => onDelete?.(id)} // Обробка кліку на кнопку видалення todo
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={`modal overlay ${isLoading && 'is-active'}`} // Показ модального вікна з завантаженням, якщо todo в процесі обробки
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
