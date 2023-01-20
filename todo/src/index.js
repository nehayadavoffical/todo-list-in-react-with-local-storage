import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tasks: [],
      searchTaskValue: '',
      completedTask: []
    }
  }
  
  deleteTask = (id) => {
    const {tasks, completedTask} = this.state;
    const filterTasks = tasks.filter(task => task.id !== id)
    const clearCompleted = completedTask.length > 0 && completedTask.filter(task => task.id !== id)
    
    this.setState({
      tasks: filterTasks,
      completedTask: clearCompleted
    })
  }
  
  addTask = (task, id, type,is_complete) => {
    const {tasks} = this.state
    
    tasks.unshift({task, id, type ,is_complete})
    
    this.setState({
      tasks: tasks
    })
  }
  
  saveEditTask = (task, id) => {
    const { tasks } = this.state
    tasks.map(todo => {
      if(todo.id === id) {
        todo.task = task
      }
    })
    this.setState({tasks})
  }
  
  searchTask = (taskName) => {
    this.setState({searchTaskValue: taskName})
  }

  completeTask = (id) => {
    const {tasks} = this.state
    tasks.map(task => {
       if(task.id === id){
        task.is_complete = true;
       }
    })
    this.setState({tasks})
    localStorage.setItem('tasks', JSON.stringify(this.state.tasks))

  }

  componentWillMount() {
    let itemsList = JSON.parse(localStorage.getItem('tasks'));
    if (itemsList) {
      this.setState({
        tasks: JSON.parse(localStorage.getItem('tasks'))
      })
    }
    this.state.completedTask = itemsList.filter(task => {
      if(task.is_complete == true){
         return task;
      }
    });
  }


  componentDidUpdate() {
    localStorage.setItem('tasks', JSON.stringify(this.state.tasks))
  }

  
  render() {
    const {tasks, searchTaskValue, completedTask} = this.state
    
    const calculateCompletedTask = (completedTask.length / tasks.length)* 100 ;
    const percentage = calculateCompletedTask.toFixed(0)

    const d = new Date()
    const weekDay = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    const day = weekDay[d.getDay()]
    const month = months[d.getMonth()]
    const date = d.getDate()
    const year = d.getFullYear()
    
    const searchFilter = tasks
                      .filter(todo => 
                       todo.task.toLowerCase().includes(searchTaskValue.toLowerCase()) 
                       || 
                       todo.type.toLowerCase().includes(searchTaskValue.toLowerCase()))
    
    
    return (
      <div id="app">

        <header>
          <div className="date">
            <TodaysDate day={day} month={month} date={date} year={year} />
          </div>
          <div className="type-of-tasks">
            <PersonalTask tasks={tasks} />
            <BusinessTask tasks={tasks} />
          </div>
          <div className="task-completion">
            <span>{percentage === 'NaN' ? 0 : percentage }% done</span>
          </div>
        </header>
        
        {tasks.length > 1 && <SearchTask searchTask={this.searchTask} />}
        
        <ul>
          {
            searchFilter.map(todo => 
            <TodoTask key={todo.id}
              {...todo}
              deleteTask={this.deleteTask}
              saveEditTask={this.saveEditTask}
              completeTask={this.completeTask}
              />)
          }
        </ul>
        
        <AddTaskForm addTask={this.addTask}/>
        
      </div>
    )
  }
}

const TypeCount = (list, type) => <p>{list.filter(l => l.type == type).length} <span>{type}</span></p>;
const PersonalTask = ({tasks}) => TypeCount(tasks, 'Personal');
const BusinessTask = ({tasks}) => TypeCount(tasks, 'Business');
const TodaysDate = ({day, month, date, year}) => <p>{day} <span>{month} {date}, {year}</span></p>

class SearchTask extends React.Component {
  
  searchTask = () => {
    const searchValue = this.searchInput.value
    const {searchTask} = this.props
    searchTask(searchValue);
  }
  
  render() {
    return (
      <div id="search-field">
        <input 
          type="text"
          placeholder="Search Task"
          onChange={this.searchTask}
          ref={input => this.searchInput = input} />
        <i className="fa fa-search"></i>
      </div>
    )
  }
}

class TodoTask extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      isEdit: false,
      is_complete: false
    }
  }
  
  deleteTask = () => {
    const { id , deleteTask } = this.props
    deleteTask(id)
  }
  
  editTask = () => {
    this.setState({
      isEdit: true
    })
  }
  
  completeTask = () => {
    const {completeTask, id} = this.props
    console.log(completeTask);
    completeTask(id)
    this.setState({
      is_complete: true
    })
  }
  
  saveEditTask = (e) => {
    e.preventDefault()
    
    const {id} = this.props
    const {saveEditTask} = this.props
    
    if(!this.editInput.value) {
      
    }
    else {
      saveEditTask(this.editInput.value, id)
      this.setState({
        isEdit: false
      })
    }
    
  }
  
  render() {
    const {task, type,is_complete} = this.props
    const {isEdit} = this.state
    const disableBtn = is_complete && 'disable-btn'
    return (
        <li>        
          {
          isEdit ?
            <form
              id="edit-task-form"
              onSubmit={this.saveEditTask}>
              <input 
                defaultValue={task}
                ref={editInput => this.editInput = editInput} 
                />
              <button>Save</button>
            </form>
            :
            <div>
            <p 
              className={is_complete && 'completed'}>
              {task} <span>{type}</span>
            </p>
              <button 
                className='delete-btn'
                onClick={this.deleteTask}>
                Delete
            </button>
              <button
                className={disableBtn}
                disabled={is_complete}
                onClick={this.editTask}>
                Edit
            </button>
              <button
                className={disableBtn}
                disabled={is_complete}
                onClick={this.completeTask}>
                Complete
            </button>
            </div>
        }
        </li>
    )
  }
}

class AddTaskForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selected: '',
      is_complete : false
    }
  }
  
  handleSelectChange = (e) => {
    this.setState({selected: e.target.value})
  }
  
  addTask = (e) => {
    const {addTask} = this.props
    
    e.preventDefault()
    
    if(!this.taskInput.value || !this.state.selected) {
      
    }
    else {
      const date = new Date()
      const id = date.getTime()
      const type = this.state.selected
      const is_complete = this.state.is_complete;
      addTask(this.taskInput.value, id, type,is_complete)
      this.taskInput.value = ''
      this.setState({selected: ''})
    }
  }
  
  render() {
    const { selected } = this.state
    const { is_complete } = this.state
    return (
      <form id="add-task-form" onSubmit={this.addTask}>
        
          <input 
            id="task"
            type="text"
            placeholder="Add a task"
            ref={taskInput => this.taskInput = taskInput}/>
        
    
        <select
          value={selected}
          onChange={this.handleSelectChange}
          // ref={select => this.selectOption = select}
          >
          <option value="">Type</option>
          <option value="Personal">Personal</option>
          <option value="Business">Business</option>
        </select>

        <input
          type = "hidden"
          id ="is_complete"
          value={is_complete}
        />
        <button>Add</button>
      </form>
    )
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
