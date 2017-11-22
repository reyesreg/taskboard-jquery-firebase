var database = firebase.database();
var originNode = "";
var targetNode = "";

//Call on document ready
$(document).ready(function () {
	//Make tasks sortable
	$('table#tblAttachAttributes')
		.find('div.sortable')
		.sortable({
			connectWith: 'div.sortable',
			placeholder: "placeholder"
		});

	//Populate divs with tasks
	populateTasks();
	setModalPosition();
});

//Finds new task button and places modal accordingly
function setModalPosition() {
	const btnPos = $('#btn-new-task').position();
	$('#new-task-modal').css({"top": (btnPos.top + 60) + "px", "left": (btnPos.left - 160) + "px"})
}

//Populate tasks on DOM with data pulled from firebase
function populateTasks() {
	var backlog = firebase.database().ref('backlog/').orderByKey();
	var todo = firebase.database().ref('todo/').orderByKey();
	var inProgress = firebase.database().ref('inProgress/').orderByKey();
	var done = firebase.database().ref('done/').orderByKey();

	let allStages = [
		{name: 'backlog', ref: backlog},
		{name: 'todo', ref: todo},
		{name: 'inProgress', ref: inProgress},
		{name: 'done', ref: done},
	]

	for(let i = 0; i < allStages.length; i++) {
		allStages[i].ref.once("value")
			.then(function(snapshot) {
					snapshot.forEach(function(childSnapshot) {
						var key = 			childSnapshot.key;

						var taskType 	= childSnapshot.val().taskType;
						var taskTitle	= childSnapshot.val().taskTitle;
						var taskDesc 	= childSnapshot.val().taskDesc;

						createTaskTemplate(allStages[i].name, key, taskType, taskTitle, taskDesc);
				});
			});
	}
}

//Creates and appends task HTML elements
function createTaskTemplate(stage, key, taskType, taskTitle, taskDesc) {
	var wrapperDiv 		= $("<div>", {"class": "task " + taskType, "id": key});
	var optionDiv			= $("<div>", {"class": "options"});
	var indicatorDiv 	= $("<div>", {"class": "indicator"});
	var contentDiv 		= $("<div>", {"class": "content"});
	var spanTitle 		=	$("<span>", {"class": "title"}).text(taskTitle);
	var spanDesc 			= $("<span>").text(taskDesc);

	$("#" + stage +"-wrapper").append(wrapperDiv);
	wrapperDiv.append(optionDiv);
	optionDiv.append('...');
	wrapperDiv.append(indicatorDiv);
	wrapperDiv.append(contentDiv);
	contentDiv.append(spanTitle);
	contentDiv.append(spanDesc);

	$("#" + stage +"-wrapper").sortable({
		connectWith: ".sortable",
		//I'm sure there's a better way to do this . . .

		
		
		start: function(e, ui) {
			originNode = ui.item.context.parentElement.id.split("-")[0];
		},
		stop: function(e, ui) {
			targetNode = ui.item.context.parentElement.id.split("-")[0];
			updateTask(key, taskType, taskTitle, taskDesc);
		},
	})
}

//Copies data from previous stage
//Creates task in new stage
function updateTask(key, taskType, taskTitle, taskDesc) {
	console.log(originNode, targetNode);
	var updates = {};
	updates[originNode + '/' + key + '/'] = null;
	updates[targetNode + '/' + key + '/'] = {
		taskType: taskType,
		taskTitle: taskTitle,
		taskDesc: taskDesc
	}
	console.log(firebase.database().ref().update(updates));
	return firebase.database().ref().update(updates);
}

//Creates a task and adds to backlog
function createTask() {
	var postData = {
    taskType: $("#selectType option:checked").val(), 
		taskTitle: $("#inputTitle").val(), 
		taskDesc: $("#inputDesc").val(),
  };

	var newPostKey = firebase.database().ref().child('backlog').push().key;

	var updates = {};
	updates['/backlog/' + newPostKey] = postData;

	$("#modal-bg").hide();
	firebase.database().ref().update(updates);
	populateTasks();
}

//Opens add task modal
function openModal() {
	$("#modal-bg").show();
}

//Closes add task modal if clicked outside
$(document).mouseup(function(e) 
{
	if (!$("#modal-bg").is(e.target) && $("#modal-bg").has(e.target).length === 0) 
	{
			$("#modal-bg").hide();
	}
});