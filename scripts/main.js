var database = firebase.database();

//Call on document ready
$(document)
	.ready(function () {

		//Make tasks sortable
		$('table#tblAttachAttributes')
			.find('div.sortable')
			.sortable({
				connectWith: 'div.sortable',
				placeholder: "placeholder"
			});

		//Populate divs with tasks
		populateTasks();
	});

//Populate tasks on DOM with data pulled from firebase
function populateTasks() {
	var backlog = firebase.database().ref('backlog/').orderByKey();
	var todo = firebase.database().ref('todo/').orderByKey();
	var inProgress = firebase.database().ref('inprogress/').orderByKey();
	var done = firebase.database().ref('done/').orderByKey();

	let allStages = [
		{name: 'backlog', ref: backlog},
		{name: 'todo', ref: todo},
		{name: 'inProgress', ref: inProgress},
		{name: 'backlog', ref: done},
	]

	for(let i = 0; i < allStages.length; i++) {
		allStages[i].ref.once("value")
			.then(function(snapshot) {
					snapshot.forEach(function(childSnapshot) {
						var key = 			childSnapshot.key;

						var taskType = 	childSnapshot.val().taskType;
						var taskTitle = childSnapshot.val().taskTitle;
						var taskDesc = 	childSnapshot.val().taskDesc;

						createTaskTemplate(allStages[i].name, key, taskType, taskTitle, taskDesc);
				});
			});
	}
}

//Creates and appends task HTML elements
function createTaskTemplate(stage, key, taskType, taskTitle, taskDesc) {
	var wrapperDiv = 			$("<div></div>", {"class": "task " + taskType, "id": key});
	var indicatorDiv = 		$("<div>", {"class": "indicator"});
	var contentDiv =			$("<div>", {"class": "content"});
	var spanTitle = 			$("<span>", {"class": "title"}).text(taskTitle);
	var spanDesc = 				$("<span>").text(taskDesc);

	$("#" + stage +"-wrapper").append(wrapperDiv);
	wrapperDiv.append(indicatorDiv);
	wrapperDiv.append(contentDiv);
	contentDiv.append(spanTitle);
	contentDiv.append(spanDesc);

	$("#" + stage +"-wrapper").sortable({
		connectWith: ".sortable",
		//I'm sure there's a better way to do this . . .
		activate: function(e, ui) {
			console.log(ui.item.context.parentElement.id.split("-")[0]);
		},
		deactivate: function(e, ui) {
			console.log(ui.item.context.parentElement.id.split("-")[0]);
		},
	})
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

	$("#new-task-modal").hide();
	firebase.database().ref().update(updates);
	populateTasks();
}

//Opens add task modal
function openModal() {
	$("#new-task-modal").show();
}

//Closes add task modal if clicked outside
$(document).mouseup(function(e) 
{
	if (!$("#new-task-modal").is(e.target) && $("#new-task-modal").has(e.target).length === 0) 
	{
			$("#new-task-modal").hide();
	}
});