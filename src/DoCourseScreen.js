(function(win) {

  win.DoCourseScreen = React.createClass({
    getEntry : function(entries) {
      var ids = [];
      for (var key in entries) {
        if (!entries[key].attempt_success || entries[key].attempt_success < entries[key].attempt_failure) {
          ids.push(key);
        }
      }
      if (ids.length) {
        var index = Math.floor(Math.random() * ids.length);
        return entries[ids[index]];
      }
      return {id : 0};
    },
    getInitialState : function() {
      return Object.assign({answer : ""}, this.getEntry(this.props.entries));
    },
    componentWillReceiveProps : function(nextProps) {
      this.setState(Object.assign({answer : ""}, this.getEntry(nextProps.entries)));
    },
    onSave : function() {
      var entry = Object.assign({}, this.state);
      var success = entry.answer == entry.dest;
      delete entry.answer;
      this.props.store.dispatch({
        type : "REQUEST_SAVE_ANSWER",
        value : entry,
        success : success
      });
    },
    onChange : function(e) {
      this.setState({answer : e.target.value});
    },
    onBack : function() {
      this.props.store.dispatch({
        type : "SHOW_COURSE_SCREEN"
      });
    },
    onReset : function() {
      this.props.store.dispatch({
        type : "REQUEST_RESET"
      });
    },
    render : function() {
      var successMessage = this.props.success
        ? <div id="successMessage">OK!</div> : "";
      var editArea = this.state.id
        ? <div>
            <div>{this.state.src}</div>
            <input autoFocus={true} type="text"
              ref={function(el) {
                if (el) {
                  el.focus();
                }
              }}
              onChange={this.onChange} value={this.state.answer} />
            <button onClick={this.onSave}>Save</button>
          </div>
        : <div>
            <div>Course finished!</div>
            <button onClick={this.onReset}>Reset</button>
          </div>;
      return (
        <div>
          <div>{this.props.course.title}</div>
          {editArea}
          {successMessage}
          <button onClick={this.onBack}>Back</button>
        </div>
      );
    }
  });

}(window));