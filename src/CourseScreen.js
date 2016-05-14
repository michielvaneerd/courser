(function(win) {

  var invalidity = {
    invalidTitle : false,
    showMore : false
  };

  win.CourseScreen = React.createClass({
    getInitialState : function() {
      return Object.assign({
        source_title : "Question",
        destination_title : "Answer",
        phone_title : "",
        test_ok_success_count : 1,
        title : "",
        SOURCE_DESTINATION_CHOOSE : true,
      }, invalidity, this.props.course);
    },
    componentWillReceiveProps : function(nextProps) {
      if (this.state.id && this.state.id == nextProps.course.id) {
        
      } else {
        this.setState(Object.assign({}, invalidity, nextProps.course));
      }
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
    onPhoneTitleInputChange : function(e) {
      this.setState({
        phone_title : e.target.value
      });
    },
    onMore : function() {
      this.setState({
        showMore : !this.state.showMore
      });
    },
    render : function() {
      return (
        <div id="screen">
          <div id="navbar">
            <div className="navbarButtonContainer" id="navbarLeft">
              <button onClick={this.props.onBack}>&lt;</button>
            </div>
            <div id="navbarTitle">{this.props.course.id
              ? this.props.course.title : "Create course"}</div>
            <div className="navbarButtonContainer" id="navbarRight">
              <button
                disabled={!!!this.state.title || !!!this.state.destination_title || !!!this.state.source_title}
                onClick={this.onSave}>Save</button>
            </div>
          </div>
          <div id="main">
            <div className="row">
              <label className="titleLabel" htmlFor="courseTitleInput">Title</label>
              <input id="courseTitleInput" placeholder="Title" autoFocus={true} required={true}
                type="text" onChange={this.onTitleInputChange}
                value={this.state.title} />
            </div>
            <div className="row">
              <label className="titleLabel" htmlFor="courseSourceTitleInput">Question</label>
              <input id="courseSourceTitleInput" placeholder="Question" required={true}
                type="text" onChange={this.onSourceTitleInputChange}
                value={this.state.source_title} />
            </div>
            <div className="row">
              <label className="titleLabel" htmlFor="courseDestinationTitleInput">Answer</label>
              <input id="courseDestinationTitleInput" placeholder="Answer" required={true}
                type="text" onChange={this.onDestinationTitleInputChange}
                value={this.state.destination_title} />
            </div>
            <div className="row">
              <label className="titleLabel" htmlFor="coursePhoneTitleInput">Optional third field</label>
              <input id="coursePhoneTitleInput" placeholder="Leave empty when not used" required={true}
                type="text" onChange={this.onPhoneTitleInputChange}
                value={this.state.phone_title} />
            </div>
            {/*
            <div className="row">
              <label className="titleLabel" htmlFor="courseTestOkSuccessCountInput">Test success count</label>
              <input id="courseTestOkSuccessCountInput" type="number"
                value={this.state.test_ok_success_count}
                min="1" step="1"
                onChange={this.onTestOkSuccessCountChange} />
            </div>
            */}
            <div className="row">
              <label className="titleLabel">Test types</label>
              {win.Constants.testTypes.map(function(testType) {
                var text = win.Language[testType]
                  .replace("%source%", this.state.source_title)
                  .replace("%destination%", this.state.destination_title)
                return (
                  <div className="rowinner" key={testType}>
                    <input checked={typeof this.state[testType] === "undefined" ? false : this.state[testType]}
                      onChange={this.onTestTypeChange}
                      data-id={testType} type="checkbox" id={testType} />
                    <label htmlFor={testType}>{text}</label>
                  </div>
                );
              }, this)}
            </div>
          </div>
        </div>
      );
    }
  });

}(window));
