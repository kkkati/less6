import { useState, useEffect } from "react";
import styles from "./app.module.css";
import {
  Routes,
  Route,
  Link,
  useParams,
  Navigate,
  useNavigate,
} from "react-router-dom";

const App = () => {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewTodo, setIsNewTodo] = useState(false);
  const [isSort, setIsSort] = useState(false);
  const navigate = useNavigate();

  const todosSort = isSort
    ? todos.sort((a, b) => {
        return a.title > b.title ? 1 : -1;
      })
    : todos;

  //Комgоненты страницы
  const MainPage = () => {
    const [findTodo, setFindTodo] = useState("Введите фрагмент задачи");
    const [idFoundTodo, setIdFoundTodo] = useState("");
    const [isFind, setIsFind] = useState(false);
    const navigate = useNavigate();
    const onClickButtonAddTask = () => {
      navigate("/task");
    };

    const onClickSortTodos = () => {
      setIsSort(!isSort);
      console.log(isSort);
    };

    const onSubmitFindTodo = (event) => {
      event.preventDefault();
      setIsFind(true);
      fetch("http://localhost:3005/todos")
        .then((loadedData) => loadedData.json())
        .then((loadedTodos) => {
          todos.forEach((element) => {
            if (element.title.toLowerCase().includes(findTodo)) {
              setIdFoundTodo(element.id);
              return element.id;
            }
          });
        })
        .finally(() => {
          setIsFind(false);
          setFindTodo("Введите фрагмент задачи");
        });
    };

    const onChangeFindTodo = ({ target }) => {
      setFindTodo(target.value);
    };

    return (
      <>
        <button className={styles.button} onClick={onClickButtonAddTask}>
          Добавить задачу
        </button>
        <button className={styles.button} onClick={onClickSortTodos}>
          Сортировать
        </button>
        <div className={styles.tools}>
          <form onSubmit={onSubmitFindTodo}>
            <input
              className={styles.input}
              type="text"
              name="findTodo"
              value={findTodo}
              onChange={onChangeFindTodo}
            ></input>
            <input
              className={styles.input}
              type="text"
              name="foundTodo"
              value={"Id задачи:" + idFoundTodo}
            ></input>
            <button className={styles.button} disabled={isFind} type="submit">
              Найти задачу
            </button>
          </form>
        </div>
        <div className={styles.todosContainer}>
          {isLoading ? (
            <div className={styles.loader}></div>
          ) : (
            todosSort.map(({ id, title, completed }) => (
              <li key={id} className={styles.todos}>
                <Link to={`/task/${id}`}>
                  {completed}
                  {title}. Id:
                  {id}
                </Link>
              </li>
            ))
          )}
        </div>
      </>
    );
  };

  const NewTask = () => {
    const [newTodo, setNewTodo] = useState("Новая задача");
    const [isCreating, setIsCreating] = useState(false);

    const onSubmitAddTodo = (event) => {
      event.preventDefault();
      setIsCreating(true);
      fetch("http://localhost:3005/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=utf-8" },
        body: JSON.stringify({
          title: newTodo,
        }),
      })
        .then((rawResponse) => rawResponse.json())
        .then((response) => {
          console.log("Добавлена задача:", response);
        })
        .finally(() => {
          console.log("Добавлена задача:");
          setNewTodo("Новая задача");
          setIsNewTodo(!isNewTodo);
          setIsCreating(false);
        });
    };

    const onChangeNewTodo = ({ target }) => {
      setNewTodo(target.value);
    };

    return (
      <form onSubmit={onSubmitAddTodo}>
        <input
          className={styles.input}
          type="text"
          name="newTodo"
          value={newTodo}
          onChange={onChangeNewTodo}
        ></input>
        <button className={styles.button} disabled={isCreating} type="submit">
          Добавить задачу
        </button>
      </form>
    );
  };

  const TaskNotFound = () => <div>Такой задачи не существует</div>;

  const Task = () => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeliting] = useState(false);
    const navigate = useNavigate();
    const params = useParams();
    const taskPage = todosSort.filter((el) => el.id == params.id);
    if (taskPage.length == 0) {
      return <TaskNotFound />;
    }

    const onClickButtonBack = () => {
      navigate(-1);
    };

    const onClickUpdateTodo = (event) => {
      event.preventDefault();
      setIsUpdating(true);
      fetch(`http://localhost:3005/todos/${taskPage[0].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json;charset=utf-8" },
        body: JSON.stringify({
          completed: "Выполнено: ",
        }),
      })
        .then((rawResponse) => rawResponse.json())
        .then((response) => {
          console.log("Задача обновлена:", response);
        })
        .finally(() => {
          setIsNewTodo(!isNewTodo);
          setIsUpdating(false);
        });
    };

    const onClickDeleteTodo = (event) => {
      event.preventDefault();
      setIsDeliting(true);
      fetch(`http://localhost:3005/todos/${taskPage[0].id}`, {
        method: "DELETE",
      })
        .then((rawResponse) => rawResponse.json())
        .then((response) => {
          console.log("Задача удалена:", response);
        })
        .finally(() => {
          setIsNewTodo(!isNewTodo);
          setIsUpdating(false);
        });
    };

    return (
      <>
        <button className={styles.button} onClick={onClickButtonBack}>
          Назад{" "}
        </button>
        <button
          className={styles.button}
          disabled={isUpdating}
          onClick={onClickUpdateTodo}
        >
          Задача выполнена
        </button>
        <button
          className={styles.button}
          disabled={isDeleting}
          onClick={onClickDeleteTodo}
        >
          Удалить задачу
        </button>
        <li className={styles.todos}>
          {taskPage[0].completed}
          {taskPage[0].title}. Id:
          {taskPage[0].id}
        </li>
      </>
    );
  };

  const NotFound = () => <div>Такая страница не существует</div>;

  useEffect(() => {
    setIsLoading(true);

    fetch("http://localhost:3005/todos")
      .then((loadedData) => loadedData.json())
      .then((loadedTodos) => {
        setTodos(loadedTodos);
      })
      .finally(() => setIsLoading(false));
  }, [isNewTodo]);

  //обработчик
  const onClickMainButton = () => {
    navigate("/");
  };

  return (
    <div className={styles.app}>
      <div>
        <button className={styles.button} onClick={onClickMainButton}>
          Главная
        </button>
      </div>

      <Routes>
        <Route path="/" element={<MainPage />}></Route>
        <Route path="/task" element={<NewTask />}></Route>
        <Route path="/task/:id" element={<Task />}></Route>
        <Route path="/404" element={<NotFound />}></Route>
        <Route path="*" element={<Navigate to="/404" />}></Route>
      </Routes>
    </div>
  );
};

export default App;
