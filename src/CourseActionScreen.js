(function(win) {

  win.CourseActionScreen = React.createClass({
    onEntriesClick : function() {
      this.props.store.dispatch({
        type : "REQUEST_SELECT_ENTRIES",
        value : this.props.course.id
      });
    },
    onDoClick : function() {
      
      var disableTestInfo = [];
      if (this.props.course.count <= 4) {
        disableTestInfo.push("- create at least 5 entries");
      }
      if (win.Constants.testTypes.filter(function(testType) {
        return this.props.course[testType] === true;
      }, this).length == 0) {
        disableTestInfo.push("- choose at least 1 test type in Edit course screen");
      }
      if (disableTestInfo.length) {
        alert("Please make sure to:\n\n" + disableTestInfo.join("\n"));
        return;
      }
      
      this.props.store.dispatch({
        type : "REQUEST_DO_COURSE",
        value : this.props.course.id
      });
    },
    onShuffleClick : function() {
      this.props.store.dispatch({
        type : "REQUEST_DO_SHUFFLE",
        value : this.props.course.id
      });
    },
    onEditClick : function() {
      this.props.store.dispatch({
        type : "SELECT_COURSE_EDIT",
        value : this.props.course.id
      });
    },
    render : function() {
      var disableTestInfo = [];
      if (this.props.course.count <= 4) {
        disableTestInfo.push("Create at least 5 entries");
      }
      if (win.Constants.testTypes.filter(function(testType) {
        return this.props.course[testType] === true;
      }, this).length == 0) {
        disableTestInfo.push("Choose at least 1 test type");
      }
      return (
        <div id="screen">
          <div id="navbar">
            <div className="navbarButtonContainer" id="navbarLeft">
              <button className="fullwidthButton" onClick={this.props.onMain}>&lt;</button>
            </div>
            <div id="navbarTitle">{this.props.course.title}</div>
          </div>
          <div id="main">
            <div className="row">
              <button className="normalButton fullwidthButton" onClick={this.onEntriesClick}>Entries ({this.props.course.count})</button>
            </div>
            <div className="row">
              <button
                className="normalButton fullwidthButton"
                disabled={this.props.course.count == 0}
                onClick={this.onShuffleClick}>Shuffle</button>
            </div>
            <div className="row">
              <button
                className="normalButton fullwidthButton"
                onClick={this.onDoClick}>Test</button>
            </div>
            <div className="row">
              <button className="normalButton fullwidthButton" onClick={this.onEditClick}>Edit</button>
            </div>
          </div>
        </div>
      );
    }
  });

}(window));