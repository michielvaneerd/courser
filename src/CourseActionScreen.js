(function(win) {

  win.CourseActionScreen = React.createClass({
    onEntriesClick : function() {
      this.props.store.dispatch({
        type : "REQUEST_SELECT_ENTRIES",
        value : this.props.course.id
      });
    },
    onDoClick : function() {
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
                disabled={this.props.course.count <= 4}
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