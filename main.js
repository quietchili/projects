let db;
let db_name = 'my_database'
let current_selected_date = new Date();
let projects = [];
const TASK_STATES = [
    'TODO',
    'In Progress',
    'Completed'
];

function saveProject(project){
    const tx = db.transaction('projects', 'readwrite');
    const projectObjectStore = tx.objectStore('projects');
    const request = projectObjectStore.put(project);

    tx.onerror = onabort = function(event){
        console.error('Transaction Error', event);   
    }

    request.onsuccess = function(event){
        
    }

    request.onerror = function(event){
        console.error(event);   
    }
}

function showSelectedProject(project_id){
    projects.forEach(project => {
        if(project.project_id == project_id){
            //update last_modified
            project.last_modified_date = new Date();
            saveProject(project)
            document.getElementById('project_name_title').innerHTML = project.name;
        }
    });

    let all_states_container = document.getElementById('all_states_container');
    all_states_container.innerHTML = ""

    TASK_STATES.forEach(state => {
        let state_container = document.createElement('div');
        state_container.classList.add('state_container');
        state_container.textContent = state;

        let tasks_container = document.createElement('div');
        tasks_container.classList.add('tasks_container');
        state_container.append(tasks_container);

        projects.forEach(project => {
            if(project.project_id == project_id){
                project.tasks.forEach((task,index) => {
                    if(task.state == state){
                        let new_task_container = document.createElement('div');
                        new_task_container.classList.add('task_container');
                        let new_task_input = document.createElement('input');

                        let close_span = document.createElement('span');
                        close_span.textContent = "x"
                        close_span.classList.add('close_span')
                        close_span.addEventListener('click',function(){
                            if(confirm('Are you sure you want to delete this task?')){
                                project.tasks.splice(index,1)
                                saveProject(project);
                            }
                            console.log(index);
                        });
                        new_task_container.append(close_span)
                        new_task_container.append(new_task_input)
                        tasks_container.append(new_task_container)
                    }
                });
            }
        });


        let add_new_task_button = document.createElement('button');
        add_new_task_button.innerHTML = "Add New";
        add_new_task_button.classList.add('add_new_task_button');
        add_new_task_button.addEventListener('click',function(event){

            let task = {
                text: '',
                name: '',
                state: state,
                notes: '',
                completed_date: '',
                created_date: new Date(),
                last_updated_date: new Date(),
            }

            projects.forEach(project => {
                if(project.project_id == project_id){
                    project.tasks.push(task);
                    saveProject(project)
                }
            });

            update(project_id);
        })
        state_container.append(add_new_task_button);


        all_states_container.append(state_container);
    });

}

function update(project_id){
    let projects_list_dropdown = document.getElementById('projects_list_dropdown');
    projects_list_dropdown.innerHTML = "";

    let empty_option = document.createElement('option');
    empty_option.innerHTML = "";
    empty_option.value = "";
    projects_list_dropdown.append(empty_option)

    projects.forEach(project => {
        let new_element = document.createElement('option');
        new_element.innerHTML = project.name;
        new_element.value = project.project_id;
        if(project.project_id == project_id){
            new_element.selected = true;
            showSelectedProject(project_id);
        }
        projects_list_dropdown.append(new_element);
    });
}

function load(){
    const tx = db.transaction('projects', 'readonly');
    const projectObjectStore = tx.objectStore('projects')
    const request = projectObjectStore.getAll();

    tx.onerror = onabort = function(event){
        console.error('Transaction Error', event);
    }
    request.onsuccess = function(){
        projects = request.result || [];
        let max_date = new Date(0);
        let max_project_id;
        
        projects.forEach(project => {
            let new_element = document.createElement('option');
            new_element.innerHTML = project.name;
            new_element.value = project.project_id;
            projects_list_dropdown.append(new_element);

            if(project.last_modified_date && project.last_modified_date > max_date){
                max_date = project.last_modified_date;
                max_project_id = project.project_id;
            }
        });

        update(max_project_id);
    }
    request.onerror = function(event){
        console.error("error opening database", event);
    }
}

function start(){
    const request = window.indexedDB.open(db_name, 2);
    request.onerror = function(event){
        console.error("error opening database", event);
        alert('Did Not Start Correctly See Logs');
    }

    request.onsuccess = function(event){
        db = event.target.result;
        load();
        update();
    }

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        db.createObjectStore("projects", {keyPath: 'project_id', autoIncrement: true});
    };
}

document.getElementById('create_project_button').addEventListener('click', function(){
    let project_name_input = document.getElementById('project_name_input');
    let project_name = project_name_input.value;
    let project = {
        name: project_name,
        tasks: [],
        notes: '',
        created_date: new Date(),
        last_modified_date: new Date(),
    }
    

    const tx = db.transaction('projects', 'readwrite');
    const projectObjectStore = tx.objectStore('projects');
    const request = projectObjectStore.add(project);

    tx.onerror = onabort = function(event){
        console.error('Transaction Error', event);   
    }

    request.onsuccess = function(event){
        project.project_id = event.target.result
        projects.push(project);
        update();
    }

    request.onerror = function(event){
        console.error(event);   
    }
});

document.getElementById('projects_list_dropdown').addEventListener('change', function(event){
    showSelectedProject(event.target.value);
})

start()