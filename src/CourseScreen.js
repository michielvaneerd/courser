(function(win) {

	win.CourseScreen = React.createClass({
		getInitialState : function() {
			return Object.assign({}, this.props.course);
		},
		onSave : function() {
			this.props.store.dispatch({
				type : "SAVE_COURSE",
				value : this.state
			});
		},
		onTitleInputChange : function(e) {
			this.setState({
				title : e.target.value
			});
		},
		onDelete : function() {
			this.props.store.dispatch({
				type : "DELETE_COURSE"
			});
		},
		onEntries : function() {
			
		},
		render : function() {
			var title = this.props.course.id
				? "Edit van course " + this.props.course.title : "Maken van course";
			return (
				<div>
					<h3>{title}</h3>
					<input type="text" onChange={this.onTitleInputChange}
						value={this.state.title} />
					<button onClick={this.onSave}>Save</button>
					<button onClick={this.props.onMain}>Back</button>
					<button onClick={this.onEntries}>Show entries</button>
					<button onClick={this.onDelete}>Delete</button>
				</div>
			);
		}
	});

}(window));