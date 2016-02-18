(function (win) {

	var App = React.createClass({
		displayName: "App",

		componentWillMount: function () {
			var me = this;
			this.props.store.subscribe(function () {
				me.setState(me.props.store.getState());
			});
		},
		getInitialState: function () {
			return this.props.store.getState();
		},
		onMain: function () {
			this.props.store.dispatch({
				type: "SELECT_COURSE",
				value: 0
			});
		},
		render: function () {
			var screen = null;
			var course = this.state.courseId ? this.state.courses[this.state.courseId] : {};
			switch (this.state.screen) {
				case "COURSE_SCREEN":
					screen = React.createElement(CourseScreen, {
						onMain: this.onMain,
						store: this.props.store,
						course: course });
					break;
				default:
					screen = React.createElement(CoursesList, {
						store: this.props.store,
						courses: this.state.courses });
					break;
			}
			return screen;
		}
	});

	ReactDOM.render(React.createElement(App, { store: win.Store }), win.document.getElementById("app"));
})(window);