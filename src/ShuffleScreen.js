(function(win) {

  var scrollTop = null;
  var preFavouriteScrollTop = null;

  function shuffle(o) {
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }

  win.ShuffleScreen = React.createClass({
    getInitialState : function() {
      scrollTop = null;
      return {
        selectedId : 0,
        mode : ["SOURCE_DESTINATION"],
        ids : shuffle(Object.keys(this.props.entries))
      };
    },
    componentDidUpdate : function() {
      if (scrollTop !== null) {
        var top = scrollTop;
        scrollTop = null;
        var t = setTimeout(function() {
          clearTimeout(t);
          win.document.getElementById("main").scrollTop = top;
        }, 300);
      }
    },
    onShuffle : function() {
      scrollTop = 0;
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
    handleModeChange : function(e, mode) {
      var index = this.state.mode.indexOf(mode);
      if (e.target.checked) {
        if (index === -1) {
          var newMode = this.state.mode.slice();
          newMode.push(mode);
          this.setState({
            mode : newMode
          });
        }
      } else {
        if (index > -1) {
          var newMode = this.state.mode.slice();
          newMode.splice(index, 1);
          this.setState({
            mode : newMode
          });
        }
      }
    },
    onModeChangeSD : function(e) {
      this.handleModeChange(e, "SOURCE_DESTINATION");
    },
    onModeChangeDS : function(e) {
      this.handleModeChange(e, "DESTINATION_SOURCE");
    },
    onModeChangeThird : function(e) {
      this.handleModeChange(e, "THIRD");
    },
    onMore : function() {
      this.props.store.dispatch({
        type : "SHOW_SHUFFLE_MENU",
        value : !this.props.shuffleMenuShow
      });
    },
    onFavourite : function(e) {
      e.stopPropagation();
      var id = e.target.parentNode.parentNode.dataset.id;
      this.props.store.dispatch({
        type : "ENTRY_TOGGLE_FAVOURITE",
        value : id
      });
    },
    onOnlyFavourites : function() {
      var nowOnlyFav = !!this.state.onlyfavourites;
      if (nowOnlyFav) {
        scrollTop = preFavouriteScrollTop;
      } else {
        preFavouriteScrollTop = win.document.getElementById("main").scrollTop;
        scrollTop = 0;
      }
      this.setState({
        onlyfavourites : !nowOnlyFav
      });
    },
    render : function() {
      var thirdModeOption = this.props.course.phone_title ? (
        <li>
          <label htmlFor="modeThird"><input name="mode" type="checkbox"
            checked={this.state.mode.indexOf("THIRD") > -1}
            id="modeThird"
            onChange={this.onModeChangeThird} />
          <span>Show {this.props.course.phone_title}</span></label>
        </li>
      ) : null;
      return (
        <div id="screen">
          <div id="navbar">
            <div className="navbarButtonContainer" id="navbarLeft">
              <button onClick={this.props.onBack}>&lt;</button>
            </div>
            <div id="navbarTitle">Practice{this.state.onlyfavourites ? " [favourites]" : ""}</div>
            <div id="navbarPrintTitle">{this.props.course.title}</div>
            <div className="navbarButtonContainer" id="navbarRight">
              <button onClick={this.onMore}>=</button>
            </div>
          </div>
          <div id="main">          
            <ul className="listView">
            {this.state.ids.map(function(id) {
              var entry = this.props.entries[id];
              if (this.state.onlyfavourites && !entry.isFavourite) {
                return "";
              }
              var favourite = "";
              if (id == this.state.selectedId || entry.isFavourite) {
                var favouriteClassName = "favouriteButton rightTop";
                if (this.props.entries[id].isFavourite) {
                  favouriteClassName += " favouriteActive";
                }
                favourite = <button title="Toggle favourite" onClick={this.onFavourite} className={favouriteClassName}></button>
              }

              var styleSource = {
                visibility : (this.state.mode.indexOf("SOURCE_DESTINATION") > -1 || id == this.state.selectedId)
                  ? "visible" : "hidden"
              };
              var styleDestination = {
                visibility : (this.state.mode.indexOf("DESTINATION_SOURCE") > -1 || id == this.state.selectedId)
                  ? "visible" : "hidden"
              };
              var styleThird = {
                visibility : (this.state.mode.indexOf("THIRD") > -1 || id == this.state.selectedId)
                  ? "visible" : "hidden"
              };
              return (
                <li onClick={this.onItemClick} data-id={id} key={id}>
                  <a>
                    {favourite}
                    <div className="entryItemSource" style={styleSource}>{entry.source}</div>
                    <div className="entryItemDestination" style={styleDestination}>{entry.destination}</div>
                    <div className="entryItemPhone" style={styleThird}>{entry.phone}</div>
                  </a>
                </li>
              );
            }, this)}
            </ul>
          </div>
          {this.props.shuffleMenuShow
            ? (
              <ul id="popup" className="listView">
                <li>
                  <button className="primaryButton normalButton fullwidthButton" onClick={this.onShuffle}>Practice</button>
                </li>
                <li>
                  <label htmlFor="onlyFavourites"><input name="mode" type="checkbox"
                    checked={this.state.onlyfavourites}
                    id="onlyFavourites"
                    onChange={this.onOnlyFavourites} />
                  <span>Favourites only</span></label>
                </li>
                <li>
                  <label htmlFor="modeSD"><input name="mode" type="checkbox"
                    checked={this.state.mode.indexOf("SOURCE_DESTINATION") > -1}
                    id="modeSD"
                    onChange={this.onModeChangeSD} />
                  <span>Show {this.props.course.source_title}</span></label>
                </li>
                <li>
                  <label htmlFor="modeDS"><input name="mode" type="checkbox"
                    id="modeDS"
                    checked={this.state.mode.indexOf("DESTINATION_SOURCE") > -1}
                    onChange={this.onModeChangeDS} />
                  <span>Show {this.props.course.destination_title}</span></label>
                </li>
                {thirdModeOption}
              </ul>
            ) : ""}
        </div>
      );
    }
  });

}(window));