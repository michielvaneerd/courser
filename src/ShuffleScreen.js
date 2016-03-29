(function(win) {

  function shuffle(o) {
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }

  win.ShuffleScreen = React.createClass({
    getInitialState : function() {
      return {
        selectedId : 0,
        mode : "SOURCE_DESTINATION",
        ids : shuffle(Object.keys(this.props.entries)),
        showMore : false
      };
    },
    onBack : function() {
      if (!this.props.forceBackToMainScreen) {
        this.props.store.dispatch({
          type : "SHOW_COURSE_SCREEN"
        });
      } else {
        this.props.onMain();
      }
    },
    onShuffle : function() {
      this.setState({
        selectedId : 0,
        ids : shuffle(Object.keys(this.props.entries))
      });
    },
    onItemClick : function(e) {
      this.setState({
        selectedId : this.state.selectedId == e.currentTarget.dataset.id
          ? 0 : e.currentTarget.dataset.id
      });
    },
    onModeChangeSD : function(e) {
      if (e.target.checked) {
        this.setState({
          mode : "SOURCE_DESTINATION"
        });
      }
    },
    onModeChangeDS : function(e) {
      if (e.target.checked) {
        this.setState({
          mode : "DESTINATION_SOURCE"
        });
      }
    },
    onModeChangeAll : function(e) {
      if (e.target.checked) {
        this.setState({
          mode : "ALL",
          selectedId : 0,
          // TODO: order alphabetically
          ids : Object.keys(this.props.entries)
        });
      }
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
              <button onClick={this.onBack}>&lt;</button>
            </div>
            <div id="navbarTitle">Shuffle</div>
            <div className="navbarButtonContainer" id="navbarRight">
              <button onClick={this.onMore}>:</button>
            </div>
          </div>
          <div id="main">
            <div className="row buttonbar">
              <button className="fullwidthButton" onClick={this.onShuffle}>Shuffle</button>
            </div>
          
            <ul className="listView">
            {this.state.ids.map(function(id) {
              var styleSource = {
                visibility : (this.state.mode == "ALL" || this.state.mode == "SOURCE_DESTINATION" || id == this.state.selectedId)
                  ? "visible" : "hidden"
              };
              var styleDestination = {
                visibility : (this.state.mode == "ALL" || this.state.mode == "DESTINATION_SOURCE" || id == this.state.selectedId)
                  ? "visible" : "hidden"
              };
              var style = {
                visibility : (this.state.mode == "ALL" || id == this.state.selectedId)
                  ? "visible" : "hidden"
              };
              return (
                <li onClick={this.onItemClick} data-id={id} key={id}><a>
                  <div style={styleSource}>{this.props.entries[id].source}</div>
                  <div style={styleDestination}>{this.props.entries[id].destination}</div>
                  <div style={style}><em>{this.props.entries[id].phone}</em></div></a>
                </li>
              );
            }, this)}
            </ul>
          </div>
          {this.state.showMore
            ? (
              <ul id="popup" className="listView">
                <li>
                  <label htmlFor="modeSD"><input name="mode" type="radio"
                    checked={this.state.mode == "SOURCE_DESTINATION"}
                    id="modeSD"
                    onChange={this.onModeChangeSD} />
                  <span>Show {this.props.course.source_title}</span></label>
                </li>
                <li>
                  <label htmlFor="modeDS"><input name="mode" type="radio"
                    id="modeDS"
                    checked={this.state.mode == "DESTINATION_SOURCE"}
                    onChange={this.onModeChangeDS} />
                  <span>Show {this.props.course.destination_title}</span></label>
                </li>
                <li>
                  <label htmlFor="modeALL"><input name="mode" type="radio"
                    id="modeALL"
                    checked={this.state.mode == "ALL"}
                    onChange={this.onModeChangeAll} />
                  <span>Show all</span></label>
                </li>
              </ul>
            ) : ""}
        </div>
      );
    }
  });

}(window));