import {
  useState,
  useEffect,
  useRef,
} from 'react';
import cn from 'classnames';
import { Todo } from '../types/Todo';
import { deleteTodo, updateTodo } from '../api/todos';
import { useTodoContext } from '../contexts/TodoContext';

type Props = {
  todo: Todo;
  isCreating?: boolean;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  isCreating,
}) => {
  const { todos, setTodos, setError } = useTodoContext();
  const [isEditing, setIsTitleEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [todoTitle, setTodoTitle] = useState(todo.title);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleDelete = (id: number) => {
    setIsLoading(true);

    deleteTodo(todo.id)
      .then(() => {
        setTodos(todos.filter((currentTodo) => currentTodo.id !== id));
      })
      .catch(() => {
        setError('Unable to delete a todo');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleUpdateTodo = (updatedTodo: Todo) => {
    setIsLoading(true);

    updateTodo(updatedTodo)
      .then((successUpdatedTodo) => {
        setTodos(todos.map((currentTodo) => (
          currentTodo.id === successUpdatedTodo.id
            ? successUpdatedTodo
            : currentTodo
        )));
      })
      .catch(() => {
        setError('Unable to update a todo');
      })
      .finally(() => {
        setIsTitleEditing(false);
        setIsLoading(false);
      });
  };

  const updateCheckbox = (completed: boolean) => {
    setIsLoading(true);

    const updatedTodo = {
      ...todo,
      completed,
    };

    handleUpdateTodo(updatedTodo);
  };

  const todoEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!todo.title.trim()) {
      handleDelete(todo.id);
    } else {
      const updatedTodo = {
        ...todo,
        title: todoTitle,
      };

      handleUpdateTodo(updatedTodo);
    }
  };

  return (
    <div className={cn('todo', { completed: todo.completed })}>
      <label className="todo__status-label">
        <input
          type="checkbox"
          className="todo__status"
          value={todo.title}
          checked={todo.completed}
          onClick={() => updateCheckbox(!todo.completed)}
          ref={inputRef}
        />
      </label>
      {isEditing ? (
        <form onSubmit={todoEditSubmit}>
          <input
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={todoTitle}
            onChange={(event) => setTodoTitle(event.target.value)}
            onBlur={() => setIsTitleEditing(false)}
            ref={inputRef}
          />
        </form>
      ) : (
        <>
          <span
            className="todo__title"
            onDoubleClick={() => setIsTitleEditing(true)}
          >
            {todo.title}
          </span>
          <button
            type="button"
            className="todo__remove"
            onClick={() => handleDelete(todo.id)}
          >
            ×
          </button>
        </>
      )}

      <div
        className={cn('modal overlay', {
          'is-active': isLoading || isCreating,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};