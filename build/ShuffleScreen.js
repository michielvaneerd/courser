(function (win) {

  function shuffle(o) {
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }

  win.ShuffleScreen = React.createClass({
    displayName: "ShuffleScreen",

    getInitialState: function () {
      return {
        selectedId: 0,
        mode: "SOURCE_DESTINATION",
        ids: shuffle(Object.keys(this.props.entries))
      };
    },
    onShuffle: function () {
      this.setState({
        selectedId: 0,
        ids: shuffle(Object.keys(this.props.entries))
      });
    },
    onItemClick: function (e) {
      this.setState({
        selectedId: this.state.selectedId == e.currentTarget.dataset.id ? 0 : e.currentTarget.dataset.id
      });
    },
    onModeChangeSD: function (e) {
      if (e.target.checked) {
        this.setState({
          mode: "SOURCE_DESTINATION"
        });
      }
    },
    onModeChangeDS: function (e) {
      if (e.target.checked) {
        this.setState({
          mode: "DESTINATION_SOURCE"
        });
      }
    },
    onModeChangeAll: function (e) {
      if (e.target.checked) {
        this.setState({
          mode: "ALL",
          selectedId: 0,
          // TODO: order alphabetically
          ids: Object.keys(this.props.entries)
        });
      }
    },
    onMore: function () {
      this.props.store.dispatch({
        type: "SHOW_SHUFFLE_MENU",
        value: !this.props.shuffleMenuShow
      });
    },
    onFavourite: function (e) {
      e.stopPropagation();
      var id = e.target.parentNode.parentNode.dataset.id;
      this.props.store.dispatch({
        type: "ENTRY_TOGGLE_FAVOURITE",
        value: id
      });
    },
    onOnlyFavourites: function () {
      this.setState({
        onlyfavourites: !!!this.state.onlyfavourites
      });
    },
    render: function () {
      return React.createElement(
        "div",
        { id: "screen" },
        React.createElement(
          "div",
          { id: "navbar" },
          React.createElement(
            "div",
            { className: "navbarButtonContainer", id: "navbarLeft" },
            React.createElement(
              "button",
              { onClick: this.props.onBack },
              "<"
            )
          ),
          React.createElement(
            "div",
            { id: "navbarTitle" },
            "Shuffle"
          ),
          React.createElement(
            "div",
            { className: "navbarButtonContainer", id: "navbarRight" },
            React.createElement(
              "button",
              { onClick: this.onMore },
              "="
            )
          )
        ),
        React.createElement(
          "div",
          { id: "main" },
          React.createElement(
            "ul",
            { className: "listView" },
            this.state.ids.map(function (id) {
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
                favourite = React.createElement(
                  "button",
                  { onClick: this.onFavourite, className: favouriteClassName },
                  "*"
                );
              }

              var styleSource = {
                visibility: this.state.mode == "ALL" || this.state.mode == "SOURCE_DESTINATION" || id == this.state.selectedId ? "visible" : "hidden"
              };
              var styleDestination = {
                visibility: this.state.mode == "ALL" || this.state.mode == "DESTINATION_SOURCE" || id == this.state.selectedId ? "visible" : "hidden"
              };
              var style = {
                visibility: this.state.mode == "ALL" || id == this.state.selectedId ? "visible" : "hidden"
              };
              return React.createElement(
                "li",
                { onClick: this.onItemClick, "data-id": id, key: id },
                React.createElement(
                  "a",
                  null,
                  favourite,
                  React.createElement(
                    "div",
                    { className: "entryItemSource", style: styleSource },
                    entry.source
                  ),
                  React.createElement(
                    "div",
                    { className: "entryItemDestination", style: styleDestination },
                    entry.destination
                  ),
                  React.createElement(
                    "div",
                    { className: "entryItemPhone", style: style },
                    entry.phone
                  )
                )
              );
            }, this)
          )
        ),
        this.props.shuffleMenuShow ? React.createElement(
          "ul",
          { id: "popup", className: "listView" },
          React.createElement(
            "li",
            null,
            React.createElement(
              "button",
              { className: "primaryButton normalButton fullwidthButton", onClick: this.onShuffle },
              "Shuffle"
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              { htmlFor: "onlyFavourites" },
              React.createElement("input", { name: "mode", type: "checkbox",
                checked: this.state.onlyfavourites,
                id: "onlyFavourites",
                onChange: this.onOnlyFavourites }),
              React.createElement(
                "span",
                null,
                "Favourites only"
              )
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              { htmlFor: "modeSD" },
              React.createElement("input", { name: "mode", type: "radio",
                checked: this.state.mode == "SOURCE_DESTINATION",
                id: "modeSD",
                onChange: this.onModeChangeSD }),
              React.createElement(
                "span",
                null,
                "Show ",
                this.props.course.source_title
              )
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              { htmlFor: "modeDS" },
              React.createElement("input", { name: "mode", type: "radio",
                id: "modeDS",
                checked: this.state.mode == "DESTINATION_SOURCE",
                onChange: this.onModeChangeDS }),
              React.createElement(
                "span",
                null,
                "Show ",
                this.props.course.destination_title
              )
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              { htmlFor: "modeALL" },
              React.createElement("input", { name: "mode", type: "radio",
                id: "modeALL",
                checked: this.state.mode == "ALL",
                onChange: this.onModeChangeAll }),
              React.createElement(
                "span",
                null,
                "Show all"
              )
            )
          )
        ) : ""
      );
    }
  });
})(window);