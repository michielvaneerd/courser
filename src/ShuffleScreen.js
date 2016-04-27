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
        mode : "SOURCE_DESTINATION",
        ids : shuffle(Object.keys(this.props.entries))
      };
    },
    componentDidUpdate : function() {
      if (scrollTop !== null) {
        var top = scrollTop;
        scrollTop = null;
        setTimeout(function() {
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
      if (this.state.onlyfavourites) {
        scrollTop = preFavouriteScrollTop;
      } else {
        preFavouriteScrollTop = win.document.getElementById("main").scrollTop;
        scrollTop = null;
      }
      this.setState({
        onlyfavourites : !!!this.state.onlyfavourites
      });
    },
    render : function() {
      return (
        <div id="screen">
          <div id="navbar">
            <div className="navbarButtonContainer" id="navbarLeft">
              <button onClick={this.props.onBack}>&lt;</button>
            </div>
            <div id="navbarTitle">Shuffle{this.state.onlyfavourites ? " [favourites]" : ""}</div>
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
              if (this.state.mode == "ALL" || id == this.state.selectedId || entry.isFavourite) {
                var favouriteClassName = "favouriteButton";
                if (this.props.entries[id].isFavourite) {
                  favouriteClassName += " favouriteActive";
                }
                favourite = <button onClick={this.onFavourite} className={favouriteClassName}>*</button>
              }
                
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
                <li onClick={this.onItemClick} data-id={id} key={id}>
                  <a>
                    {favourite}
                    <div className="entryItemSource" style={styleSource}>{entry.source}</div>
                    <div className="entryItemDestination" style={styleDestination}>{entry.destination}</div>
                    <div className="entryItemPhone" style={style}>{entry.phone}</div>
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
                  <button className="primaryButton normalButton fullwidthButton" onClick={this.onShuffle}>Shuffle</button>
                </li>
                <li>
                  <label htmlFor="onlyFavourites"><input name="mode" type="checkbox"
                    checked={this.state.onlyfavourites}
                    id="onlyFavourites"
                    onChange={this.onOnlyFavourites} />
                  <span>Favourites only</span></label>
                </li>
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