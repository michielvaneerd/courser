(function(win) {

  var invalidity = {
    invalidTitle : false
  };

  win.CourseScreen = React.createClass({
    getInitialState : function() {
      return Object.assign({}, invalidity, this.props.course);
    },
    componentWillReceiveProps : function(nextProps) {
      this.setState(Object.assign({}, invalidity, nextProps.course));
    },
    onSave : function() {
      var course = Object.assign({}, this.state);
      Object.keys(invalidity).forEach(function(key) {
        delete course[key];
      });
      this.props.store.dispatch({
        type : "REQUEST_SAVE_COURSE",
        value : course
      });
    },
    onTitleInputChange : function(e) {
      this.setState({
        title : e.target.value,
        invalidTitle : e.target.value.length == 0
      });
    },
    onTestTypeChange : function(e) {
      var o = {};
      var key = e.currentTarget.dataset.id;
      var checked = e.currentTarget.checked;
      o[key] = checked;
      this.setState(o);
    },
    onDelete : function() {
      this.props.store.dispatch({
        type : "REQUEST_DELETE_COURSE"
      });
    },
    onEntries : function() {
      this.props.store.dispatch({
        type : "REQUEST_SELECT_ENTRIES",
        value : this.props.course.id
      });
    },
    onDo : function() {
      this.props.store.dispatch({
        type : "REQUEST_DO_COURSE",
        value : this.props.course.id
      });
    },
    onTestOkSuccessCountChange : function(e) {
      this.setState({
        test_ok_success_count : e.target.value
      });
    },
    render : function() {
      console.log(JSON.stringify(this.state));
      var title = this.props.course.id
        ? "Edit van course " + this.props.course.title : "Maken van course";
      var deleteButton = this.props.course.id
        ? <button onClick={this.onDelete}>Delete</button> : "";
      return (
        <div>
          <h1>{title}</h1>
          <div>
            <label htmlFor="courseTitleInput">Title</label>
            <input id="courseTitleInput" placeholder="Title" autoFocus={true} required={true}
              type="text" onChange={this.onTitleInputChange}
              value={this.state.title} />
          </div>
          <div>
            <h3>Test success count</h3>
            <input type="number"
              value={this.state.test_ok_success_count}
              onChange={this.onTestOkSuccessCountChange} />
          </div>
          <div>
            <h3>Test types</h3>
            {win.Constants.testTypes.map(function(testType) {
              return (
                <div key={testType}>
                  <input checked={this.state[testType]} onChange={this.onTestTypeChange} data-id={testType} type="checkbox" id={testType} />
                  <label htmlFor={testType}>{win.Language[testType]}</label>
                </div>
              );
            }, this)}
          </div>
          <button disabled={!!!this.state.title} onClick={this.onSave}>Save</button>
          <button onClick={this.props.onMain}>Back</button>
          <button disabled={!(this.props.course.id)} onClick={this.onEntries}>Show entries</button>
          <button disabled={!this.props.course.id || this.props.course.count < 5} onClick={this.onDo}>Do</button>
          {deleteButton}
        </div>
      );
    }
  });

}(window));
