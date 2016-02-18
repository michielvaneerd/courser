(function (win) {

	win.CoursesList = React.createClass({
		displayName: "CoursesList",

		onCourseClick: function (e) {
			e.preventDefault();
			this.props.store.dispatch({
				type: "SELECT_COURSE",
				value: e.currentTarget.dataset.id
			});
		},
		onCreateCourse: function () {
			this.props.store.dispatch({
				type: "SHOW_COURSE_SCREEN"
			});
		},
		render: function () {
			return React.createElement(
				"div",
				null,
				React.createElement(
					"ul",
					null,
					Object.keys(this.props.courses).map(function (courseId) {
						var course = this.props.courses[courseId];
						return React.createElement(
							"li",
							{ key: course.id },
							React.createElement(
								"a",
								{ onClick: this.onCourseClick, "data-id": courseId,
									href: "#" },
								course.title
							)
						);
					}, this)
				),
				React.createElement(
					"div",
					null,
					React.createElement(
						"button",
						{ onClick: this.onCreateCourse },
						"Create course"
					)
				)
			);
		}
	});
})(window);