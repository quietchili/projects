let db;
let db_name = 'my_database'

let current_selected_date = new Date();

let projects = [];

const TASK_STATES = [
    'TODO',
    'In Progress',
    'Completed'
];

function showSelectedProject(project_id){
    //alert(project_id);
    projects.forEach(project => {
        if(project.project_id == project_id){
            //update last_modified

            document.getElementById('project_name_title').innerHTML = project.name;
        }
    });

    let all_states_container = document.getElementById('all_states_container')

    TASK_STATES.forEach(state => {
        let state_container = document.createElement('div');
        state_container.classList.add('state_container');
        all_states_container.append(state_container);
    });

}

function update(){
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
        projects_list_dropdown.append(new_element)
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
        update();
    }
    request.onerror = function(event){
        console.error("error opening database", event);
    }
}

// function save(){

// }

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
        //const objectStore = db.createObjectStore("projects", {autoIncrement: true});
        // if(!projectObjectStore){
        //     projectObjectStore = db.createObjectStore("projects", {autoIncrement: true});
        // }
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
        created_date: new Date(),
        tasks: [],
        notes: ''
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
    // let document.getElementById('projects_list_dropdown')
})

start()