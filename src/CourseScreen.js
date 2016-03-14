(function(win) {

  var invalidity = {
    invalidTitle : false
  };

  win.CourseScreen = React.createClass({
    getInitialState : function() {
      return Object.assign({
        source_title : "Source",
        destination_title : "Destination",
        test_ok_success_count : 1,
        title : ""
      }, invalidity, this.props.course);
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
    onTestOkSuccessCountChange : function(e) {
      this.setState({
        test_ok_success_count : e.target.value
      });
    },
    onSourceTitleInputChange : function(e) {
      this.setState({
        source_title : e.target.value
      });
    },
    onDestinationTitleInputChange : function(e) {
      this.setState({
        destination_title : e.target.value
      });
    },
    render : function() {
      var deleteButton = this.props.course.id
        ? <button className="deleteButton" onClick={this.onDelete}>Delete</button> : "";
      return (
        <div>
          <div className="toolbar topToolbar">
            <button className="linkButton" onClick={this.props.onMain}>Back</button>
          </div>
          <h2>{this.props.course.id
            ? ("Edit " + this.props.course.title) : "Create course"}</h2>
          <div className="formRow formLabelInputPair">
            <label htmlFor="courseTitleInput">Title</label>
            <input id="courseTitleInput" placeholder="Title" autoFocus={true} required={true}
              type="text" onChange={this.onTitleInputChange}
              value={this.state.title} />
          </div>
          <div className="formRow formLabelInputPair">
            <label htmlFor="courseSourceTitleInput">Source title</label>
            <input id="courseSourceTitleInput" placeholder="Source title" required={true}
              type="text" onChange={this.onSourceTitleInputChange}
              value={this.state.source_title} />
          </div>
          <div className="formRow formLabelInputPair">
            <label htmlFor="courseDestinationTitleInput">Destination title</label>
            <input id="courseDestinationTitleInput" placeholder="Destination title" required={true}
              type="text" onChange={this.onDestinationTitleInputChange}
              value={this.state.destination_title} />
          </div>
          <div className="formRow formLabelInputPair">
            <label htmlFor="courseTestOkSuccessCountInput">Test success count</label>
            <input id="courseTestOkSuccessCountInput" type="number"
              value={this.state.test_ok_success_count}
              onChange={this.onTestOkSuccessCountChange} />
          </div>
          <div className="formRow">
            {win.Constants.testTypes.map(function(testType) {
              var text = win.Language[testType]
                .replace("%source%", this.state.source_title)
                .replace("%destination%", this.state.destination_title)
              return (
                <div className="formInputLabelPair" key={testType}>
                  <input checked={typeof this.state[testType] === "undefined" ? false : this.state[testType]}
                    onChange={this.onTestTypeChange}
                    data-id={testType} type="checkbox" id={testType} />
                  <label htmlFor={testType}>{text}</label>
                </div>
              );
            }, this)}
          </div>
          <div className="toolbar bottomToolbar">
            <button disabled={!!!this.state.title} onClick={this.onSave}>Save</button>
            {deleteButton}
          </div>
        </div>
      );
    }
  });

}(window));
