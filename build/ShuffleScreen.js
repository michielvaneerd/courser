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
    onBack: function () {
      if (!this.props.forceBackToMainScreen) {
        this.props.store.dispatch({
          type: "SHOW_COURSE_SCREEN"
        });
      } else {
        this.props.onMain();
      }
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
    render: function () {
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "toolbar topToolbar" },
          React.createElement(
            "button",
            { onClick: this.onBack },
            "Back"
          ),
          React.createElement(
            "button",
            { onClick: this.onShuffle },
            "Shuffle"
          ),
          React.createElement("input", { name: "mode", type: "radio", checked: this.state.mode == "SOURCE_DESTINATION",
            onChange: this.onModeChangeSD }),
          React.createElement("input", { name: "mode", type: "radio", checked: this.state.mode == "DESTINATION_SOURCE",
            onChange: this.onModeChangeDS }),
          React.createElement("input", { name: "mode", type: "radio", checked: this.state.mode == "ALL",
            onChange: this.onModeChangeAll })
        ),
        React.createElement(
          "h2",
          null,
          "Hussle"
        ),
        React.createElement(
          "ul",
          null,
          this.state.ids.map(function (id) {
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
                "div",
                { style: styleSource },
                this.props.entries[id].source
              ),
              React.createElement(
                "div",
                { style: styleDestination },
                this.props.entries[id].destination
              ),
              React.createElement(
                "div",
                { style: style },
                this.props.entries[id].phone
              )
            );
          }, this)
        )
      );
    }
  });
})(window);